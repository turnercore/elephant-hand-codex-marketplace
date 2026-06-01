#!/usr/bin/env python3
"""Launch the pinned latest Forgejo MCP server with plugin dotenv support."""

from __future__ import annotations

import os
from pathlib import Path
import stat


PLUGIN_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_ENV_FILE = PLUGIN_ROOT / ".env"
PINNED_PACKAGE = "@ric_/forgejo-mcp@0.1.5"
DEFAULT_FORGEJO_URL = "https://forge.elephanthand.com"


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
    os.environ.setdefault("FORGEJO_URL", DEFAULT_FORGEJO_URL)
    require_env("FORGEJO_TOKEN")
    os.execvp("npx", ["npx", "-y", PINNED_PACKAGE])
    return 127


if __name__ == "__main__":
    raise SystemExit(main())
