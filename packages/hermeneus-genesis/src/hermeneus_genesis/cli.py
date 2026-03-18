from __future__ import annotations

import argparse
from pathlib import Path

from .retrieval import answer_with_citations, build_retrieval_index
from .training import train_from_corpus


def main() -> None:
    parser = argparse.ArgumentParser(prog="hermeneus-genesis")
    subparsers = parser.add_subparsers(dest="command", required=True)

    train_parser = subparsers.add_parser("train", help="Train a baseline Greek model from scratch")
    train_parser.add_argument("--corpus", required=True, type=Path)
    train_parser.add_argument("--output", required=True, type=Path)
    train_parser.add_argument("--config", type=Path)

    retrieve_parser = subparsers.add_parser("build-index", help="Build retrieval index")
    retrieve_parser.add_argument("--corpus", required=True, type=Path)
    retrieve_parser.add_argument("--output", required=True, type=Path)

    answer_parser = subparsers.add_parser("answer", help="Retrieve passages and format citation-first answer")
    answer_parser.add_argument("--index", required=True, type=Path)
    answer_parser.add_argument("--question", required=True)

    args = parser.parse_args()

    if args.command == "train":
        train_from_corpus(args.corpus, args.output, args.config)
    elif args.command == "build-index":
        build_retrieval_index(args.corpus, args.output)
    elif args.command == "answer":
        print(answer_with_citations(args.index, args.question))


if __name__ == "__main__":
    main()
