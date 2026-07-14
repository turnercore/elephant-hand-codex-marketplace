# Repo Scan

Use this for `/drawio repo`, `$drawio diagram the whole repo`, or any whole-project architecture map.

## Goal

Create a truthful high-level map of the repo: packages, apps, services, data stores, external integrations, build/deploy boundaries, and the most important control/data flows.

## Scan Order

1. Read repo instructions and docs:
   - `README*`
   - `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING*`
   - `docs/**`, especially architecture, ADR, deployment, or onboarding docs
2. Inventory structure:
   - `find . -maxdepth 3 -type f`
   - `rg --files -g '!*node_modules*' -g '!*.lock'`
3. Identify runtime units:
   - manifests: `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `Package.swift`, `.csproj`, `pom.xml`
   - app/service folders: `apps/`, `packages/`, `services/`, `src/`, `cmd/`, `workers/`
4. Identify entry points and routes:
   - web servers, CLIs, workers, jobs, queues, cron, mobile/app entry points
   - route files, controllers, RPC handlers, GraphQL schemas
5. Identify persistence and infrastructure:
   - migrations, Prisma/Drizzle/SQL schemas, ORM models
   - Docker, Compose, Terraform, Pulumi, Kubernetes, Cloudflare, Supabase, CI/CD
6. Trace 3-7 important flows:
   - user request to handler to service to datastore
   - background job queue to worker to side effect
   - auth/session flow
   - deployment/build flow when requested

## Diagram Shape

- Title: what the repo is and what question the diagram answers.
- Top row: users/clients/entry points.
- Middle: apps/services/packages grouped by runtime or package boundary.
- Bottom/right: data stores, queues, external services, deployment targets.
- Use arrows only for confirmed flows.
- Put code paths in small labels under major nodes.
- Keep the overview coarse; create subsystem diagrams for dense areas.

## Evidence Notes

In the final response, include 3-8 short evidence bullets such as:

```text
- API routes from apps/api/src/routes/*
- Database shape from packages/db/migrations/*
- Worker entry point from services/worker/src/index.ts
```

If something is inferred, say so. If a major relation is unknown, do not draw it as confirmed.
