---
name: dox
description: Create, slim, repair, and maintain minimal cascading AGENTS.md context routes. Use for DOX setup, AGENTS.md hierarchy changes, context-bloat reduction, breadcrumb repair, or DOX validation.
---

# DOX Breadcrumbs

Maintain self-updating, minimal `AGENTS.md` context routing. An `AGENTS.md` file is
a breadcrumb plus a binding local contract, not a repository manual.

## Core rules

- Put only durable instructions whose omission could cause an agent to make a
  wrong edit.
- Keep cross-repository rules in root and only local differences in children.
- Never repeat an inherited rule. Link to the authoritative detail instead.
- Route explanations, architecture, procedures, examples, and history to normal
  documentation.
- Route temporary decisions to an issue, PR, spec, or handoff.
- Record a user preference only when it is a durable rule for future repository
  work. Product behavior belongs in code, tests, or a specification.
- Prefer deleting or replacing text over appending another warning.

## Before editing

1. Read the root `AGENTS.md` and only the child chain covering expected targets.
2. Use the nearest contract for local detail; a child cannot weaken a parent.
3. Do not initialize or expand DOX for read-only work or when instructions opt out.

## Route new information

| Information | Destination |
|---|---|
| Cross-cutting invariant | Root `AGENTS.md` |
| Subtree ownership, constraint, or exact check | Nearest child `AGENTS.md` |
| Explanation or operating procedure | Linked `docs/` page |
| Product behavior | Source, tests, or specification |
| Temporary or historical context | Issue, PR, handoff, or release record |

If a link supplies enough direction, do not copy its contents into DOX.

## Initialize

1. Inspect durable ownership boundaries and existing documentation.
2. Create the smallest useful root contract and direct-child index.
3. Add a child only when it has rules that cannot be inherited or linked.
4. Keep the hierarchy broad and shallow.
5. Copy `assets/dox.toml` to `<repo>/.dox.toml`.
6. Copy `scripts/validate_dox.py` to `<repo>/.dox/validate.py` so CI does not
   depend on a workstation plugin cache.
7. Add the repository's normal CI/test entry for `python3 .dox/validate.py .`.

Use `[paths].exclude` only for embedded templates, generated fixtures, or vendored
snapshots whose `AGENTS.md` files are source material rather than live contracts.

Use this child shape only when the section has useful content:

- Purpose
- Ownership
- Local Contracts
- Work Guidance
- Verification
- Child DOX Index

Every `AGENTS.md` needs a `Child DOX Index`; use `None.` when it has no children.
Do not invent guidance, ownership, or verification to fill a section.

## Maintain and slim

After a meaningful edit, check the owning chain. Most code changes do not change
DOX. Edit it only when a durable boundary, invariant, ownership rule, or exact
verification contract changed.

When DOX changes:

1. Update the nearest owner and affected indexes.
2. Remove stale, duplicated, explanatory, or misplaced text.
3. Move detail to documentation and leave one precise breadcrumb.
4. Keep the net context size flat or smaller unless a new durable boundary truly
   requires new instruction.
5. Refresh a repository-owned validator when its embedded version is older than
   this skill's validator.

## Validate

Run the repository-owned validator when present; otherwise run this skill's copy:

```bash
python3 .dox/validate.py .
# or
python3 <this-skill-directory>/scripts/validate_dox.py <repo-root>
```

Repair hierarchy, duplicate-content, and budget errors. Treat volatile-root-fact
warnings as prompts to move details into linked documentation. Report the largest
loaded chain and whether total DOX context grew or shrank.
