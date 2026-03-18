from __future__ import annotations

import argparse
from pathlib import Path

from .pipeline import aggregate_corpus


def main() -> None:
    parser = argparse.ArgumentParser(prog="hermeneus-prosvasis")
    subparsers = parser.add_subparsers(dest="command", required=True)

    aggregate_parser = subparsers.add_parser("aggregate", help="Aggregate corpus sources")
    aggregate_parser.add_argument("--config", required=True, type=Path, help="Path to source config JSON")

    args = parser.parse_args()

    if args.command == "aggregate":
        summary = aggregate_corpus(args.config)
        print(summary)


if __name__ == "__main__":
    main()
