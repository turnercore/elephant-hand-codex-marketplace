# Publishing to Codex

This repository is the Elephant Hand Codex plugin marketplace.

Codex expects the marketplace manifest at `.agents/plugins/marketplace.json`.
Entries either point at a local plugin bundle under `plugins/<plugin-name>` or
at a Git-backed upstream/integration repository. `mattpocock-skills`, `improve`,
and `ponytail` use the Git-backed model.

## Install

Add this marketplace as a Git-backed marketplace, not as a local path:

```sh
codex plugin marketplace add \
  ssh://git@forge.elephanthand.com:41004/Elephant-Hand-Games/elephant-hand-codex-marketplace.git \
  --ref main
```

Forgejo SSH for this server runs on port `41004`, so the port must be present
in the URL.

After adding the marketplace, open the Codex plugin directory and install the
plugins you want, or install from the CLI:

```sh
codex plugin add grist@elephant-hand
codex plugin add forgejo@elephant-hand
codex plugin add reposcout@elephant-hand
codex plugin add html-artifacts@elephant-hand
codex plugin add mattpocock-skills@elephant-hand
codex plugin add improve@elephant-hand
codex plugin add ponytail@elephant-hand
codex plugin add dox@elephant-hand
```

## Upgrade

Because the marketplace is Git-backed, Codex can refresh it with:

```sh
codex plugin marketplace upgrade elephant-hand
```

If `upgrade` reports that the marketplace is not configured as a Git
marketplace, remove the stale local-path registration and add the SSH URL again:

```sh
codex plugin marketplace remove elephant-hand-codex-marketplace
codex plugin marketplace add \
  ssh://git@forge.elephanthand.com:41004/Elephant-Hand-Games/elephant-hand-codex-marketplace.git \
  --ref main
```

## Marketplace Manifest

The marketplace manifest lives at `.agents/plugins/marketplace.json`.

Use the top-level `name` as the stable marketplace identifier:

```json
"name": "elephant-hand"
```

Use `interface.displayName` for the marketplace title shown in Codex:

```json
"interface": {
  "displayName": "Elephant Hand"
}
```

Each plugin entry must include:

- `name`: the plugin slug, matching the plugin folder and plugin manifest name
- `source.source`: usually `local`
- `source.path`: a `./`-prefixed path relative to the marketplace root
- `policy.installation`
- `policy.authentication`
- `category`

Example:

```json
{
  "name": "grist",
  "source": {
    "source": "local",
    "path": "./plugins/grist"
  },
  "policy": {
    "installation": "AVAILABLE",
    "authentication": "ON_INSTALL"
  },
  "category": "Productivity"
}
```

## Plugin Manifests

Each plugin controls its own card title and descriptive copy from
`.codex-plugin/plugin.json`.

Use:

- `interface.displayName` for the plugin card title
- `interface.shortDescription` for compact card copy
- `interface.longDescription` for details-page copy
- `interface.developerName` for the publisher/byline
- `interface.logo` and `interface.composerIcon` for visual identity when assets
  are available

Keep `name` as a stable kebab-case identifier. Do not use the marketplace name
as a plugin `name`.

## Release Checklist

Before pushing marketplace changes:

1. Confirm `.agents/plugins/marketplace.json` contains every plugin that should
   appear in Codex.
2. Confirm every plugin entry has `policy.installation`,
   `policy.authentication`, and `category`.
3. Confirm every plugin path resolves from the marketplace root.
4. Confirm every plugin has `.codex-plugin/plugin.json`.
5. Bump a plugin version when changing install-surface metadata or behavior that
   should be reinstalled from cache.
6. Commit and push to `main`.

After pushing:

```sh
codex plugin marketplace upgrade elephant-hand
```

Restart Codex or open a new Codex thread after installing/upgrading plugins so
the available tools and skills list is rebuilt from the refreshed cache.
