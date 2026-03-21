from __future__ import annotations

import json
import re
import urllib.request
from urllib.parse import urlencode
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from .greek import greek_ratio, mostly_greek


@dataclass
class SourceInput:
    type: str
    path: str | None = None
    url: str | None = None
    api_url: str | None = None
    page_title: str | None = None


@dataclass
class SourceConfig:
    id: str
    title: str
    era: str
    language_form: str
    kind: str
    license: str
    allowed: bool
    citation: dict[str, Any]
    inputs: list[SourceInput]


USER_AGENT = "HermeneusProsvasis/0.1 (+https://github.com/; research ingestion)"


def _load_config(path: Path) -> tuple[Path, list[SourceConfig]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    base_dir = path.resolve().parent
    output_root = _resolve_path(base_dir, payload["output_root"])
    sources = []
    for item in payload["sources"]:
        inputs = [SourceInput(**input_item) for input_item in item["inputs"]]
        sources.append(SourceConfig(inputs=inputs, **{k: v for k, v in item.items() if k != "inputs"}))
    return output_root, sources


def _resolve_path(base_dir: Path, raw_path: str) -> Path:
    path = Path(raw_path)
    if path.is_absolute():
        return path
    return (base_dir / path).resolve()


def _fetch_text(url: str) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read().decode("utf-8")


def _read_input(source_input: SourceInput, base_dir: Path) -> str:
    if source_input.type == "local_file" and source_input.path:
        return _resolve_path(base_dir, source_input.path).read_text(encoding="utf-8")
    if source_input.type == "remote_text" and source_input.url:
        return _fetch_text(source_input.url)
    if source_input.type == "mediawiki_extract" and source_input.api_url and source_input.page_title:
        query = urlencode(
            {
                "action": "query",
                "format": "json",
                "prop": "extracts",
                "explaintext": 1,
                "redirects": 1,
                "titles": source_input.page_title,
            }
        )
        payload = json.loads(_fetch_text(f"{source_input.api_url}?{query}"))
        pages = payload.get("query", {}).get("pages", {})
        for page in pages.values():
            extract = page.get("extract")
            if extract:
                return extract
        raise ValueError(f"MediaWiki page returned no extract: {source_input.page_title}")
    raise ValueError(f"Unsupported source input: {source_input.type}")


def _normalize_text(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _segment_text(text: str) -> list[str]:
    chunks = []
    current: list[str] = []
    for line in text.splitlines():
        if line.strip():
            current.append(line.strip())
            continue
        if current:
            chunks.append(" ".join(current))
            current = []
    if current:
        chunks.append(" ".join(current))
    return [chunk for chunk in chunks if len(chunk) >= 40]


def aggregate_corpus(config_path: Path) -> str:
    config_path = config_path.resolve()
    base_dir = config_path.parent
    output_root, sources = _load_config(config_path)
    raw_dir = output_root / "raw"
    processed_dir = output_root / "processed"
    indexes_dir = output_root / "indexes"
    raw_dir.mkdir(parents=True, exist_ok=True)
    processed_dir.mkdir(parents=True, exist_ok=True)
    indexes_dir.mkdir(parents=True, exist_ok=True)

    corpus_path = processed_dir / "corpus.jsonl"
    manifest_path = indexes_dir / "manifest.json"
    manifest: list[dict[str, Any]] = []
    kept_passages = 0

    with corpus_path.open("w", encoding="utf-8") as corpus_file:
        for source in sources:
            source_record: dict[str, Any] = {
                "id": source.id,
                "title": source.title,
                "allowed": source.allowed,
                "license": source.license,
                "era": source.era,
                "language_form": source.language_form,
                "kind": source.kind,
                "citation": source.citation,
                "ingested_at": datetime.now(UTC).isoformat(),
                "passages": 0,
            }

            if not source.allowed:
                source_record["status"] = "skipped_not_approved"
                manifest.append(source_record)
                continue

            merged = []
            for index, source_input in enumerate(source.inputs, start=1):
                text = _normalize_text(_read_input(source_input, base_dir))
                raw_snapshot = raw_dir / f"{source.id}-{index}.txt"
                raw_snapshot.write_text(text, encoding="utf-8")
                merged.append(text)

            full_text = "\n\n".join(merged)
            passages = _segment_text(full_text)
            for passage_index, passage in enumerate(passages, start=1):
                if not mostly_greek(passage):
                    continue
                record = {
                    "source_id": source.id,
                    "passage_id": f"{source.id}:{passage_index}",
                    "text": passage,
                    "greek_ratio": round(greek_ratio(passage), 4),
                    "era": source.era,
                    "language_form": source.language_form,
                    "kind": source.kind,
                    "citation": source.citation,
                }
                corpus_file.write(json.dumps(record, ensure_ascii=False) + "\n")
                kept_passages += 1
                source_record["passages"] += 1

            source_record["status"] = "ingested"
            manifest.append(source_record)

    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    return f"Aggregated {kept_passages} passages from {len(sources)} sources into {corpus_path}"
