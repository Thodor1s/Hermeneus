# hermeneus-prosvasis

Aggregates, normalizes, filters, and indexes legally usable Greek texts.

## Running

Install the package in editable mode and then run:

```powershell
python -m hermeneus_prosvasis aggregate --config .\config\sources.wikipedia.seed.json
```

For a larger Greek Wikipedia starter corpus:

```powershell
python -m hermeneus_prosvasis aggregate --config .\config\sources.wikipedia.expanded.json
```

## Input Types

- `local_file`: read UTF-8 text from a local file path.
- `remote_text`: fetch a raw UTF-8 text file from a URL.
- `mediawiki_extract`: fetch plain-text page extracts from a MediaWiki API endpoint such as Greek Wikipedia.

## Seed Corpus

The file `config/sources.wikipedia.seed.json` provides a basic real-data seed corpus backed by Greek Wikipedia API extracts. This is suitable for initial experimentation, but it is not a substitute for a reviewed scholarly corpus. Wikimedia text reuse still requires attribution and license compliance.

The file `config/sources.wikipedia.expanded.json` provides a larger curated starter set from Greek Wikipedia across geography, history, philosophy, literature, language, and science.
