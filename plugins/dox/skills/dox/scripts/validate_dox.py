#!/usr/bin/env python3
"""Validate a DOX AGENTS.md hierarchy without modifying it."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

SKIP_DIRS = {
    ".git",
    ".hg",
    ".svn",
    ".tox",
    ".venv",
    "node_modules",
    "vendor",
    "dist",
    "build",
}
HEADER_RE = re.compile(r"^#{1,6}\s+Child DOX Index\s*$", re.IGNORECASE)
HEADING_RE = re.compile(r"^#{1,6}\s+")
LINK_RE = re.compile(r"]\(([^)]+AGENTS\.md(?:#[^)]*)?)\)", re.IGNORECASE)
CODE_RE = re.compile(r"`([^`]*AGENTS\.md(?:#[^`]*)?)`", re.IGNORECASE)
BARE_RE = re.compile(r"^\s*[-*+]\s+([^\s]+AGENTS\.md(?:#[^\s]*)?)", re.IGNORECASE)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Validate DOX parent-child indexes and AGENTS.md paths."
    )
    parser.add_argument(
        "root",
        nargs="?",
        default=".",
        type=Path,
        help="Repository root (default: current directory).",
    )
    return parser.parse_args()


def agent_files(root: Path) -> list[Path]:
    files: list[Path] = []
    for path in root.rglob("AGENTS.md"):
        if not any(part in SKIP_DIRS for part in path.relative_to(root).parts):
            files.append(path.resolve())
    return sorted(files)


def index_section(path: Path) -> list[str] | None:
    lines = path.read_text(encoding="utf-8").splitlines()
    start = next((i for i, line in enumerate(lines) if HEADER_RE.match(line)), None)
    if start is None:
        return None
    section: list[str] = []
    for line in lines[start + 1 :]:
        if HEADING_RE.match(line):
            break
        section.append(line)
    return section


def entry_strings(lines: list[str]) -> list[str]:
    entries: list[str] = []
    for line in lines:
        matches = LINK_RE.findall(line) or CODE_RE.findall(line)
        if not matches:
            bare = BARE_RE.match(line)
            matches = [bare.group(1)] if bare else []
        entries.extend(matches)
    return entries


def resolve_entry(owner: Path, raw: str) -> Path | None:
    value = raw.split("#", 1)[0].strip().strip("<>")
    if "://" in value or value.startswith("/"):
        return None
    return (owner.parent / value).resolve()


def nearest_parent(doc: Path, root: Path, known: set[Path]) -> Path | None:
    current = doc.parent.parent
    while current == root or root in current.parents:
        candidate = (current / "AGENTS.md").resolve()
        if candidate in known:
            return candidate
        if current == root:
            break
        current = current.parent
    return None


def relative(path: Path, root: Path) -> str:
    try:
        return path.relative_to(root).as_posix()
    except ValueError:
        return str(path)


def validate(root: Path) -> list[str]:
    root = root.resolve()
    errors: list[str] = []
    root_doc = (root / "AGENTS.md").resolve()

    if not root.is_dir():
        return [f"root is not a directory: {root}"]
    if not root_doc.is_file():
        return ["missing root AGENTS.md"]

    docs = agent_files(root)
    known = set(docs)
    if root_doc not in known:
        return ["root AGENTS.md could not be read"]

    root_text = root_doc.read_text(encoding="utf-8")
    if "dox" not in root_text.lower():
        errors.append("AGENTS.md: missing DOX contract marker")

    indexed_by: dict[Path, set[Path]] = {}
    for doc in docs:
        label = relative(doc, root)
        section = index_section(doc)
        if section is None:
            errors.append(f"{label}: missing Child DOX Index section")
            indexed_by[doc] = set()
            continue

        raw_entries = entry_strings(section)
        if len(raw_entries) != len(set(raw_entries)):
            errors.append(f"{label}: duplicate Child DOX Index entry")

        targets: set[Path] = set()
        for raw in raw_entries:
            target = resolve_entry(doc, raw)
            if target is None:
                errors.append(f"{label}: invalid external or absolute index path: {raw}")
                continue
            if target.name != "AGENTS.md":
                errors.append(f"{label}: index target is not AGENTS.md: {raw}")
                continue
            if target != root and root not in target.parents:
                errors.append(f"{label}: index path escapes repository: {raw}")
                continue
            if not target.is_file():
                errors.append(f"{label}: stale index path: {raw}")
                continue
            targets.add(target)
        indexed_by[doc] = targets

    for child in docs:
        if child == root_doc:
            continue
        parent = nearest_parent(child, root, known)
        label = relative(child, root)
        if parent is None:
            errors.append(f"{label}: no parent AGENTS.md found")
            continue
        if child not in indexed_by.get(parent, set()):
            errors.append(
                f"{label}: not indexed by nearest parent {relative(parent, root)}"
            )

    for parent, targets in indexed_by.items():
        for child in targets:
            actual_parent = nearest_parent(child, root, known)
            if actual_parent != parent:
                errors.append(
                    f"{relative(parent, root)}: index skips nearest parent for "
                    f"{relative(child, root)}"
                )

    return errors


def main() -> int:
    args = parse_args()
    errors = validate(args.root)
    if errors:
        for error in errors:
            print(f"DOX error: {error}", file=sys.stderr)
        print(f"DOX validation failed: {len(errors)} error(s)", file=sys.stderr)
        return 1
    print("DOX validation passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
