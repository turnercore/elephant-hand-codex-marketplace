#!/usr/bin/env python3
"""Launch the pinned Grist MCP server with plugin dotenv support."""

from __future__ import annotations

import os
from pathlib import Path
import stat
import sys


PLUGIN_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_ENV_FILE = PLUGIN_ROOT / ".env"
PINNED_PACKAGE = "grist-mcp-server@2.0.33"


def load_env_file(path: Path = DEFAULT_ENV_FILE) -> None:
    if not path.exists():
        return
    mode = stat.S_IMODE(path.stat().st_mode)
    if mode & (stat.S_IRWXG | stat.S_IRWXO):
        raise SystemExit(f"Refusing to load {path}; expected permissions 0600")
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


def require_env(name: str) -> None:
    if not os.environ.get(name, "").strip():
        raise SystemExit(f"Missing required environment variable: {name}")


def main() -> int:
    load_env_file()
    require_env("GRIST_API_KEY")
    require_env("GRIST_BASE_URL")
    os.execvp("npx", ["npx", "-y", PINNED_PACKAGE])
    return 127


if __name__ == "__main__":
    raise SystemExit(main())
