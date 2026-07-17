---
name: reposcout
description: Find, map, or summarize repository implementation and documentation before broad manual exploration.
---

# RepoScout

Before broad manual repository exploration, call the MCP tool `reposcout.find_context` when it is available.

Use it for:
- locating relevant files for a bug or feature
- investigating test failures
- finding config, schema, event, tool registration, or module wiring code
- looking for where a behavior is implemented

Call it with a concise natural-language query and no repo path. The ad-hoc default
is DeepSeek Flash/high. Use returned task summaries and validated file-line citations
as the first context to inspect, then reopen primary files before editing.

RepoScout credentials are local only. DeepSeek requires `OPENCODE_API_KEY`; Luna
uses the user's Pi authentication file. If the configured backend is unavailable,
report the actionable configuration error without requesting or exposing a secret.

If the MCP tool is unavailable or returns insufficient citations, fall back to direct repository search with `rg`.
