# Elephant Hand Codex Marketplace

Shared Codex plugin marketplace for Elephant Hand.

## Contents

- `plugins/grist`: the Grist plugin package
- `plugins/forgejo`: the Forgejo plugin package
- `mattpocock-skills`: Git-backed plugin sourced from Elephant Hand's
  [`mattpocock/skills` integration fork](https://forge.elephanthand.com/Elephant-Hand-Games/mattpocock-skills/src/branch/elephant-hand)
- `improve`: Git-backed plugin sourced from [`shadcn/improve`](https://github.com/shadcn/improve)
- `ponytail`: Git-backed plugin sourced from [`DietrichGebert/ponytail`](https://github.com/DietrichGebert/ponytail)
- `brooks-lint`: Git-backed plugin sourced from [`hyhmrright/brooks-lint`](https://github.com/hyhmrright/brooks-lint)
- `dox`: repo-owned DOX plugin with automatic AGENTS.md hierarchy adoption
- `.agents/plugins/marketplace.json`: marketplace registry for Codex
- `plugins/grist/.env.example`: local environment template for Grist credentials
- `plugins/forgejo/.env.example`: local environment template for Forgejo credentials
- `PUBLISH-CODEX.md`: install, upgrade, and release instructions for Codex

## Attribution

The `mattpocock-skills` plugin tracks the `elephant-hand` branch of
`Elephant-Hand-Games/mattpocock-skills`. That repository preserves upstream
history from [`mattpocock/skills`](https://github.com/mattpocock/skills) on
`main`; Elephant Hand-specific Codex metadata lives on `elephant-hand`.

Original work copyright (c) 2026 Matt Pocock, licensed under the MIT License.

## Updating Matt Pocock Skills

Clone the Elephant Hand fork and keep both remotes:

```sh
git clone ssh://git@forge.elephanthand.com:41004/Elephant-Hand-Games/mattpocock-skills.git
cd mattpocock-skills
git remote add upstream https://github.com/mattpocock/skills.git
```

Refresh the untouched `main` branch, then explicitly merge the chosen upstream
state into the installable `elephant-hand` branch:

```sh
git fetch upstream
git switch main
git merge --ff-only upstream/main
git push origin main
git switch elephant-hand
git merge main
git push origin elephant-hand
```

Resolve or decline that last merge like any normal integration change. Codex
only receives changes after they land on `elephant-hand` and this marketplace
is upgraded.

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
