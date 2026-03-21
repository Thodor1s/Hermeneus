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
- The corpus is intended to represent Greek diachronically, while in its present phase it excludes pre-alphabetic writing systems such as Linear B, the focus of the corpus at first is Modern Greek.
- Browser-based inference is treated as an experimental option for small models only, not as the default assumption for the principal research system.

## Ownership

The owner of this project is Theodred Bizmpianos. This is an ethical, non-commercial AI project. If you want to access the alpha or contribute to this project or fork this project, please visit the Paradigms website and fill in the contact form as always https://paradigms.gr/home, or e-mail me at theo@paragims.gr.
