# Artifact Recipes

Read this when the selected artifact type needs more concrete structure than `SKILL.md`.

## Report

Sections:

1. Hero with run name, date, dataset, environment, and one-sentence conclusion.
2. Metric grid with exact match, valid call rate, latency p50/p95, and failure count.
3. Comparison table with deltas.
4. Failure breakdown table.
5. Notes and caveats.

### Model Or Variant Comparison

Include:

- model id and backend
- prompt format
- token budget
- quantization
- throughput or latency
- quality metric
- acceptance caveat

Use badges for "best quality", "fastest", and "needs parser work".

### Plan Or Decision Map

Useful sections:

1. Current state.
2. Target state.
3. Phases or branches.
4. Risks and blockers.
5. Next action.

## Option Gallery

Each option:

- title
- preview or compact mock
- when it fits
- tradeoff
- suggested next iteration
- stable option id such as A, B, C or a short memorable name

## Workbench

Minimum controls:

- input textarea
- mode selector
- output textarea
- copy button
- export button if the output is meant to become a file
- reset button for defaults

### Short-Lived Prototype

Keep it one file when possible. Use inline JS and CSS unless the prototype needs external data or reusable assets.
