---
name: fable-review
description: Run asynchronous Anthropic batch reviews with Fable.
---

# Fable Review Agent Skill

Use this skill when you need an asynchronous Anthropic batch review of a PR, repo, or diff.

## Install Or Update

Preferred install:

```sh
curl -fsSL https://forge.elephanthand.com/turnercore/anthropic-batch-processing-cli/raw/branch/main/scripts/install.sh | sh
```

From a checkout:

```sh
scripts/install.sh
```

The installer prefers macOS/Linux prebuilt release assets and falls back to Cargo when needed.

Update:

```sh
fable-review update
```

The installed command should be `fable-review`.

## Required Setup

```sh
export ANTHROPIC_API_KEY="sk-ant-..."
```

Run `fable-review --help` and `fable-review <command> --help` when unsure. The CLI is the source of truth for flags.

## Safe Workflow

1. Dry run first:
   ```sh
   fable-review pr --base main --questions correctness,tests,security --dry-run
   ```
2. Inspect the newest `.fable-review/<timestamp>/packet.md`.
3. Inspect `cost-estimate.json`.
4. Submit only when the packet and cost look right:
   ```sh
   fable-review pr --base main --questions correctness,tests,security --wait
   ```
5. Read the generated `q*.md` files and `usage-summary.json`.

## Command Choices

- `pr --base main`: review current branch diff plus changed file contents.
- `repo`: review selected repository files.
- `diff --file change.diff`: review a standalone unified diff.
- `submit --requests path/to/requests.json`: submit a prepared request file.
- Cached multi-question generated runs submit one seed batch before the full batch by default; use `--no-prewarm-batch` to disable it.
- `submit --prewarm-batch`: manually seed before submitting a prepared request file.
- `status --batch-id msgbatch_...`: inspect batch status.
- `fetch --batch-id msgbatch_... --out-dir review-results`: download results.
- `update`: reinstall latest from Forge with the binary-first installer, falling back to Cargo.
- `cache-bench --cache-ttl 5m --out cache-bench.json`: run two sequential tiny requests and report cache hit and savings.

Use `--questions correctness,tests` for presets. Use repeated `--question 'custom prompt'` flags for custom prompts so commas stay intact.

## Cache And Debugging

`cache: true` in `.fable-review.yaml` marks the static packet as an Anthropic prompt-cache block. Cache savings are best-effort because batch workers are async.

Use `usage-summary.json` to confirm cache behavior:

- `cache_hit: true`: Anthropic reported `cache_read_input_tokens > 0`.
- `cache_creation_input_tokens`: tokens written into cache.
- `cache_read_input_tokens`: tokens read from cache.
- `usage`: raw Anthropic usage object.

If a repo packet fails while reading files, trust the error. It names the matched relative path that could not be read.

For cache proof, use `cache-bench` instead of a normal batch. The benchmark intentionally uses sequential `/v1/messages` calls so request 1 can write the cache and request 2 can read it.

## Output Contract

Repo packets include a `Repository tree` section with every non-excluded file path, then an `Included files` section with full contents for matched include paths.

Dry-run and submit commands write:

```text
.fable-review/<timestamp>/
  packet.md
  questions.json
  requests.json
  cost-estimate.json
  batch_id.txt
  results.jsonl
  q1_*.md
  usage-summary.json
```

Result filenames are sanitized. Use `custom_id` in `usage-summary.json` when you need the original ID.
