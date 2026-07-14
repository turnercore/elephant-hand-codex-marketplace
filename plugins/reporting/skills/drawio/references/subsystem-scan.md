# Subsystem Scan

Use this for `/drawio subsystem <path-or-name>`, `$drawio diagram subsystem ...`, or focused diagrams for one feature/package/service.

## Goal

Map the real structure and flow inside one subsystem so a human can diagnose issues and point an agent to the right files.

## Scan Order

1. Resolve the subsystem:
   - exact path from the user, or
   - package/app name from manifests, or
   - feature name found with `rg`.
2. Read local instructions and docs near it:
   - `README*`, `AGENTS.md`, docs under the subsystem.
3. Inventory files:
   - `find <path> -maxdepth 3 -type f`
   - skip generated/build/vendor directories.
4. Identify public entry points:
   - routes, exports, CLI commands, background handlers, UI screens, tests.
5. Trace callers and callees:
   - imports from outside the subsystem.
   - exports used outside the subsystem.
   - database, queue, filesystem, network, or external API access.
6. Read representative tests to confirm intended behavior.

## Diagram Shape

- Put entry points on the left/top.
- Put core domain logic in the center.
- Put persistence/external side effects on the right/bottom.
- Group by folder/module boundary, not by arbitrary layers.
- Label nodes with both role and path, for example:
  - `Auth routes`
  - `apps/api/src/auth/routes.ts`
- Use sequence diagrams for request/call order.
- Use component maps for ownership and boundaries.
- Use state/flow diagrams for lifecycle-heavy code.

## Accuracy Checks

- Every edge should correspond to an import, call path, route, config reference, test, or documented relationship.
- If dynamic registration hides the link, label the edge as inferred and cite the registration file in the final response.
- Do not draw files that are merely nearby but not part of the flow.
- If the subsystem is too large, split into one overview plus 1-3 focused diagrams.
