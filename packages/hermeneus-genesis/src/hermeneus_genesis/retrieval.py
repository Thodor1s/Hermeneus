from __future__ import annotations

import json
import math
import re
from collections import Counter
from pathlib import Path
from typing import Any

from .greek_guard import bilingual_decline, is_greek_prompt

TOKEN_RE = re.compile(r"[^\W\d_]+", re.UNICODE)


def _tokenize(text: str) -> list[str]:
    return [token.lower() for token in TOKEN_RE.findall(text)]


def build_retrieval_index(corpus_path: Path, output_path: Path) -> None:
    passages = []
    doc_freq: Counter[str] = Counter()

    for line in corpus_path.read_text(encoding="utf-8").splitlines():
        record = json.loads(line)
        tokens = _tokenize(record["text"])
        doc_freq.update(set(tokens))
        passages.append({"record": record, "tokens": tokens})

    payload = {
        "documents": len(passages),
        "doc_freq": dict(doc_freq),
        "passages": passages,
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def _score(query_tokens: list[str], passage_tokens: list[str], doc_freq: dict[str, int], documents: int) -> float:
    term_counts = Counter(passage_tokens)
    score = 0.0
    for token in query_tokens:
      if token not in term_counts:
          continue
      idf = math.log((documents + 1) / (doc_freq.get(token, 0) + 1)) + 1
      score += term_counts[token] * idf
    return score


def answer_with_citations(index_path: Path, question: str, top_k: int = 3) -> str:
    if not is_greek_prompt(question):
        return bilingual_decline("English or another non-Greek language")

    payload: dict[str, Any] = json.loads(index_path.read_text(encoding="utf-8"))
    query_tokens = _tokenize(question)
    scored = []
    for item in payload["passages"]:
        score = _score(query_tokens, item["tokens"], payload["doc_freq"], payload["documents"])
        if score > 0:
            scored.append((score, item["record"]))
    scored.sort(key=lambda item: item[0], reverse=True)
    top = scored[:top_k]
    if not top:
        return "Δεν βρέθηκαν σχετικά χωρία στο τρέχον ευρετήριο."

    lines = ["Πιθανές σχετικές πηγές:"]
    for rank, (_, record) in enumerate(top, start=1):
        citation = record.get("citation", {})
        label = ", ".join(
            part
            for part in [
                citation.get("author"),
                citation.get("work"),
                citation.get("edition"),
                record.get("passage_id"),
            ]
            if part
        )
        lines.append(f"{rank}. {label}")
        lines.append(record["text"])
    return "\n\n".join(lines)
