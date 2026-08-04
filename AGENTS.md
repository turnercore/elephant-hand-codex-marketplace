# Elephant Hand Codex marketplace

## Scope

This repository is the maintained source for Elephant Hand Codex plugins. Keep
plugin bundles self-contained, installable from the marketplace manifest, and
small in always-visible model context.

## Durable contracts

- `.agents/plugins/marketplace.json`, each plugin directory, and each
  `.codex-plugin/plugin.json` must agree on stable plugin names and local paths.
- Bump a plugin version when install-surface metadata or behavior must invalidate
  installed cache.
- Keep every `SKILL.md` description to one short sentence; detailed triggers and
  procedures belong in the skill body or linked references.
- Preserve upstream licenses and attribution for vendored work. Port selected
  sources deliberately instead of merging an upstream plugin wholesale.
- Never commit credentials, plugin-local environment files, caches, or generated
  installation state.
- Follow [PUBLISH-CODEX.md](PUBLISH-CODEX.md) for release and upgrade mechanics.

## Verification

Run:

```bash
python3 .dox/validate.py .
python3 scripts/validate_marketplace.py
python3 -m unittest discover -s plugins/dox/tests -p 'test_*.py'
node --test tests/reviewing-hooks.test.js
```

## DOX Breadcrumbs

Read this root contract and only the child chain covering a target. Keep durable
instructions whose omission could cause a wrong edit; route explanations,
procedures, examples, and history to normal documentation. Do not repeat inherited
rules. Update DOX only when a durable boundary, invariant, owner, or exact check
changes, and keep context within `.dox.toml` budgets.

Always commit repository changes.

## Child DOX Index

None.
