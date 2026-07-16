# Model selection

Use this card as the current authoritative routing guide. Choose by context volume, judgment required, and verification risk—not by habit.

| Model | Reasoning | Use for |
| --- | --- | --- |
| `5.6-luna` | `high` | Cheapest default for narrow, mechanical, clearly verifiable work. |
| `5.6-luna` | `xhigh` | Bounded work that needs more sustained reasoning but not large-context synthesis. |
| `5.6-terra` | `medium` | Economical retrieval and scanning across large context when synthesis is straightforward. |
| `5.6-terra` | `high` | Large-context search, consolidation, and synthesis. |
| `5.6-sol` | `lite` | Bounded judgment where Luna is not capable enough. |
| `5.6-sol` | `medium` | Solid default for high-judgment work and the default reviewer. |
| `5.6-sol` | `high` | Unusually difficult, broad, or critical reasoning and reviews. |

## Routing rules

- Prefer Luna High for command execution, test runs, narrow log inspection, targeted lookup, and other crisp tasks with objective success criteria.
- Raise Luna to XHigh when the task remains bounded but needs more persistence or reasoning.
- Do not use Luna for large-context work. More reasoning effort does not fix its weak performance over broad context.
- Prefer Terra High for repository sweeps, broad documentation searches, full webpages, long logs, and other large-context consolidation. Use Terra Medium when retrieval is broad but synthesis is simple.
- Prefer Sol Lite when a bounded task needs interpretation or judgment and can tolerate less depth than Sol Medium.
- Prefer Sol Medium when correctness depends on strong judgment. Use it as the default reviewer.
- Reserve Sol High for unusually difficult, broad, or critical work.
- Use Terra High for a follow-up review after findings were fixed when a clean result is expected.
- Keep architecture and scope decisions with the primary agent regardless of model.
