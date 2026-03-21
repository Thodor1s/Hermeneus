# hermeneus-genesis

Baseline decoder-only transformer training and citation-oriented retrieval for Hermeneus.

## Quick Start

Build a retrieval index:

```powershell
python -m hermeneus_genesis build-index --corpus ..\hermeneus-prosvasis\data\processed\corpus.jsonl --output .\artifacts\retrieval-index.json
```

Prepare a toy CPU training bundle:

```powershell
python -m hermeneus_genesis train --corpus ..\hermeneus-prosvasis\data\processed\corpus.jsonl --output .\artifacts\toy-train --config .\configs\training.toy.cpu.json
```
