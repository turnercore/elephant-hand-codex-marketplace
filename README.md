# Elephant Hand Codex Marketplace

Shared Codex plugin marketplace for Elephant Hand.

## Contents

- `plugins/grist`: the Grist plugin package
- `plugins/forgejo`: the Forgejo plugin package
- `plugins/mattpocock-skills`: selected skill package
- `plugins/mattpocock-skills/docs`: matching upstream docs for the selected skills
- `.agents/plugins/marketplace.json`: marketplace registry for Codex
- `plugins/grist/.env.example`: local environment template for Grist credentials
- `plugins/forgejo/.env.example`: local environment template for Forgejo credentials

## Attribution

`plugins/mattpocock-skills/skills/` includes selected skills from
[`mattpocock/skills`](https://github.com/mattpocock/skills), copied from commit
`16a2a5cd00b4416f673f4ff38c7971a04dd708e7`.

Original work copyright (c) 2026 Matt Pocock, licensed under the MIT License.

## Updating

After changing a plugin, update its cachebuster and reinstall it in Codex from this marketplace.
