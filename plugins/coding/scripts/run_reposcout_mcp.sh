#!/usr/bin/env bash
set -euo pipefail

IMAGE="${REPOSCOUT_IMAGE:-forge.elephanthand.com/turnercore/reposcout-mcp:latest}"
START_DIR="${CODEX_WORKSPACE_DIR:-$PWD}"
BACKEND="${REPOSCOUT_BACKEND:-deepseek}"

if [[ -n "${REPOSCOUT_REPO_ROOT:-}" ]]; then
  REPO_ROOT="$REPOSCOUT_REPO_ROOT"
elif GIT_ROOT="$(git -C "$START_DIR" rev-parse --show-toplevel 2>/dev/null)"; then
  REPO_ROOT="$GIT_ROOT"
else
  REPO_ROOT="$START_DIR"
fi

if [[ ! -d "$REPO_ROOT" ]]; then
  echo "RepoScout error: workspace is not a directory: $REPO_ROOT" >&2
  exit 2
fi
if ! command -v docker >/dev/null 2>&1 || ! docker info >/dev/null 2>&1; then
  echo "RepoScout error: Docker is unavailable" >&2
  exit 2
fi

REPO_ROOT="$(cd "$REPO_ROOT" && pwd -P)"
AUTH_ARGS=()
if [[ "$BACKEND" == "luna" ]]; then
  PI_AUTH_PATH="${REPOSCOUT_PI_AUTH_PATH:-${HOME}/.pi/agent/auth.json}"
  if [[ ! -f "$PI_AUTH_PATH" ]]; then
    echo "RepoScout error: Luna requires Pi auth at $PI_AUTH_PATH" >&2
    exit 2
  fi
  AUTH_ARGS=(-v "${PI_AUTH_PATH}:/root/.pi/agent/auth.json:ro")
fi

exec docker run --rm -i \
  --add-host=host.docker.internal:host-gateway \
  "${AUTH_ARGS[@]}" \
  -v "${REPO_ROOT}:/workspace:ro" \
  -e REPOSCOUT_BACKEND="$BACKEND" \
  -e OPENCODE_API_KEY \
  -e REPOSCOUT_LOCAL_PROVIDER \
  -e REPOSCOUT_LOCAL_MODEL \
  -e REPOSCOUT_LOCAL_THINKING \
  -e FASTCONTEXT_BASE_URL \
  -e FASTCONTEXT_GATEWAY_URL \
  -e FASTCONTEXT_MODEL \
  -e FASTCONTEXT_API_KEY \
  -e FASTCONTEXT_TOKEN \
  -e REPOSCOUT_DEFAULT_REPO=/workspace \
  -e MCP_TRANSPORT=stdio \
  "$IMAGE"
