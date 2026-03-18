# Source Governance Statement

Corpus construction in Hermeneus is subject to prior review. No source should be incorporated into the active corpus unless its inclusion has been examined and judged acceptable on legal, ethical, and scholarly grounds.

## Required Descriptive Fields

Each source record should include, at minimum, the following fields:

- `id`
- `title`
- `era`
- `language_form`
- `kind`
- `license`
- `citation`
- `inputs`

These fields are necessary not merely for technical processing, but for the later documentation, verification, and scholarly use of the corpus.

## Review Criteria

Before a source is enabled for ingestion, the following questions should be answered in the affirmative:

1. Is the text legally reusable within the scope of the project?
2. Is its inclusion ethically justified?
3. Is the material itself Greek text, rather than predominantly commentary in another language?
4. Where the text is translational in nature, does it serve a clearly Greek-to-Greek purpose?
5. Have sufficient bibliographical or editorial details been recorded to support later citation?

## Operational Rule

Within the current implementation, any source marked with `allowed: false` is excluded from ingestion by design. This rule is intended to ensure that corpus growth remains deliberate and reviewable rather than automatic.
