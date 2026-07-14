# Layout Quality

The output must be useful to humans, not merely valid XML.

## Visual Hierarchy

- One diagram should answer one primary question; make that the title.
- Put the main system/component in the strongest position: center for maps, left/top for flows.
- Use 2-4 visual groups. Split the diagram when more groups are needed.
- Use restrained color to encode type or boundary, not decoration.
- Avoid decorative card clusters, heavy shadows, gradients, and unnecessary icon noise.
- Prefer utility labels: service name, role, and code path.
- Keep text readable when the SVG is viewed in a repo preview.

## Required Layout Checks

- Keep visible elements at least 40 px inside page bounds.
- Keep at least 40 px between peer nodes and 60 px between major rows.
- Keep nodes away from container borders and swimlane headers.
- Avoid edge labels by default.
- Avoid diagonal lines; use orthogonal edges and waypoints.
- Avoid arrows through node text.
- Place containers behind children.
- Export SVG/PNG when possible and inspect the render before finalizing.

## Diagram Types

### Repo Overview

Show top-level apps/packages/services, major data stores, external systems, and 3-7 important flows. Do not include every file.

### Subsystem Map

Show entry points, core modules, internal collaborators, external dependencies, and exact code paths.

### Sequence Diagram

Show ordered calls. Use actors/services as columns and arrows as calls/events. Keep timing labels short.

### ER/Schema Diagram

Show persisted entities/tables, primary relationships, and only the most important fields. Avoid dumping every column unless asked.

### Plan Diagram

Show intended change boundary, affected components, new/changed flows, and explicit unknowns. Do not claim future behavior is already implemented.

### Debug Diagram

Show symptom, entry point, suspected path, observability/log locations, and known decision points.

## Final Self-Review

Before responding:

- Is anything clipped?
- Are labels readable?
- Do arrows cross important text?
- Are boundaries clear?
- Can a human find the relevant code paths from the diagram?
- Did every drawn relationship come from evidence?
