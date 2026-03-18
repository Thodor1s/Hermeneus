# Hermeneus

Hermeneus is an informal project concerned with the construction of a Greek-language large language model trained from the ground up on a diachronic corpus of Greek texts. Its principal aim is the study and computational treatment of Greek across historical periods, from archaic alphabetic Greek to the modern language, under legal, ethical, and philological constraints.

The project is organised into three components:

- `hermeneus-prosvasis`, which is responsible for the collection, description, normalisation, and indexing of the textual corpus;
- `hermeneus-genesis`, which is responsible for model training and for the retrieval structures required for source-based response generation;
- `hermeneus-chrisis`, which is the user-facing web application through which authenticated researchers may access the system.

## Repository Structure

```text
apps/
  hermeneus-chrisis/
packages/
  hermeneus-prosvasis/
  hermeneus-genesis/
docs/
```

## Research Principles

The project proceeds on the following methodological principles:

- The training corpus is restricted to Greek-language material. Explanatory material in languages other than Greek is excluded, unless it forms part of a justified processing workflow.
- Corpus acquisition must remain legally permissible and ethically defensible.
- Source attribution is treated as a retrieval problem rather than as a property that can be inferred reliably from model parameters alone.
- The corpus is intended to represent Greek diachronically, while in its present phase it excludes pre-alphabetic writing systems such as Linear B.
- Browser-based inference is treated as an experimental option for small models only, not as the default assumption for the principal research system.

## Operational Notes

The repository already contains an initial implementation scaffold for the three components above. Netlify deployment settings are defined in [netlify.toml](/c:/Users/tbizmpia/Github/Hermeneus/netlify.toml), Firestore access rules are defined in [firestore.rules](/c:/Users/tbizmpia/Github/Hermeneus/firebase/firestore.rules), and source-governance criteria are set out in [sources-governance.md](/c:/Users/tbizmpia/Github/Hermeneus/docs/sources-governance.md).

For a fuller statement of the system design and the rationale behind it, see [architecture.md](/c:/Users/tbizmpia/Github/Hermeneus/docs/architecture.md) and [serverless-feasibility.md](/c:/Users/tbizmpia/Github/Hermeneus/docs/serverless-feasibility.md).

## Ownership

The owner of this project is Theodred Bizmpianos, and this project falls under the Paradigms volunteer group (learn more about Paradigms and our mission at https://paradigms.gr). This is an ethical, non-commercial AI project. This is the first Paradigms project that operates under a Public repository. If you want to access the alpha or contribute to this project, please visit the Paradimgs website and contact us, or e-mail theo@paragims.gr.