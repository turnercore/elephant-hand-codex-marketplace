---
name: reposcout
description: Use RepoScout to locate relevant repository files before broad manual search. Trigger when investigating where behavior is implemented, locating files for a bug or feature, finding wiring/config/schema/tool registration code, or triaging test failures in a repo.
---

# RepoScout

Before broad manual repository exploration, call the MCP tool `reposcout.find_context` when it is available.

Use it for:
- locating relevant files for a bug or feature
- investigating test failures
- finding config, schema, event, tool registration, or module wiring code
- looking for where a behavior is implemented

Call it with a concise natural-language query and no repo path. Use returned file-line citations as the first files to inspect.

If the MCP tool is unavailable or returns insufficient citations, fall back to direct repository search with `rg`.
