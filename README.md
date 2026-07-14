# Elephant Hand Codex Marketplace

Shared Codex plugin marketplace for Elephant Hand.

## Contents

- `plugins/godot`: Godot headless testing
- `plugins/productivity`: assistant file workflows, currently PDF and Paperless-ngx
- `plugins/reporting`: human-facing Draw.io diagrams, HTML artifacts, and static sharing
- `plugins/reviewing`: Ponytail, Brooks Lint, Improve, Fable, and code review workflows
- `plugins/teaching`: Teach Loop's adaptive tutoring and interactive lesson workspace
- `plugins/coding`: implementation, test-driven development, and prototyping
- `plugins/planning`: grilling, domain modeling, handoffs, specs, tickets, and wayfinding
- `plugins/grist`: standalone Grist integration
- `plugins/forgejo`: standalone Elephant Hand Forgejo integration
- `plugins/dox`: repo-owned DOX plugin with automatic AGENTS.md hierarchy adoption
- `plugins/reposcout`: standalone repository context tool
- `.agents/plugins/marketplace.json`: marketplace registry for Codex
- `plugins/grist/.env.example`: local environment template for Grist credentials
- `plugins/forgejo/.env.example`: local environment template for Forgejo credentials
- `PUBLISH-CODEX.md`: install, upgrade, and release instructions for Codex

## Attribution

Coding and Planning, plus `code-review` in Reviewing, vendor selected work from
[`mattpocock/skills`](https://github.com/mattpocock/skills). Original work
copyright (c) 2026 Matt Pocock, licensed under the MIT License. Each bundle
includes the upstream license and can now evolve independently inside this
marketplace.

Teaching contains Teach Loop, copyright (c) 2026 Turner Monroe and Teach Loop
contributors, licensed under the MIT License. Teach Loop's included third-party
notice preserves attribution for the Matt Pocock `teach` skill it extends.

The Reviewing bundle vendors skills from the Elephant Hand Ponytail and Brooks
Lint integration branches, plus Improve and Fable Review. Each retains its
upstream authorship and license. Ponytail remains hook-free in Codex and both
Ponytail and Brooks retain their terse model-visible descriptions.

## Updating Vendored Matt Pocock Skills

Clone the Elephant Hand fork and keep both remotes:

```sh
git clone ssh://git@forge.elephanthand.com:41004/Elephant-Hand-Games/mattpocock-skills.git
cd mattpocock-skills
git remote add upstream https://github.com/mattpocock/skills.git
```

Refresh the untouched `main` branch, then compare the selected source skills
against the copies in this marketplace:

```sh
git fetch upstream
git switch main
git merge --ff-only upstream/main
git push origin main
```

Do not merge the full plugin into this marketplace. Port only the retained
skills deliberately, preserve the short Codex descriptions and local
adaptations, validate the affected bundles, and bump their versions. The
retained set is:

- Planning: `grill-with-docs`, `grilling`, `grill-me`, `domain-modeling`,
  `handoff`, `to-spec`, `to-tickets`, and `wayfinder`
- Coding: `implement`, `tdd`, and `prototype`
- Reviewing: `code-review`

All other Matt Pocock skills are intentionally excluded. Teaching contains
Elephant Hand's independently maintained Teach Loop skill.

## Updating Reviewing Sources

Both plugins use the same two-branch integration pattern. Clone the Elephant
Hand fork and add its public source as `upstream`:

```sh
# Ponytail
git clone ssh://git@forge.elephanthand.com:41004/Elephant-Hand-Games/ponytail.git
cd ponytail
git remote add upstream https://github.com/DietrichGebert/ponytail.git
cd ..

# Brooks Lint
git clone ssh://git@forge.elephanthand.com:41004/Elephant-Hand-Games/brooks-lint.git
cd brooks-lint
git remote add upstream https://github.com/hyhmrright/brooks-lint.git
```

For either fork, update the upstream-tracking baseline, then merge it into the
Elephant Hand integration branch:

```sh
git fetch upstream
git switch main
git merge upstream/main
git push origin main
git switch elephant-hand
git merge main
git push origin elephant-hand
```

During conflict resolution, preserve the short `description` in every
`skills/*/SKILL.md`. Ponytail must also keep the Codex manifest free of a
`hooks` entry and `Lifecycle hooks` capability. After updating a source, copy
its skill directories into `plugins/reviewing/skills/`, validate the Reviewing
plugin, and bump its version so an upgrade does not reuse stale cache. Improve
comes from [`shadcn/improve`](https://github.com/shadcn/improve); Fable Review
comes from [`turnercore/anthropic-batch-processing-cli`](https://forge.elephanthand.com/turnercore/anthropic-batch-processing-cli).

Brooks' upstream `_shared/` files live at `plugins/reviewing/references/brooks/`
in the aggregate plugin; its skill references must use
`../../references/brooks/`. Ponytail's aggregate copy omits the unsupported
`argument-hint` frontmatter field as well as all hook registration.

## Compact Skill Descriptions

Every repo-owned skill uses a short, one-line machine description. Detailed
triggers and operating rules belong in the skill body so merely enabling a
plugin does not consume unnecessary model context.

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
