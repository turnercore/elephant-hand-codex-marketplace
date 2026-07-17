---
name: grill-me
description: Stress-test a plan through focused questions while recording its decisions.
---

# Grill Me

Sharpen the user's idea or plan through a focused interview. Treat the user as
the decision-maker: investigate facts yourself, then ask the user only for
choices that cannot be discovered from the project.

## Start the session record

Before the first substantive question, find the repository's documentation or
planning convention and use it. Create a session record in that location. If
there is no convention, use `.scratch/grilling/YYYY-MM-DD-<short-slug>.md` at
the repository root. If the work has no repository, use the operating system's
temporary directory and tell the user the path.

At the top of the record, write the session's goal and links to relevant
existing plans, issues, or documents. Tell the user which file you are
maintaining. Update it as decisions are made; do not defer the documentation to
the end of the session.

Use this compact structure unless the repository already has a better one:

```md
# <Session title>

## Goal

## Decisions

## Constraints and evidence

## Open questions

## Next steps
```

Record resolved decisions with their rationale and record unanswered questions
as open. Do not present speculation as a settled decision.

## Interview

Walk the design tree branch by branch until there is a shared understanding.
For every question, provide a recommended answer and the trade-off behind it.

Ask one question at a time whenever a later question depends on the answer to
an earlier one. You may ask a small batch of two or three closely related
questions when each can be answered independently; say why they are grouped.
Never batch questions merely for convenience, or combine questions whose
answers would change the recommendation for another question. Wait for the
user's response before moving to the next dependent branch.

If a fact can be found by reading the repository, issue tracker, or existing
documentation, find it rather than asking. Surface contradictions between the
user's description and the project evidence so the user can decide which is
right. Probe ambiguous language and edge cases with concrete scenarios.

Do not enact the plan until the user confirms the shared understanding.

## Maintain project knowledge

Keep durable project knowledge alongside the session record:

- When a domain term is resolved, update the appropriate `CONTEXT.md` (or
  create one lazily). Keep it a concise glossary, not a plan or implementation
  notebook. Prefer one canonical term and list misleading alternatives under
  `_Avoid_`.
- If `CONTEXT-MAP.md` exists, use it to select the relevant context. Otherwise,
  use a root `CONTEXT.md` for a single-context repository.
- Create an ADR in `docs/adr/` only for a decision that is hard to reverse,
  surprising without context, and the result of a real trade-off. Number it
  after the highest existing ADR and state the context, decision, and why.

At the end, ensure the session record distinguishes decisions from open
questions and gives the user a clear next step.
