---
name: dox
description: Initialize and maintain repository AGENTS.md hierarchies.
---

# DOX

Keep repository instructions current through a root `AGENTS.md` contract and scoped child `AGENTS.md` files.

## Decide Before Editing

1. Read the applicable root `AGENTS.md` and every existing child `AGENTS.md` on paths the task may touch.
2. Treat an explicit `no DOX`, `disable DOX`, `do not use DOX`, or equivalent instruction as an opt-out. Do not install or expand DOX; continue under the existing instructions.
3. Do not auto-install DOX for read-only review, explanation, diagnosis, exploration, or status work.
4. For a task that will meaningfully edit a repository, initialize DOX when the root instructions do not already contain the DOX core contract and child index.
5. If DOX is already present, maintain it after meaningful changes instead of reinstalling it.

## Initialize DOX

1. Treat this skill as the canonical DOX contract.
2. Inspect repository structure, durable ownership boundaries, existing documentation, tests, CI, and workflows before choosing child scopes.
3. Create or merge the root `AGENTS.md`:
   - Preserve all existing project and user instructions.
   - Add the DOX core contract without duplicating equivalent rules.
   - Replace the placeholder Child DOX Index with the actual direct-child index.
4. Create child `AGENTS.md` files only for durable boundaries with distinct purpose, ownership, contracts, workflow, or verification.
5. Keep the first hierarchy broad and shallow. Add deeper children only when their rules differ materially from their parent.
6. Never replace existing repository instructions wholesale with the DOX contract.
7. Keep initialization idempotent: rerunning it must not duplicate rules, sections, or index entries.

Use this section order for child files:

- Purpose
- Ownership
- Local Contracts
- Work Guidance
- Verification
- Child DOX Index

Write each direct child as a relative Markdown link, for example `- [src](src/AGENTS.md)`. Use `None` when there are no child contracts.

Leave `Work Guidance` or `Verification` empty when no repository evidence supports content. Do not invent commands, owners, or policies.

## Work Under DOX

- Before editing, walk from the repository root to every target and read each `AGENTS.md` on the route.
- The nearest file controls local details; child instructions may not weaken the root DOX contract.
- Keep broad rules in parents and concrete subtree rules in children.
- Avoid duplicating the same decision across the hierarchy.
- Delete stale instructions instead of preserving historical commentary.

## Maintain After Editing

Perform a DOX pass after every meaningful change. Update the nearest owning `AGENTS.md` when the change affects purpose, ownership, structure, contracts, workflows, commands, artifacts, permissions, side effects, or verification. Update parents when their child index or parent-level contract changes.

Small implementation edits that do not change durable behavior or contracts require the pass but may leave documentation unchanged.

## Close Out

1. Re-check every changed path against its complete DOX chain.
2. Refresh affected Child DOX Index entries.
3. Remove stale or contradictory text.
4. Run `python3 <this-skill-directory>/scripts/validate_dox.py <repo-root>`. Repair reported hierarchy errors, then rerun it.
5. Run any additional repository validation relevant to changed docs or structure.
6. Report whether DOX was initialized, updated, already current, or explicitly skipped due to opt-out/read-only scope.
