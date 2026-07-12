# Elephant Hand Codex Marketplace

Shared Codex plugin marketplace for Elephant Hand.

## Contents

- `plugins/grist`: the Grist plugin package
- `plugins/forgejo`: the Forgejo plugin package
- `plugins/mattpocock-skills`: selected skill package
- `plugins/mattpocock-skills/docs`: matching upstream docs for the selected skills
- `improve`: Git-backed plugin sourced from [`shadcn/improve`](https://github.com/shadcn/improve)
- `ponytail`: Git-backed plugin sourced from [`DietrichGebert/ponytail`](https://github.com/DietrichGebert/ponytail)
- `.agents/plugins/marketplace.json`: marketplace registry for Codex
- `plugins/grist/.env.example`: local environment template for Grist credentials
- `plugins/forgejo/.env.example`: local environment template for Forgejo credentials
- `PUBLISH-CODEX.md`: install, upgrade, and release instructions for Codex

## Attribution

`plugins/mattpocock-skills/skills/` includes selected skills from
[`mattpocock/skills`](https://github.com/mattpocock/skills), copied from commit
`16a2a5cd00b4416f673f4ff38c7971a04dd708e7`.

Original work copyright (c) 2026 Matt Pocock, licensed under the MIT License.

## Updating

Add this marketplace to Codex as a Git marketplace, not as a local path:

```sh
codex plugin marketplace add \
  ssh://git@forge.elephanthand.com:41004/Elephant-Hand-Games/elephant-hand-codex-marketplace.git \
  --ref main
```

After changing a plugin, update its version, push to `main`, and refresh Codex:

```sh
codex plugin marketplace upgrade elephant-hand
```

See [PUBLISH-CODEX.md](PUBLISH-CODEX.md) for the full install, upgrade, and
release checklist.
