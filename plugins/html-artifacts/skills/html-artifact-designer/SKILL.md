---
name: html-artifact-designer
description: Create polished, readable static HTML artifacts for reports, plans, option galleries, and workbenches. Use when Codex needs to present results visually, explain an implementation plan, let the user choose between options, let the user tune/export something interactively, or incorporate feedback into future HTML artifact behavior.
---

# HTML Artifact Designer

## Workflow

Use this skill when an HTML artifact is the user-facing output. Compose it with `$share-static-html` after writing the file; sharing is automatic whenever this skill creates or updates an HTML artifact.

1. Pick exactly one primary artifact type: **Report**, **Plan**, **Option Gallery**, or **Workbench**. Mix types only when the user asks for it.
2. Create one self-contained `.html` file unless the artifact needs reusable assets. Use `assets/elephant-hand-artifact.css` only when it is the best default theme for the artifact.
3. Make the first viewport useful: title, context, primary result, and the most important next action or comparison.
4. Use real visual structure: metric strips, tables, grouped findings, charts with inline SVG or canvas, and compact cards for repeated items.
5. Check `references/feedback-lessons.md` for generalized lessons before finalizing.
6. Serve the finished HTML with:

```bash
python3 /home/turnercore/.codex/skills/share-static-html/scripts/serve_static_html.py /absolute/path/to/artifact.html
```

If multiple HTML artifacts are created, serve each one and return the Tailscale URLs.

## Artifact Types

### Report

Use for benchmark reports, model comparisons, audits, post-run summaries, research notes, dashboards, and status reports.

Must include:

- conclusion in the first viewport
- key metrics or findings above the fold
- evidence table or grouped findings
- caveats and test conditions
- next decision or recommended action

For comparisons, use comparable rows or cards with the same fields in the same order, deltas where there is a baseline, and badges for best/worst or selected/rejected.

Avoid: prose-only pages, buried numbers, unlabeled pass/fail states, unequal evidence in comparisons.

### Plan

Use when the user wants an implementation plan, technical spec, roadmap, architecture proposal, workflow design, or phased project plan made easy to understand.

Must include:

- goal and decision summary in the first viewport
- architecture or workflow diagram using inline SVG, Mermaid, or structured flow cards; diagrams must clarify execution, ownership, or data flow
- phased implementation sequence with dependencies
- contracts/interfaces or data shapes when relevant
- risks, validation gates, and explicit non-goals
- next action or smallest useful first version

Avoid: prose-only plans, hidden sequencing, vague owners/contracts, and diagrams that do not clarify execution.

For implementation plans that need durable handoff:

- Create the `.md` plan first as the canonical source, then create the `.html` plan as the readable review layer.
- Link the `.md` from the HTML and render the actual Markdown plan content inside the HTML for side-by-side review. Do not rely on the reader opening a second file to verify alignment.
- Embed the source Markdown SHA-256 hash in the HTML at creation time, for example `<meta name="source-md-sha256" content="...">` plus the linked Markdown path.
- Add a small client-side or clearly visible static warning block that compares the embedded hash to the current linked Markdown content when the page is served from the same directory. Use a check that works on plain HTTP shared URLs; do not rely only on `crypto.subtle`, which may be unavailable outside secure contexts. If the hash cannot be checked because browser fetch is blocked, show a neutral "hash not checked" note; if hashes differ, warn that the Markdown changed and the HTML is stale.
- Keep the Markdown handoff concise and implementation-ready; use the HTML for visualization, hierarchy, diagrams, tables, and review affordances.

### Option Gallery

Use when the user wants to inspect multiple UI directions, prompt variants, layouts, or implementation choices before choosing one.

Must include:

- clearly labeled options
- visual preview or realistic compact mock for each option
- strengths, tradeoffs, and recommended use
- a simple way to refer to an option by name or number

Avoid: generic cards that all look the same, options without tradeoffs.

### Workbench

Use when the user should fiddle with knobs before exporting something: prompts, thresholds, copy, theme values, scoring weights, filters, generated config, or a short-lived prototype.

Must include:

- controls on the same screen as the output they affect
- current value labels for sliders/toggles
- copy/export button when the output is meant to leave the page
- reset/default control when values are easy to over-adjust

Use plain browser APIs unless the user asked for a real app. Avoid build steps for short-lived workbenches.

## Design Rules

- Prefer dense, readable application UI over marketing pages.
- Use restrained surfaces: page bands, tables, compact cards, and clear section rhythm.
- Use the Elephant Hand artifact CSS for default report/workbench chrome when no more specific visual language is needed. It is based on the `Elephant-Hand-Games/elephant-hand-website` woodblock-paper style: warm paper, deep blue ink, crimson actions, ochre/green/orange accents, 3px borders, hard offset shadows, uppercase UI labels, and editorial body copy.
- Do not force the default CSS onto a design gallery or workbench whose purpose is exploring another game, website, product, brand, or proposed visual direction. In those cases, style the artifact to fit the thing being explored.
- Do not make the page look like a Markdown export in a browser. Add navigation, hierarchy, and visual summaries.
- Do not hide important numbers in paragraphs. Put key metrics in cards or tables.
- Use color semantically:
  - green: pass/improvement
  - red: fail/regression
  - amber: caution
  - blue: neutral info
- Keep text scannable. Use short headings, one idea per paragraph, and tables for comparisons.
- Make mobile usable: no fixed wide layouts, no overflowing tables without an `.overflow` wrapper.

## Assets

The bundled CSS is a default, not a requirement. Use it for ordinary reports, comparisons, dashboards, and utility workbenches where the artifact style is not the subject.

The default CSS may import Google Fonts for `Noto Sans` and `Radley`, with system fallbacks. Copy local font files only when the artifact must work offline or avoid external requests.

Skip it when:

- the user asks for design options in another visual language
- the gallery previews a game, website, app, brand, or product style
- the workbench's controls/output need to demonstrate a proposed interface style
- another repo or product already has a design system that should be followed

When using the default CSS, copy or link:

```html
<link rel="stylesheet" href="./elephant-hand-artifact.css">
```

Source asset:

```text
/home/turnercore/.codex/skills/html-artifact-designer/assets/elephant-hand-artifact.css
```

If the HTML lives outside the skill folder, copy the CSS next to it:

```bash
cp /home/turnercore/.codex/skills/html-artifact-designer/assets/elephant-hand-artifact.css /path/to/output/
```

For one-off reports, embedding the CSS in a `<style>` tag is acceptable when it keeps sharing simpler.

## Feedback Loop

When the user says an HTML artifact is hard to read, ugly, confusing, broken, missing a useful control, or otherwise not right:

1. Fix the current artifact if the user still needs it.
2. Extract the generalized lesson, not the one-off complaint.
3. Update this skill when the lesson changes future behavior:
   - reusable layout/control rule -> `SKILL.md`
   - artifact-specific recipe -> `references/artifact-recipes.md`
   - visual styling/token rule -> `assets/elephant-hand-artifact.css`
   - accumulated small lesson -> `references/feedback-lessons.md`
4. Keep feedback entries short and operational. Delete or fold stale lessons when they become core rules.

Do not add a lesson for pure taste unless it is likely to recur.

## Validation

Before final response:

- Open or inspect the file enough to catch obvious broken links and malformed HTML.
- If the page has JS controls, run a browser check when practical.
- Serve it with `$share-static-html` and return the Tailscale URL.
