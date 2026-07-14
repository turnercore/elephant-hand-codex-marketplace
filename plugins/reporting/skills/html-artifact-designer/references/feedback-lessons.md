# Feedback Lessons

This file stores generalized lessons from user feedback on HTML artifacts.

Keep entries short:

- **Symptom:** What went wrong for the user.
- **General rule:** What future artifacts should do differently.
- **Applies to:** Artifact type or CSS/component area.

Fold repeated lessons into `SKILL.md`, `artifact-recipes.md`, or `elephant-hand-artifact.css` when they become stable rules.

## Current Lessons

- **Symptom:** Plain benchmark HTML looked like a minimally formatted document and was not easy to share or read.
  **General rule:** Reports and comparisons need first-viewport summary, metric cards, visual hierarchy, and a Tailscale-served URL.
  **Applies to:** Report.
- **Symptom:** Default artifact CSS could over-constrain design galleries or workbenches for another game, website, product, or brand.
  **General rule:** Treat bundled CSS as a default for ordinary artifacts, not mandatory styling. Use artifact-specific styling when the visual design itself is being explored.
  **Applies to:** Option Gallery, Workbench, CSS.
- **Symptom:** Default artifact CSS was created before inspecting the actual Elephant Hand website style.
  **General rule:** Default Elephant Hand artifacts should follow `Elephant-Hand-Games/elephant-hand-website`: woodblock-paper palette, deep blue ink, crimson actions, ochre/green/orange accents, 3px borders, and hard offset shadows.
  **Applies to:** Report, CSS.
- **Symptom:** HTML plans could drift from companion Markdown handoff files and make review harder.
  **General rule:** MD-backed plans should create the Markdown first, render it inside the HTML, include useful diagrams, embed the Markdown hash, and warn when the linked Markdown changes.
  **Applies to:** Plan.
- **Symptom:** Markdown freshness checks showed "hash not checked" on shared HTTP artifact URLs.
  **General rule:** Client-side hash checks must work on plain HTTP shares and should not depend only on secure-context Web Crypto APIs.
  **Applies to:** Plan, JavaScript.
- **Symptom:** Benchmark metric labels like "tool name" were ambiguous to read outside the scorer code.
  **General rule:** Reports should use domain-facing metric names and include a compact glossary for scorer terms.
  **Applies to:** Report, benchmark comparison.
- **Symptom:** A separate glossary still left benchmark table columns unclear while scanning.
  **General rule:** Put short definitions directly next to ambiguous table headers, preferably with visible sublabels and native hover titles.
  **Applies to:** Report, benchmark comparison.
