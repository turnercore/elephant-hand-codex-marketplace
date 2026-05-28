---
name: grist
description: Use when the user wants Codex to connect to a Grist instance, inspect Grist orgs/workspaces/docs, import CSV-like data, or query/create/update/delete records through Grist MCP tools or the REST API fallback helper.
---

# Grist

Use this skill for Grist work. Prefer registered Grist MCP tools when they are available; use the bundled REST helper for explicit fallback, troubleshooting, or simple shell-driven workflows. Prefer the official REST API over browser scraping or direct database reads.

## Required Inputs

- `GRIST_BASE_URL`: Grist site root, for example `https://grist.themonstersarecom.ing`.
- `GRIST_API_KEY`: user API key from Grist profile settings.
- Document IDs come from Grist URLs after `/doc/`.

Never print API keys. This local plugin may keep defaults in `/Users/turnercore/plugins/grist/.env`, which must stay `0600`.

## Tool Priority

1. Use Grist MCP tools first when they are registered. They cover discovery, SQL, record CRUD, schema, pages, document creation, webhooks, and `grist_help`.
2. Use `grist_help` before complex writes or schema/page changes when MCP is available. Request examples and schemas for the specific tool.
3. Use `scripts/grist_api.py` when MCP is unavailable, when debugging auth/base-url problems, or when the user asks for exact REST calls.
4. Never use browser scraping or direct Grist database access unless the user explicitly asks and accepts the risk.

## API Basics

The API base is:

```text
${GRIST_BASE_URL}/api
```

Authenticate every request with:

```text
Authorization: Bearer ${GRIST_API_KEY}
```

Useful endpoints:

- `GET /api/orgs` lists accessible orgs.
- `GET /api/orgs/{orgId}/workspaces` lists workspaces.
- `GET /api/workspaces/{workspaceId}/docs` lists docs.
- `GET /api/docs/{docId}/tables` lists tables.
- `GET /api/docs/{docId}/tables/{tableId}/records` reads records.
- `POST /api/docs/{docId}/tables/{tableId}/records` adds records.
- `PATCH /api/docs/{docId}/tables/{tableId}/records` updates records.
- `DELETE /api/docs/{docId}/tables/{tableId}/records` deletes records.
- `POST /api/docs/{docId}/sql` runs SQL against a document.

## Helper Script

This plugin includes `scripts/grist_api.py`, a small zero-dependency Python helper. It automatically loads `/Users/turnercore/plugins/grist/.env` when present, while explicit environment variables still take priority. Use `--env-file PATH` to load another dotenv file.

Examples:

```bash
python3 /Users/turnercore/plugins/grist/scripts/grist_api.py orgs
```

```bash
python3 /Users/turnercore/plugins/grist/scripts/grist_api.py records DOC_ID TABLE_ID
```

```bash
python3 /Users/turnercore/plugins/grist/scripts/grist_api.py inspect DOC_ID --sample-size 3
```

```bash
python3 /Users/turnercore/plugins/grist/scripts/grist_api.py sql DOC_ID 'select * from Table1 limit 10'
```

```bash
python3 /Users/turnercore/plugins/grist/scripts/grist_api.py add-records DOC_ID TABLE_ID '[{"Name":"Ada"}]' --dry-run
```

Use `--raw` when you need exact JSON for follow-up processing.

## Workflow

1. Confirm the base URL and API key source.
2. Run a small read-only check first, usually MCP `grist_get_workspaces` or helper `orgs`.
3. For document edits, inspect tables and columns before writing records.
4. For bulk writes, prepare the JSON payload locally, use `--dry-run` with the helper or MCP schema/help first, then send one explicit write.
5. Verify writes with a follow-up read from the relevant endpoint or MCP read tool.

## Safety Rules

- Treat delete, schema, page, webhook, and bulk record operations as destructive. Preview first and verify after.
- For helper writes, prefer JSON files via `@file` or stdin via `-` instead of long inline JSON.
- Preserve row IDs when updating records; add payloads use field dictionaries, update payloads use `{ "id": row_id, "fields": { ... } }`.
- Keep `GRIST_BASE_URL` as the site root, not `/api`.
- Do not commit `.env` or print its contents.

## Source

Official docs:

- REST API usage: `https://support.getgrist.com/rest-api/`
- REST API reference: `https://support.getgrist.com/api/`

Bundled MCP server:

- `grist-mcp-server@2.0.33`
- Upstream repository: `https://github.com/gwhthompson/grist-mcp-server`
