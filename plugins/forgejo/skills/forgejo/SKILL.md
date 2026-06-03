---
name: forgejo
description: Use when the user wants Codex to work with the Elephant Hand Forgejo instance, Forgejo or Gitea repositories, issues, pull requests, organizations, users, releases, Actions runners, or instance/admin APIs.
---

# Forgejo

Use this skill for Forgejo work. Prefer registered Forgejo MCP tools when they are available. Use `fj` for shell-native repository workflows and the bundled REST helper for explicit API fallback, troubleshooting, or exact endpoint calls. Prefer MCP, `fj`, or API calls over browser scraping.

## Required Inputs

- `FORGEJO_URL`: Forgejo site root. Defaults to `https://forge.elephanthand.com` in local wrappers.
- `FORGEJO_ACCESS_TOKEN`: Forgejo access token from `Settings | Applications`; preferred by `goern/forgejo-mcp`.
- `FORGEJO_TOKEN`: Backward-compatible alias used by the local launcher and REST helper.

Never print access tokens. A local plugin `.env` may be used, but it must stay untracked and have permissions `0600`.

## Tool Priority

1. Use Forgejo MCP tools first when they are registered. They cover repositories, branches, file contents, issues, labels, milestones, pull requests, reviews, organizations, users, notifications, Actions workflows, releases, and branch protection.
2. Use `fj` when the task benefits from local git context, cloning, PR checkout, command-line output, or matching the user's shell workflow.
3. Use `scripts/forgejo_api.py` when MCP is unavailable, when debugging auth/base-url/TLS problems, or when the user asks for exact REST calls.
4. Use `git` locally for clone/status/diff/commit workflows after repository URLs are known.
5. Do not browser-scrape Forgejo unless the user explicitly asks and accepts the fragility.

## `fj` CLI

Verified local CLI facts:

- `fj version` reports `fj v0.5.0`.
- `fj auth list` currently shows `turnercore@forge.elephanthand.com:20004`.
- `fj -H forge.elephanthand.com:20004 whoami` works.
- `fj -H forge.elephanthand.com whoami` currently reports not logged in.

Use global flags before the subcommand:

```bash
fj -H forge.elephanthand.com:20004 --style minimal repo view OWNER/REPO
```

Do not use `fj --version`; use:

```bash
fj version
```

Useful commands:

```bash
fj auth list
fj -H forge.elephanthand.com:20004 whoami
fj -H forge.elephanthand.com:20004 --style minimal repo view OWNER/REPO
fj -H forge.elephanthand.com:20004 repo clone OWNER/REPO
fj -H forge.elephanthand.com:20004 issue search -R origin
fj -H forge.elephanthand.com:20004 issue create -R origin
fj -H forge.elephanthand.com:20004 pr search -R origin
fj -H forge.elephanthand.com:20004 pr create --repo OWNER/REPO --base main --head BRANCH "Title"
fj -H forge.elephanthand.com:20004 pr status -R origin
fj -H forge.elephanthand.com:20004 actions tasks --repo OWNER/REPO
fj -H forge.elephanthand.com:20004 release list --repo OWNER/REPO
fj -H forge.elephanthand.com:20004 org list
fj -H forge.elephanthand.com:20004 user view USERNAME
```

## API Basics

The API base is:

```text
${FORGEJO_URL}/api/v1
```

Authenticate every request with:

```text
Authorization: Bearer ${FORGEJO_TOKEN}
```

Useful endpoints:

- `GET /api/v1/user` shows the authenticated user.
- `GET /api/v1/version` shows the server version.
- `GET /api/v1/user/repos` lists repositories available to the token user.
- `GET /api/v1/repos/search?q=QUERY` searches repositories.
- `GET /api/v1/repos/{owner}/{repo}` reads repository metadata.
- `GET /api/v1/repos/{owner}/{repo}/contents/{filepath}` reads file contents.
- `GET /api/v1/repos/{owner}/{repo}/issues` lists issues.
- `POST /api/v1/repos/{owner}/{repo}/issues` creates an issue.
- `POST /api/v1/repos/{owner}/{repo}/issues/{index}/comments` comments on an issue or pull request.
- `GET /api/v1/repos/{owner}/{repo}/pulls` lists pull requests.

## MCP Tool Names

The plugin launches the pinned `goern/forgejo-mcp` release. Common MCP tools include:

- `get_my_user_info`
- `list_my_repos`
- `search_repos`
- `list_repo_issues`
- `get_issue_by_index`
- `create_issue`
- `list_repo_pull_requests`
- `get_pull_request_by_index`
- `create_pull_request`
- `merge_pull_request`
- `dispatch_workflow`
- `list_workflow_runs`
- `get_workflow_run`
- `list_releases`
- `get_forgejo_mcp_server_version`

## Helper Script

This plugin includes `scripts/forgejo_api.py`, a small zero-dependency Python helper. It automatically loads plugin `.env` when present, while explicit environment variables still take priority. Use `--env-file PATH` to load another dotenv file.

Examples:

```bash
python3 /Users/turnercore/Projects/Codex/elephant-hand-codex-marketplace/plugins/forgejo/scripts/forgejo_api.py user
python3 /Users/turnercore/Projects/Codex/elephant-hand-codex-marketplace/plugins/forgejo/scripts/forgejo_api.py version
python3 /Users/turnercore/Projects/Codex/elephant-hand-codex-marketplace/plugins/forgejo/scripts/forgejo_api.py repos --limit 50
python3 /Users/turnercore/Projects/Codex/elephant-hand-codex-marketplace/plugins/forgejo/scripts/forgejo_api.py search-repos marketplace
python3 /Users/turnercore/Projects/Codex/elephant-hand-codex-marketplace/plugins/forgejo/scripts/forgejo_api.py issues OWNER REPO --state open
python3 /Users/turnercore/Projects/Codex/elephant-hand-codex-marketplace/plugins/forgejo/scripts/forgejo_api.py pulls OWNER REPO
python3 /Users/turnercore/Projects/Codex/elephant-hand-codex-marketplace/plugins/forgejo/scripts/forgejo_api.py create-issue OWNER REPO "Bug title" --body "Details"
python3 /Users/turnercore/Projects/Codex/elephant-hand-codex-marketplace/plugins/forgejo/scripts/forgejo_api.py raw GET /repos/OWNER/REPO
```

Use `--raw` when compact JSON is useful for follow-up processing.

## TLS Note

Do not disable TLS verification in plugin code. During setup on 2026-06-01, local `curl https://forge.elephanthand.com/api/v1/version` failed certificate verification because the presented certificate chain was issued by `Caddy Local Authority`. `curl -k` is acceptable only as a diagnostic while the host trust/certificate setup is being repaired.

## Workflow

1. Confirm the base URL and token source.
2. Run a small read-only check first, usually MCP `get_my_user_info`, `fj whoami`, or helper `user`.
3. Inspect owner/repo names before writes.
4. For issue, PR, file, branch, release, admin, and destructive writes, summarize the intended change before calling the tool unless the user gave an exact action.
5. Verify writes with a follow-up read from the relevant endpoint, MCP read tool, or `fj` command.

## Safety Rules

- Treat delete, transfer, admin, branch, file, release, and merge operations as destructive.
- Use the narrowest token scope that covers the requested work.
- Admin tools require an admin-level Forgejo token; do not assume the current token has admin rights.
- Preserve owner/repo casing exactly as returned by Forgejo.
- Do not commit `.env` or print its contents.

## Source

Default MCP server:

- Package/release: `goern/forgejo-mcp v2.28.0`
- Upstream repository: `https://codeberg.org/goern/forgejo-mcp`
- Launcher: `scripts/run_forgejo_mcp.py` downloads the pinned release archive, verifies it against upstream checksums, maps `FORGEJO_TOKEN` to `FORGEJO_ACCESS_TOKEN` when needed, and starts stdio transport.

Official docs:

- API usage: `https://forgejo.org/docs/latest/user/api-usage/`
- Access token scopes: `https://forgejo.org/docs/latest/user/token-scope/`
