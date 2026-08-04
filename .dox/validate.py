#!/usr/bin/env python3
"""Validate a minimal DOX AGENTS.md context-routing hierarchy."""

from __future__ import annotations

import argparse
import fnmatch
import json
import re
import sys
import tomllib
from dataclasses import dataclass
from pathlib import Path

DOX_VALIDATOR_VERSION = "0.4.1"
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
DYNAMIC_FACTS = {
    "digest": re.compile(r"\bsha256:[0-9a-f]{32,}\b", re.IGNORECASE),
    "IP address": re.compile(r"(?<![\d.])(?:\d{1,3}\.){3}\d{1,3}(?![\d.])"),
    "dated fact": re.compile(r"\b20\d{2}-\d{2}-\d{2}\b"),
    "host path": re.compile(r"(?:^|[\s`])/(?:etc|opt|var|home|Users)/[^\s`]+"),
    "version": re.compile(r"\bv?\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?\b"),
}


@dataclass(frozen=True)
class Policy:
    exclude: tuple[str, ...] = ()
    root_max_bytes: int = 6000
    child_max_bytes: int = 4000
    chain_max_bytes: int = 16000
    duplicate_paragraphs: str = "error"
    dynamic_root_facts: str = "warning"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Validate DOX hierarchy, context budgets, and duplication."
    )
    parser.add_argument("root", nargs="?", default=".", type=Path)
    parser.add_argument("--config", type=Path, help="Policy file (default: <root>/.dox.toml)")
    parser.add_argument("--json", action="store_true", help="Emit machine-readable output")
    return parser.parse_args()


def load_policy(root: Path, config: Path | None) -> tuple[Policy, list[str]]:
    path = (config or root / ".dox.toml").resolve()
    if not path.is_file():
        return Policy(), [f"policy file not found; using defaults: {path}"]
    try:
        document = tomllib.loads(path.read_text(encoding="utf-8"))
    except (OSError, tomllib.TOMLDecodeError) as exc:
        raise ValueError(f"cannot read policy {path}: {exc}") from exc
    if document.get("version") != 1:
        raise ValueError(f"unsupported policy version in {path}; expected 1")
    budgets = document.get("budgets", {})
    lint = document.get("lint", {})
    paths = document.get("paths", {})
    values = Policy(
        exclude=_string_list(paths, "exclude"),
        root_max_bytes=_positive_int(budgets, "root_max_bytes", Policy.root_max_bytes),
        child_max_bytes=_positive_int(budgets, "child_max_bytes", Policy.child_max_bytes),
        chain_max_bytes=_positive_int(budgets, "chain_max_bytes", Policy.chain_max_bytes),
        duplicate_paragraphs=_lint_level(lint, "duplicate_paragraphs", Policy.duplicate_paragraphs),
        dynamic_root_facts=_lint_level(lint, "dynamic_root_facts", Policy.dynamic_root_facts),
    )
    return values, []


def _string_list(values: object, key: str) -> tuple[str, ...]:
    if not isinstance(values, dict) or key not in values:
        return ()
    value = values[key]
    if not isinstance(value, list) or any(not isinstance(item, str) or not item for item in value):
        raise ValueError(f"{key} must be an array of non-empty strings")
    return tuple(value)


def _positive_int(values: object, key: str, default: int) -> int:
    if not isinstance(values, dict) or key not in values:
        return default
    value = values[key]
    if not isinstance(value, int) or isinstance(value, bool) or value <= 0:
        raise ValueError(f"{key} must be a positive integer")
    return value


def _lint_level(values: object, key: str, default: str) -> str:
    if not isinstance(values, dict) or key not in values:
        return default
    value = values[key]
    if value not in {"off", "warning", "error"}:
        raise ValueError(f"{key} must be off, warning, or error")
    return str(value)


def agent_files(root: Path, exclude: tuple[str, ...]) -> list[Path]:
    files: list[Path] = []
    for path in root.rglob("AGENTS.md"):
        relative_path = path.relative_to(root)
        if (
            not any(part in SKIP_DIRS for part in relative_path.parts)
            and not any(fnmatch.fnmatch(relative_path.as_posix(), pattern) for pattern in exclude)
        ):
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


def context_chain(doc: Path, root_doc: Path, root: Path, known: set[Path]) -> list[Path]:
    chain = [doc]
    current = doc
    while current != root_doc:
        parent = nearest_parent(current, root, known)
        if parent is None or parent in chain:
            break
        chain.append(parent)
        current = parent
    return list(reversed(chain))


def normalized_paragraphs(path: Path) -> list[str]:
    paragraphs: list[str] = []
    block: list[str] = []
    in_code = False
    in_index = False

    def flush() -> None:
        if not block:
            return
        value = " ".join(item.strip() for item in block)
        value = re.sub(r"^[-*+]\s+", "", value)
        value = re.sub(r"\s+", " ", value).strip().lower()
        if len(value) >= 100:
            paragraphs.append(value)
        block.clear()

    for line in path.read_text(encoding="utf-8").splitlines():
        if line.strip().startswith("```"):
            flush()
            in_code = not in_code
            continue
        if in_code:
            continue
        if HEADER_RE.match(line):
            flush()
            in_index = True
            continue
        if in_index and HEADING_RE.match(line):
            in_index = False
        if in_index or HEADING_RE.match(line) or not line.strip():
            flush()
            continue
        block.append(line)
    flush()
    return paragraphs


def _record(level: str, message: str, errors: list[str], warnings: list[str]) -> None:
    if level == "error":
        errors.append(message)
    elif level == "warning":
        warnings.append(message)


def validate(root: Path, policy: Policy) -> dict[str, object]:
    root = root.resolve()
    errors: list[str] = []
    warnings: list[str] = []
    root_doc = (root / "AGENTS.md").resolve()
    if not root.is_dir():
        return {"errors": [f"root is not a directory: {root}"], "warnings": [], "metrics": {}}
    if not root_doc.is_file():
        return {"errors": ["missing root AGENTS.md"], "warnings": [], "metrics": {}}

    docs = agent_files(root, policy.exclude)
    known = set(docs)
    if root_doc not in known:
        return {"errors": ["root AGENTS.md could not be read"], "warnings": [], "metrics": {}}
    if "dox" not in root_doc.read_text(encoding="utf-8").lower():
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
        elif child not in indexed_by.get(parent, set()):
            errors.append(f"{label}: not indexed by nearest parent {relative(parent, root)}")

    for parent, targets in indexed_by.items():
        for child in targets:
            actual_parent = nearest_parent(child, root, known)
            if actual_parent != parent:
                errors.append(
                    f"{relative(parent, root)}: index skips nearest parent for {relative(child, root)}"
                )

    sizes = {doc: len(doc.read_bytes()) for doc in docs}
    for doc, size in sizes.items():
        budget = policy.root_max_bytes if doc == root_doc else policy.child_max_bytes
        if size > budget:
            errors.append(f"{relative(doc, root)}: {size} bytes exceeds {budget}-byte context budget")

    largest_chain: list[Path] = []
    largest_chain_bytes = 0
    for doc in docs:
        chain = context_chain(doc, root_doc, root, known)
        size = sum(sizes[item] for item in chain)
        if size > largest_chain_bytes:
            largest_chain = chain
            largest_chain_bytes = size
        if size > policy.chain_max_bytes:
            labels = " -> ".join(relative(item, root) for item in chain)
            errors.append(f"{labels}: {size} bytes exceeds {policy.chain_max_bytes}-byte chain budget")

    seen: dict[str, Path] = {}
    reported: set[tuple[Path, Path, str]] = set()
    if policy.duplicate_paragraphs != "off":
        for doc in docs:
            for paragraph in normalized_paragraphs(doc):
                first = seen.get(paragraph)
                if first is None:
                    seen[paragraph] = doc
                    continue
                key = (first, doc, paragraph)
                if first != doc and key not in reported:
                    reported.add(key)
                    _record(
                        policy.duplicate_paragraphs,
                        f"duplicate context in {relative(first, root)} and {relative(doc, root)}: {paragraph[:80]}…",
                        errors,
                        warnings,
                    )

    if policy.dynamic_root_facts != "off":
        for number, line in enumerate(root_doc.read_text(encoding="utf-8").splitlines(), start=1):
            for kind, pattern in DYNAMIC_FACTS.items():
                if pattern.search(line):
                    _record(
                        policy.dynamic_root_facts,
                        f"AGENTS.md:{number}: volatile {kind}; prefer a linked authoritative document",
                        errors,
                        warnings,
                    )

    metrics = {
        "documents": len(docs),
        "total_bytes": sum(sizes.values()),
        "root_bytes": sizes[root_doc],
        "largest_chain_bytes": largest_chain_bytes,
        "largest_chain_estimated_tokens": (largest_chain_bytes + 3) // 4,
        "largest_chain": [relative(item, root) for item in largest_chain],
        "budgets": {
            "root_max_bytes": policy.root_max_bytes,
            "child_max_bytes": policy.child_max_bytes,
            "chain_max_bytes": policy.chain_max_bytes,
        },
    }
    return {"errors": errors, "warnings": warnings, "metrics": metrics}


def print_human(result: dict[str, object]) -> None:
    errors = list(result["errors"])
    warnings = list(result["warnings"])
    metrics = dict(result["metrics"])
    for warning in warnings:
        print(f"DOX warning: {warning}", file=sys.stderr)
    for error in errors:
        print(f"DOX error: {error}", file=sys.stderr)
    if metrics:
        budgets = dict(metrics["budgets"])
        print(
            f"DOX context: root {metrics['root_bytes']}/{budgets['root_max_bytes']} bytes; "
            f"largest chain {metrics['largest_chain_bytes']}/{budgets['chain_max_bytes']} bytes "
            f"(~{metrics['largest_chain_estimated_tokens']} tokens); "
            f"total {metrics['total_bytes']} bytes across {metrics['documents']} files"
        )
        print(f"DOX largest chain: {' -> '.join(metrics['largest_chain'])}")
    if errors:
        print(f"DOX validation failed: {len(errors)} error(s)", file=sys.stderr)
    else:
        print("DOX validation passed")


def main() -> int:
    args = parse_args()
    root = args.root.resolve()
    try:
        policy, policy_warnings = load_policy(root, args.config)
    except ValueError as exc:
        result: dict[str, object] = {"errors": [str(exc)], "warnings": [], "metrics": {}}
    else:
        result = validate(root, policy)
        result["warnings"] = [*policy_warnings, *list(result["warnings"])]
    if args.json:
        print(json.dumps({"validator_version": DOX_VALIDATOR_VERSION, **result}, indent=2, sort_keys=True))
    else:
        print_human(result)
    return 1 if result["errors"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
