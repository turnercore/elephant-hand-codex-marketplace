---
name: reposcout
description: Find, map, or summarize repository implementation and documentation before broad manual exploration.
---

# RepoScout

Call `reposcout.find_context` with a concise question and no repository path before
broad search. Use it to locate implementation, tests, configuration, schemas,
documentation, or the shape of an unfamiliar subsystem.

The default is DeepSeek Flash/high. The scout is a separate read-only Pi process
with only repository read/search tools. Use its summary and validated citations as
a map, then reopen primary files before editing.

Credentials remain local runtime configuration: DeepSeek requires
`OPENCODE_API_KEY`, while Luna uses the user's Pi authentication file. If backend
configuration is missing, report the error without requesting, printing, or storing
a credential. Fall back to direct `rg` exploration only when RepoScout is unavailable
or clearly insufficient.
