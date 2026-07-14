---
name: drawio
description: Create verified Draw.io architecture and flow diagrams.
---

# Draw.io

Create native `.drawio` files from verified project facts, then optionally export SVG, PNG, PDF, or JPG with draw.io Desktop. Prefer accuracy and human comprehension over decorative completeness.

## Explicit Invocation

Treat these as direct requests to use this skill:

```text
$drawio diagram the whole repo
$drawio diagram subsystem packages/api
$drawio create architecture diagram for the auth flow
/drawio repo
/drawio subsystem <path-or-name>
/drawio svg sequence diagram for checkout
```

If the user says "diagram the whole repo", follow `references/repo-scan.md`. If the user says "diagram a subsystem", follow `references/subsystem-scan.md`.

## Workflow

1. Identify the requested diagram scope, output path, and export format.
2. Inspect the real source first. Do not invent services, files, data stores, queues, APIs, or relationships.
3. Record the evidence you used: file paths, manifests, routes, schemas, configs, tests, docs, and runtime wiring.
4. Choose the smallest useful diagram:
   - repo overview: top-level packages/services and boundaries.
   - subsystem map: files/classes/functions/data flow inside one area.
   - sequence: ordered calls across actors.
   - ER/schema: persisted entities and relationships.
   - plan/debug map: intended path, changed path, or diagnostic path.
5. Generate native draw.io `mxGraphModel` XML. Do not save Mermaid, PlantUML, CSV, or pseudo-code as `.drawio`.
6. Write a `.drawio` source file. For repo-readable output, also export `.drawio.svg` when draw.io Desktop is available.
7. Validate XML and run the layout checker.
8. Visually inspect exported SVG/PNG/PDF when possible; fix clipping, overlaps, unreadable labels, and confusing containment.
9. Return the created file paths and a short evidence summary. Call out unknowns explicitly.

## Output Rules

- Always keep the `.drawio` source file.
- Prefer SVG for committed/readable diagrams: `name.drawio` plus `name.drawio.svg`.
- Use PNG only when bitmap previews are needed.
- Use PDF for printable/shareable snapshots.
- Use lowercase hyphenated names unless preserving a ticket/id from the user.
- If no location is requested, use an existing diagram directory if present; otherwise use `docs/diagrams/` for repo work or the current directory for one-off diagrams.

## Accuracy Rules

- Every node and edge must trace to evidence. If evidence is incomplete, label the node `Unknown` or omit it.
- Distinguish confirmed flow from inferred flow in labels or final notes.
- Prefer exact code paths in small text labels for repo/subsystem diagrams.
- Read existing docs and diagrams first; update them when the user asks, instead of creating duplicates.
- Do not show a database, queue, service, auth provider, cache, or deployment target unless it is present in code/config/docs or clearly named by the user.
- Do not collapse multiple unrelated systems into one box just to make the diagram pretty; split diagrams instead.

## References

Read only what the task needs:

- `references/repo-scan.md` - whole-repo discovery and evidence gathering.
- `references/subsystem-scan.md` - focused subsystem scans.
- `references/drawio-xml.md` - valid `.drawio` XML patterns.
- `references/layout-quality.md` - visual hierarchy, readability, and diagram type guidance.

## Scripts

Use absolute paths when calling scripts from another directory:

```bash
<skill>/scripts/check-drawio-layout.py diagram.drawio
<skill>/scripts/postprocess-drawio.sh diagram.drawio
<skill>/scripts/drawio-export.sh diagram.drawio svg diagram.drawio.svg
<skill>/scripts/open-result.sh diagram.drawio.svg
```

Export requires draw.io Desktop. If the CLI is missing, keep the `.drawio` file and report that export was skipped.

## Minimal Validation

Run at least:

```bash
python3 - <<'PY' diagram.drawio
import sys, xml.etree.ElementTree as ET
ET.parse(sys.argv[1])
print("XML OK")
PY
```

Then run:

```bash
<skill>/scripts/check-drawio-layout.py diagram.drawio
```
