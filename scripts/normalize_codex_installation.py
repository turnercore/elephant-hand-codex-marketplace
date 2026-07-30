#!/usr/bin/env python3
"""Audit or normalize a Codex installation to the Elephant Hand studio baseline."""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
import tomllib
from datetime import datetime, timezone
from pathlib import Path


STUDIO_PLUGINS = {
    "coding@elephant-hand",
    "dox@elephant-hand",
    "forgejo@elephant-hand",
    "planning@elephant-hand",
    "productivity@elephant-hand",
    "reporting@elephant-hand",
    "reviewing@elephant-hand",
    "subagents@elephant-hand",
    "teaching@elephant-hand",
}
LEGACY_PLUGINS = {
    "brooks-lint@brooks-lint",
    "brooks-lint@elephant-hand",
    "grist@elephant-hand-codex-marketplace",
    "html-artifacts@elephant-hand",
    "improve@elephant-hand",
    "improve@improve",
    "mattpocock-skills@elephant-hand",
    "ponytail@elephant-hand",
    "ponytail@ponytail",
    "reposcout@elephant-hand-codex-marketplace",
}
PLUGIN_TABLE = re.compile(r'^\[plugins\."([^"]+)"\]\s*$')


def read_config_plugins(config_path: Path) -> dict[str, bool]:
    if not config_path.exists():
        return {}
    data = tomllib.loads(config_path.read_text(encoding="utf-8"))
    plugins = data.get("plugins", {})
    if not isinstance(plugins, dict):
        return {}
    return {
        selector: settings.get("enabled", True) is not False
        for selector, settings in plugins.items()
        if isinstance(selector, str) and isinstance(settings, dict)
    }


def list_available(codex: str) -> set[str]:
    result = subprocess.run(
        [codex, "plugin", "list", "--available", "--json"],
        capture_output=True,
        text=True,
        check=True,
    )
    payload = json.loads(result.stdout)
    return {
        item["pluginId"]
        for section in ("installed", "available")
        for item in payload.get(section, [])
        if isinstance(item, dict) and isinstance(item.get("pluginId"), str)
    }


def podman_is_ready() -> bool:
    if not shutil.which("podman"):
        return False
    try:
        return subprocess.run(
            ["podman", "info"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False,
            timeout=5,
        ).returncode == 0
    except subprocess.TimeoutExpired:
        return False


def plan_actions(
    enabled: set[str],
    available: set[str],
    *,
    podman_ready: bool,
    configured: set[str] | None = None,
) -> tuple[list[str], list[str], list[str]]:
    configured = configured if configured is not None else enabled
    desired = set(STUDIO_PLUGINS)
    if "pdf@openai-primary-runtime" in available:
        desired.add("pdf@openai-primary-runtime")
    if podman_ready:
        desired.add("reposcout@elephant-hand")
    if "grist@elephant-hand-codex-marketplace" in configured:
        desired.add("grist@elephant-hand")

    removals = sorted(configured & LEGACY_PLUGINS)
    additions = sorted((desired - enabled) & available)
    unavailable = sorted(desired - enabled - available)
    return removals, additions, unavailable


def remove_legacy_hook_handlers(config: dict) -> int:
    hooks = config.get("hooks")
    if not isinstance(hooks, dict):
        return 0
    removed = 0
    for event in list(hooks):
        groups = hooks[event]
        if not isinstance(groups, list):
            continue
        kept_groups = []
        for group in groups:
            if not isinstance(group, dict) or not isinstance(group.get("hooks"), list):
                kept_groups.append(group)
                continue
            handlers = []
            for handler in group["hooks"]:
                command = str(handler.get("command", "")) if isinstance(handler, dict) else ""
                legacy = "/ponytail-hooks/" in command or "\\ponytail-hooks\\" in command
                if legacy:
                    removed += 1
                else:
                    handlers.append(handler)
            if handlers:
                group["hooks"] = handlers
                kept_groups.append(group)
        if kept_groups:
            hooks[event] = kept_groups
        else:
            del hooks[event]
    return removed


def _backup(path: Path) -> Path:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    backup = path.with_name(f"{path.name}.backup-{stamp}")
    shutil.copy2(path, backup)
    return backup


def clean_legacy_hooks(hooks_path: Path) -> tuple[int, Path | None]:
    if not hooks_path.exists():
        return 0, None
    config = json.loads(hooks_path.read_text(encoding="utf-8"))
    removed = remove_legacy_hook_handlers(config)
    if not removed:
        return 0, None
    backup = _backup(hooks_path)
    temporary = hooks_path.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(config, indent=2) + "\n", encoding="utf-8")
    temporary.replace(hooks_path)
    return removed, backup


def remove_plugin_tables(text: str, selectors: set[str]) -> str:
    lines = text.splitlines(keepends=True)
    output: list[str] = []
    dropping = False
    for line in lines:
        match = PLUGIN_TABLE.match(line.rstrip("\r\n"))
        if match:
            dropping = match.group(1) in selectors
        elif line.lstrip().startswith("["):
            dropping = False
        if not dropping:
            output.append(line)
    return "".join(output)


def fallback_remove_stale_tables(config_path: Path, selectors: set[str]) -> Path | None:
    if not selectors or not config_path.exists():
        return None
    original = config_path.read_text(encoding="utf-8")
    updated = remove_plugin_tables(original, selectors)
    if updated == original:
        return None
    backup = _backup(config_path)
    temporary = config_path.with_suffix(".toml.tmp")
    temporary.write_text(updated, encoding="utf-8")
    temporary.replace(config_path)
    return backup


def run_codex(codex: str, *args: str) -> bool:
    result = subprocess.run(
        [codex, *args, "--json"],
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode:
        print(result.stderr.strip() or result.stdout.strip(), file=sys.stderr)
        return False
    return True


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Audit or apply the Elephant Hand Codex studio plugin baseline."
    )
    parser.add_argument("--apply", action="store_true", help="Apply the reported changes.")
    parser.add_argument("--codex", default=shutil.which("codex") or "codex")
    args = parser.parse_args()

    codex_home = Path.home() / ".codex"
    config_path = codex_home / "config.toml"
    hooks_path = codex_home / "hooks.json"

    if args.apply and not run_codex(
        args.codex, "plugin", "marketplace", "upgrade", "elephant-hand"
    ):
        return 1

    plugin_states = read_config_plugins(config_path)
    configured = set(plugin_states)
    enabled = {selector for selector, is_enabled in plugin_states.items() if is_enabled}
    available = list_available(args.codex)
    removals, additions, unavailable = plan_actions(
        enabled,
        available,
        podman_ready=podman_is_ready(),
        configured=configured,
    )

    print("Remove:", ", ".join(removals) or "none")
    print("Add:", ", ".join(additions) or "none")
    print("Unavailable:", ", ".join(unavailable) or "none")
    if not args.apply:
        print("Dry run only; pass --apply to normalize this installation.")
        return 0

    failed_removals: set[str] = set()
    for selector in removals:
        if not run_codex(args.codex, "plugin", "remove", selector):
            failed_removals.add(selector)
    backup = fallback_remove_stale_tables(config_path, failed_removals)
    if backup:
        print(f"Removed stale plugin tables after backing up config to {backup}")

    failed_additions = [
        selector
        for selector in additions
        if not run_codex(args.codex, "plugin", "add", selector)
    ]
    removed_hooks, hooks_backup = clean_legacy_hooks(hooks_path)
    if removed_hooks:
        print(
            f"Removed {removed_hooks} legacy Ponytail hook handler(s); "
            f"backup: {hooks_backup}"
        )
    if (codex_home / "ponytail-hooks").exists():
        print(
            "Legacy ~/.codex/ponytail-hooks remains on disk but is no longer registered."
        )
    if "reviewing@elephant-hand" in additions:
        print("Open /hooks in a new Codex session to review and trust Ponytail hooks.")
    if failed_additions:
        print(
            "Failed additions: " + ", ".join(failed_additions),
            file=sys.stderr,
        )
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
