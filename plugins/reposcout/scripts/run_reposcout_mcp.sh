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
  echo "RepoScout error: resolved REPOSCOUT_REPO_ROOT is not a directory: $REPO_ROOT" >&2
  exit 2
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "RepoScout error: docker is not installed or not on PATH" >&2
  exit 2
fi

if ! docker info >/dev/null 2>&1; then
  echo "RepoScout error: docker is not running or is not reachable" >&2
  exit 2
fi

REPO_ROOT="$(cd "$REPO_ROOT" && pwd -P)"

CONTAINER_BASE_URL="${FASTCONTEXT_BASE_URL:-http://host.docker.internal:1234/v1}"
CONTAINER_GATEWAY_URL="${FASTCONTEXT_GATEWAY_URL:-${GATEWAY:-http://100.66.204.27:41800}}"

if [[ "${REPOSCOUT_REWRITE_LOCALHOST:-true}" == "true" ]]; then
  CONTAINER_BASE_URL="${CONTAINER_BASE_URL/http:\/\/localhost/http:\/\/host.docker.internal}"
  CONTAINER_BASE_URL="${CONTAINER_BASE_URL/http:\/\/127.0.0.1/http:\/\/host.docker.internal}"
  CONTAINER_BASE_URL="${CONTAINER_BASE_URL/https:\/\/localhost/https:\/\/host.docker.internal}"
  CONTAINER_BASE_URL="${CONTAINER_BASE_URL/https:\/\/127.0.0.1/https:\/\/host.docker.internal}"
  CONTAINER_GATEWAY_URL="${CONTAINER_GATEWAY_URL/http:\/\/localhost/http:\/\/host.docker.internal}"
  CONTAINER_GATEWAY_URL="${CONTAINER_GATEWAY_URL/http:\/\/127.0.0.1/http:\/\/host.docker.internal}"
  CONTAINER_GATEWAY_URL="${CONTAINER_GATEWAY_URL/https:\/\/localhost/https:\/\/host.docker.internal}"
  CONTAINER_GATEWAY_URL="${CONTAINER_GATEWAY_URL/https:\/\/127.0.0.1/https:\/\/host.docker.internal}"
fi

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
  -v "reposcout-cache:/cache" \
  -e REPOSCOUT_BACKEND="$BACKEND" \
  -e OPENCODE_API_KEY \
  -e REPOSCOUT_LOCAL_PROVIDER \
  -e REPOSCOUT_LOCAL_MODEL \
  -e REPOSCOUT_LOCAL_THINKING \
  -e FASTCONTEXT_BASE_URL="$CONTAINER_BASE_URL" \
  -e FASTCONTEXT_GATEWAY_URL="$CONTAINER_GATEWAY_URL" \
  -e FASTCONTEXT_MODEL \
  -e FASTCONTEXT_API_KEY \
  -e FASTCONTEXT_TOKEN \
  -e TOKEN \
  -e FASTCONTEXT_LOOP_ID \
  -e FASTCONTEXT_LOOP_WARM \
  -e REPOSCOUT_USE_NATIVE_TOOL_CALLS \
  -e REPOSCOUT_DEFAULT_REPO=/workspace \
  -e REPOSCOUT_MAX_TURNS \
  -e REPOSCOUT_MAX_CITATIONS \
  -e REPOSCOUT_MAX_GREP_RESULTS \
  -e REPOSCOUT_MAX_GLOB_RESULTS \
  -e REPOSCOUT_MAX_READ_LINES \
  -e REPOSCOUT_MAX_OBSERVATION_CHARS \
  -e REPOSCOUT_MAX_TOTAL_OBSERVATION_CHARS \
  -e MCP_TRANSPORT=stdio \
  "$IMAGE"
