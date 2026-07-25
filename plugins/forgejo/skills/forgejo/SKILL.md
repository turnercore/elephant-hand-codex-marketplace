---
name: forgejo
description: Manage Forgejo repositories, issues, pull requests, workflows, and releases.
---

# Forgejo

Use this skill for Forgejo work. Prefer registered Forgejo MCP tools when they are available. Use `fj` for shell-native repository workflows and the bundled REST helper for explicit API fallback, troubleshooting, or exact endpoint calls. Prefer MCP, `fj`, or API calls over browser scraping.

## Required Inputs

- `FORGEJO_URL`: Forgejo site root. Defaults to `https://forge.elephanthand.com` in local wrappers.
- `FORGEJO_ACCESS_TOKEN`: Forgejo access token from `Settings | Applications`; preferred by `goern/forgejo-mcp`.
- `FORGEJO_TOKEN`: Backward-compatible alias used by the local launcher and REST helper.

Never print access tokens. Store durable workstation credentials in
`~/.config/elephant-hand/forgejo.env` with permissions `0600`:

```dotenv
FORGEJO_URL=https://forge.elephanthand.com
FORGEJO_ACCESS_TOKEN=replace-with-a-forgejo-access-token
FORGEJO_TOKEN=replace-with-a-forgejo-access-token
```

Explicit environment variables take priority. A plugin-local `.env` is a
portable fallback, must stay untracked, and must also have permissions `0600`.

## Tool Priority

1. Use Forgejo MCP tools first when they are registered. They cover repositories, branches, file contents, issues, labels, milestones, pull requests, reviews, organizations, users, notifications, Actions workflows, releases, and branch protection.
2. Use `fj` when the task benefits from local git context, cloning, PR checkout, command-line output, or matching the user's shell workflow.
3. Use `scripts/forgejo_api.py` when MCP is unavailable, when debugging auth/base-url/TLS problems, or when the user asks for exact REST calls.
4. Use `git` locally for clone/status/diff/commit workflows after repository URLs are known.
5. Do not browser-scrape Forgejo unless the user explicitly asks and accepts the fragility.

## `fj` CLI

Elephant Hand connection facts:

- Forgejo UI, API, `fj`, and OCI registry use HTTPS on standard port `443`.
- Git over SSH uses port `41004`.
- `fj version` prints the installed CLI version.
- `fj auth login` starts interactive login; `fj auth add-key USER [KEY]`
  installs an existing token.

Use global flags before the subcommand:

```bash
fj -H forge.elephanthand.com --style minimal repo view OWNER/REPO
```

Do not use `fj --version`; use:

```bash
fj version
```

Useful commands:

```bash
fj auth list
fj -H forge.elephanthand.com whoami
fj -H forge.elephanthand.com --style minimal repo view OWNER/REPO
fj -H forge.elephanthand.com repo clone OWNER/REPO
fj -H forge.elephanthand.com issue search -R origin
fj -H forge.elephanthand.com issue create -R origin
fj -H forge.elephanthand.com pr search -R origin
fj -H forge.elephanthand.com pr create --repo OWNER/REPO --base main --head BRANCH "Title"
fj -H forge.elephanthand.com pr status -R origin
fj -H forge.elephanthand.com actions tasks --repo OWNER/REPO
fj -H forge.elephanthand.com release list --repo OWNER/REPO
fj -H forge.elephanthand.com org list
fj -H forge.elephanthand.com user view USERNAME
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

This plugin includes `scripts/forgejo_api.py`, a small zero-dependency Python
helper. It loads the stable user credential file, then the plugin-local `.env`
fallback, while explicit environment variables take priority. Use
`--env-file PATH` to select another dotenv file.

Examples:

```bash
python3 <forgejo-plugin>/scripts/forgejo_api.py user
python3 <forgejo-plugin>/scripts/forgejo_api.py version
python3 <forgejo-plugin>/scripts/forgejo_api.py repos --limit 50
python3 <forgejo-plugin>/scripts/forgejo_api.py search-repos marketplace
python3 <forgejo-plugin>/scripts/forgejo_api.py issues OWNER REPO --state open
python3 <forgejo-plugin>/scripts/forgejo_api.py pulls OWNER REPO
python3 <forgejo-plugin>/scripts/forgejo_api.py create-issue OWNER REPO "Bug title" --body "Details"
python3 <forgejo-plugin>/scripts/forgejo_api.py raw GET /repos/OWNER/REPO
```

Use `--raw` when compact JSON is useful for follow-up processing.

## TLS

Do not disable TLS verification in plugin code. If certificate verification
fails, repair the workstation trust chain; use insecure requests only for
short-lived diagnosis and never for authenticated operations.

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
- Launcher: `scripts/run_forgejo_mcp.py` loads durable user credentials, downloads the pinned release archive, verifies it against upstream checksums, maps `FORGEJO_TOKEN` to `FORGEJO_ACCESS_TOKEN` when needed, and starts stdio transport.

Official docs:

- API usage: `https://forgejo.org/docs/latest/user/api-usage/`
- Access token scopes: `https://forgejo.org/docs/latest/user/token-scope/`
