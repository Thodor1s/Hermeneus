from __future__ import annotations

import json
from pathlib import Path
from typing import Any

DEFAULT_CONFIG = {
    "block_size": 256,
    "batch_size": 8,
    "embed_dim": 256,
    "num_heads": 4,
    "num_layers": 4,
    "dropout": 0.1,
    "learning_rate": 3e-4,
    "steps": 5000,
    "eval_interval": 250,
    "device": "cuda",
}


def _load_training_config(config_path: Path | None) -> dict[str, Any]:
    if config_path is None:
        return dict(DEFAULT_CONFIG)
    payload = json.loads(config_path.read_text(encoding="utf-8"))
    merged = dict(DEFAULT_CONFIG)
    merged.update(payload)
    return merged


def _load_corpus_text(corpus_path: Path) -> str:
    chunks = []
    for line in corpus_path.read_text(encoding="utf-8").splitlines():
        record = json.loads(line)
        chunks.append(record["text"])
    return "\n".join(chunks)


def _training_script_text() -> str:
    return """from __future__ import annotations

import json
from pathlib import Path

import torch
import torch.nn as nn
import torch.nn.functional as F


class Head(nn.Module):
    def __init__(self, embed_dim: int, head_size: int, block_size: int, dropout: float) -> None:
        super().__init__()
        self.key = nn.Linear(embed_dim, head_size, bias=False)
        self.query = nn.Linear(embed_dim, head_size, bias=False)
        self.value = nn.Linear(embed_dim, head_size, bias=False)
        self.register_buffer("tril", torch.tril(torch.ones(block_size, block_size)))
        self.dropout = nn.Dropout(dropout)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        _, t, c = x.shape
        k = self.key(x)
        q = self.query(x)
        weights = q @ k.transpose(-2, -1) * (c ** -0.5)
        weights = weights.masked_fill(self.tril[:t, :t] == 0, float("-inf"))
        weights = F.softmax(weights, dim=-1)
        weights = self.dropout(weights)
        v = self.value(x)
        return weights @ v


class MultiHeadAttention(nn.Module):
    def __init__(self, num_heads: int, embed_dim: int, block_size: int, dropout: float) -> None:
        super().__init__()
        head_size = embed_dim // num_heads
        self.heads = nn.ModuleList(
            Head(embed_dim=embed_dim, head_size=head_size, block_size=block_size, dropout=dropout)
            for _ in range(num_heads)
        )
        self.proj = nn.Linear(embed_dim, embed_dim)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        out = torch.cat([head(x) for head in self.heads], dim=-1)
        return self.dropout(self.proj(out))


class FeedForward(nn.Module):
    def __init__(self, embed_dim: int, dropout: float) -> None:
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(embed_dim, 4 * embed_dim),
            nn.GELU(),
            nn.Linear(4 * embed_dim, embed_dim),
            nn.Dropout(dropout),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


class Block(nn.Module):
    def __init__(self, embed_dim: int, num_heads: int, block_size: int, dropout: float) -> None:
        super().__init__()
        self.sa = MultiHeadAttention(num_heads=num_heads, embed_dim=embed_dim, block_size=block_size, dropout=dropout)
        self.ffwd = FeedForward(embed_dim=embed_dim, dropout=dropout)
        self.ln1 = nn.LayerNorm(embed_dim)
        self.ln2 = nn.LayerNorm(embed_dim)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = x + self.sa(self.ln1(x))
        x = x + self.ffwd(self.ln2(x))
        return x


class GreekTransformer(nn.Module):
    def __init__(self, vocab_size: int, block_size: int, embed_dim: int, num_heads: int, num_layers: int, dropout: float) -> None:
        super().__init__()
        self.block_size = block_size
        self.token_embedding = nn.Embedding(vocab_size, embed_dim)
        self.position_embedding = nn.Embedding(block_size, embed_dim)
        self.blocks = nn.Sequential(
            *[Block(embed_dim=embed_dim, num_heads=num_heads, block_size=block_size, dropout=dropout) for _ in range(num_layers)]
        )
        self.ln_f = nn.LayerNorm(embed_dim)
        self.head = nn.Linear(embed_dim, vocab_size)

    def forward(self, idx: torch.Tensor, targets: torch.Tensor | None = None) -> tuple[torch.Tensor, torch.Tensor | None]:
        _, t = idx.shape
        token_emb = self.token_embedding(idx)
        pos_emb = self.position_embedding(torch.arange(t, device=idx.device))
        x = token_emb + pos_emb
        x = self.blocks(x)
        x = self.ln_f(x)
        logits = self.head(x)
        loss = None
        if targets is not None:
            bsz, steps, channels = logits.shape
            loss = F.cross_entropy(logits.view(bsz * steps, channels), targets.view(bsz * steps))
        return logits, loss

    def generate(self, idx: torch.Tensor, max_new_tokens: int) -> torch.Tensor:
        for _ in range(max_new_tokens):
            idx_cond = idx[:, -self.block_size :]
            logits, _ = self(idx_cond)
            logits = logits[:, -1, :]
            probs = F.softmax(logits, dim=-1)
            next_idx = torch.multinomial(probs, num_samples=1)
            idx = torch.cat((idx, next_idx), dim=1)
        return idx


def main() -> None:
    config = json.loads(Path("training_config.json").read_text(encoding="utf-8"))
    text = Path("train.txt").read_text(encoding="utf-8")

    chars = sorted(list(set(text)))
    stoi = {ch: i for i, ch in enumerate(chars)}
    itos = {i: ch for ch, i in stoi.items()}
    encode = lambda s: [stoi[c] for c in s]
    decode = lambda ids: "".join(itos[i] for i in ids)

    data = torch.tensor(encode(text), dtype=torch.long)
    n = int(0.9 * len(data))
    train_data = data[:n]
    val_data = data[n:]
    device = config["device"] if torch.cuda.is_available() else "cpu"

    def get_batch(split: str) -> tuple[torch.Tensor, torch.Tensor]:
        source = train_data if split == "train" else val_data
        positions = torch.randint(len(source) - config["block_size"] - 1, (config["batch_size"],))
        x = torch.stack([source[pos : pos + config["block_size"]] for pos in positions])
        y = torch.stack([source[pos + 1 : pos + config["block_size"] + 1] for pos in positions])
        return x.to(device), y.to(device)

    model = GreekTransformer(
        vocab_size=len(chars),
        block_size=config["block_size"],
        embed_dim=config["embed_dim"],
        num_heads=config["num_heads"],
        num_layers=config["num_layers"],
        dropout=config["dropout"],
    ).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=config["learning_rate"])

    @torch.no_grad()
    def estimate_loss() -> dict[str, float]:
        losses = {}
        model.eval()
        for split in ("train", "val"):
            values = []
            for _ in range(20):
                xb, yb = get_batch(split)
                _, loss = model(xb, yb)
                values.append(float(loss.item()))
            losses[split] = sum(values) / len(values)
        model.train()
        return losses

    for step in range(config["steps"]):
        if step % config["eval_interval"] == 0:
            losses = estimate_loss()
            print(f"step={step} train_loss={losses['train']:.4f} val_loss={losses['val']:.4f}")
        xb, yb = get_batch("train")
        _, loss = model(xb, yb)
        optimizer.zero_grad(set_to_none=True)
        loss.backward()
        optimizer.step()

    torch.save({"model_state_dict": model.state_dict(), "vocab": chars, "config": config}, "model.pt")
    context = torch.zeros((1, 1), dtype=torch.long, device=device)
    sample = decode(model.generate(context, max_new_tokens=400)[0].tolist())
    Path("sample.txt").write_text(sample, encoding="utf-8")


if __name__ == "__main__":
    main()
"""


def train_from_corpus(corpus_path: Path, output_dir: Path, config_path: Path | None = None) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    config = _load_training_config(config_path)
    train_text = _load_corpus_text(corpus_path)
    (output_dir / "train.txt").write_text(train_text, encoding="utf-8")
    (output_dir / "training_config.json").write_text(json.dumps(config, indent=2), encoding="utf-8")
    (output_dir / "train_baseline.py").write_text(_training_script_text(), encoding="utf-8")
    (output_dir / "RUN.txt").write_text(
        "Install PyTorch in your training environment, then run:\npython train_baseline.py\n",
        encoding="utf-8",
    )
    print(f"Training bundle written to {output_dir}")
