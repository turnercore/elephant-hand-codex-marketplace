#!/usr/bin/env python3
"""Validate the Elephant Hand marketplace without third-party dependencies."""

from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from pathlib import Path


LEGACY_PLUGIN_IDS = {
    "brooks-lint",
    "html-artifacts",
    "improve",
    "mattpocock-skills",
    "ponytail",
}
EXTERNAL_SKILL_OWNERS = {
    "pdf": "pdf@openai-primary-runtime",
}
SEMVER = re.compile(r"^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$")
POSIX_PLUGIN_PATH = re.compile(
    r"\$\{(?:CLAUDE_)?PLUGIN_ROOT\}/([^\"\s]+)"
)
WINDOWS_PLUGIN_PATH = re.compile(
    r"\$env:(?:CLAUDE_)?PLUGIN_ROOT\\([^\"\s}]+)"
)


def load_json(path: Path) -> dict:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"{path}: invalid JSON: {exc}") from exc
    if not isinstance(value, dict):
        raise ValueError(f"{path}: expected a JSON object")
    return value


def skill_name(path: Path) -> str | None:
    text = path.read_text(encoding="utf-8")
    match = re.match(r"^---\s*\n(.*?)\n---", text, re.DOTALL)
    if not match:
        return None
    for line in match.group(1).splitlines():
        key, separator, value = line.partition(":")
        if separator and key.strip() == "name":
            return value.strip().strip("\"'")
    return None


def find_skill_collisions(skill_files: list[Path]) -> dict[str, list[Path]]:
    owners: dict[str, list[Path]] = defaultdict(list)
    for path in skill_files:
        name = skill_name(path)
        if name:
            owners[name].append(path)
    return {name: paths for name, paths in owners.items() if len(paths) > 1}


def _inside(path: Path, root: Path) -> bool:
    try:
        path.relative_to(root)
    except ValueError:
        return False
    return True


def _validate_hooks(plugin_root: Path, errors: list[str]) -> None:
    hooks_path = plugin_root / "hooks" / "hooks.json"
    if not hooks_path.exists():
        return
    try:
        config = load_json(hooks_path)
    except ValueError as exc:
        errors.append(str(exc))
        return
    hooks = config.get("hooks")
    if not isinstance(hooks, dict) or not hooks:
        errors.append(f"{hooks_path}: missing non-empty hooks object")
        return

    command_count = 0
    for groups in hooks.values():
        if not isinstance(groups, list):
            continue
        for group in groups:
            if not isinstance(group, dict):
                continue
            handlers = group.get("hooks", [])
            if not isinstance(handlers, list):
                continue
            for handler in handlers:
                if not isinstance(handler, dict) or handler.get("type") != "command":
                    continue
                command_count += 1
                command = str(handler.get("command", ""))
                matches = POSIX_PLUGIN_PATH.findall(command)
                if not matches:
                    errors.append(
                        f"{hooks_path}: hook command must resolve from PLUGIN_ROOT: {command!r}"
                    )
                for relative in matches:
                    target = (plugin_root / relative).resolve()
                    if not _inside(target, plugin_root) or not target.is_file():
                        errors.append(f"{hooks_path}: missing hook target {relative!r}")

                command_windows = str(handler.get("commandWindows", ""))
                for relative in WINDOWS_PLUGIN_PATH.findall(command_windows):
                    target = (plugin_root / Path(relative.replace("\\", "/"))).resolve()
                    if not _inside(target, plugin_root) or not target.is_file():
                        errors.append(
                            f"{hooks_path}: missing Windows hook target {relative!r}"
                        )
    if not command_count:
        errors.append(f"{hooks_path}: no command hooks found")


def validate(root: Path) -> list[str]:
    root = root.resolve()
    errors: list[str] = []
    marketplace_path = root / ".agents" / "plugins" / "marketplace.json"
    try:
        marketplace = load_json(marketplace_path)
    except ValueError as exc:
        return [str(exc)]

    entries = marketplace.get("plugins")
    if not isinstance(entries, list):
        return [f"{marketplace_path}: plugins must be an array"]

    plugin_names: set[str] = set()
    skill_files: list[Path] = []
    for entry in entries:
        if not isinstance(entry, dict):
            errors.append(f"{marketplace_path}: plugin entry must be an object")
            continue
        name = entry.get("name")
        if not isinstance(name, str) or not name:
            errors.append(f"{marketplace_path}: plugin entry has no name")
            continue
        if name in plugin_names:
            errors.append(f"{marketplace_path}: duplicate plugin name {name!r}")
        plugin_names.add(name)
        if name in LEGACY_PLUGIN_IDS:
            errors.append(f"{marketplace_path}: legacy plugin ID {name!r} is forbidden")

        source = entry.get("source")
        source_path = source.get("path") if isinstance(source, dict) else None
        if not isinstance(source_path, str) or not source_path.startswith("./"):
            errors.append(f"{marketplace_path}: {name!r} needs a ./ local source path")
            continue
        plugin_root = (root / source_path).resolve()
        if not _inside(plugin_root, root) or not plugin_root.is_dir():
            errors.append(f"{marketplace_path}: {name!r} source path is missing or escapes root")
            continue

        manifest_path = plugin_root / ".codex-plugin" / "plugin.json"
        try:
            manifest = load_json(manifest_path)
        except ValueError as exc:
            errors.append(str(exc))
            continue
        if manifest.get("name") != name:
            errors.append(
                f"{manifest_path}: manifest name {manifest.get('name')!r} does not match {name!r}"
            )
        version = manifest.get("version")
        if not isinstance(version, str) or not SEMVER.match(version):
            errors.append(f"{manifest_path}: version must be semantic")

        skills_path = manifest.get("skills", "./skills/")
        if not isinstance(skills_path, str) or not skills_path.startswith("./"):
            errors.append(f"{manifest_path}: skills path must start with ./")
        else:
            skills_root = (plugin_root / skills_path).resolve()
            if not _inside(skills_root, plugin_root) or not skills_root.is_dir():
                errors.append(f"{manifest_path}: skills path is missing or escapes plugin root")
            else:
                skill_files.extend(sorted(skills_root.rglob("SKILL.md")))
        _validate_hooks(plugin_root, errors)

    collisions = find_skill_collisions(skill_files)
    for name, paths in sorted(collisions.items()):
        rendered = ", ".join(str(path.relative_to(root)) for path in paths)
        errors.append(f"duplicate skill name {name!r}: {rendered}")

    for path in skill_files:
        name = skill_name(path)
        if name is None:
            errors.append(f"{path.relative_to(root)}: missing frontmatter name")
        elif name in EXTERNAL_SKILL_OWNERS:
            errors.append(
                f"{path.relative_to(root)}: skill {name!r} is owned by "
                f"{EXTERNAL_SKILL_OWNERS[name]}"
            )
    return errors


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    errors = validate(root)
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1
    print("Marketplace validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
