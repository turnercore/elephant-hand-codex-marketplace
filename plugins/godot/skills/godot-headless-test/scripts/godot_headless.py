#!/usr/bin/env python3
from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path


MACOS_GODOT_PATH = Path("/Applications/Godot.app/Contents/MacOS/Godot")


def find_godot_binary() -> str:
    candidates: list[str] = []
    env_bin = os.environ.get("GODOT_BIN", "").strip()
    if env_bin:
        candidates.append(env_bin)
    for name in ("godot", "godot4"):
        resolved = shutil.which(name)
        if resolved:
            candidates.append(resolved)
    if MACOS_GODOT_PATH.exists():
        candidates.append(str(MACOS_GODOT_PATH))

    seen: set[str] = set()
    for candidate in candidates:
        if candidate in seen:
            continue
        seen.add(candidate)
        if Path(candidate).exists():
            return candidate
    raise FileNotFoundError(
        "Could not find a Godot binary. Set GODOT_BIN or install Godot in a standard location."
    )


def normalize_project_path(raw_path: str) -> Path:
    path = Path(raw_path).expanduser().resolve()
    if path.is_file() and path.name == "project.godot":
        return path.parent
    project_file = path / "project.godot"
    if project_file.exists():
        return path
    raise FileNotFoundError(f"Could not find project.godot under: {path}")


def normalize_project_resource(project_dir: Path, raw_path: str) -> str:
    if raw_path.startswith("res://"):
        return str(project_dir / raw_path.removeprefix("res://"))
    path = Path(raw_path).expanduser()
    if path.is_absolute():
        return str(path)
    return str((project_dir / path).resolve())


def run_command(command: list[str], timeout: int) -> int:
    print("+", " ".join(command))
    try:
        completed = subprocess.run(command, timeout=timeout, check=False)
    except subprocess.TimeoutExpired:
        print(f"Command timed out after {timeout} seconds.", file=sys.stderr)
        return 124
    return completed.returncode


def build_base_command(project_dir: Path) -> list[str]:
    return [find_godot_binary(), "--headless", "--path", str(project_dir)]


def cmd_locate(_args: argparse.Namespace) -> int:
    print(find_godot_binary())
    return 0


def cmd_version(_args: argparse.Namespace) -> int:
    return run_command([find_godot_binary(), "--version"], timeout=15)


def cmd_import(args: argparse.Namespace) -> int:
    project_dir = normalize_project_path(args.project)
    command = build_base_command(project_dir) + ["--import"]
    return run_command(command, timeout=args.timeout)


def cmd_smoke(args: argparse.Namespace) -> int:
    project_dir = normalize_project_path(args.project)
    command = build_base_command(project_dir)
    if args.scene:
        command += ["--scene", args.scene]
    command += ["--quit-after", str(args.frames)]
    return run_command(command, timeout=args.timeout)


def cmd_script_check(args: argparse.Namespace) -> int:
    project_dir = normalize_project_path(args.project)
    script_path = normalize_project_resource(project_dir, args.script)
    command = build_base_command(project_dir) + ["--script", script_path, "--check-only"]
    return run_command(command, timeout=args.timeout)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Run Godot projects headlessly.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    locate_parser = subparsers.add_parser("locate", help="Print the discovered Godot binary.")
    locate_parser.set_defaults(func=cmd_locate)

    version_parser = subparsers.add_parser("version", help="Print the installed Godot version.")
    version_parser.set_defaults(func=cmd_version)

    import_parser = subparsers.add_parser("import", help="Import project resources and quit.")
    import_parser.add_argument("--project", required=True, help="Absolute project directory or project.godot path.")
    import_parser.add_argument("--timeout", type=int, default=180, help="Timeout in seconds.")
    import_parser.set_defaults(func=cmd_import)

    smoke_parser = subparsers.add_parser("smoke", help="Run a project or scene headlessly for a finite number of frames.")
    smoke_parser.add_argument("--project", required=True, help="Absolute project directory or project.godot path.")
    smoke_parser.add_argument("--scene", help="Optional res:// scene path to run instead of the project's main scene.")
    smoke_parser.add_argument("--frames", type=int, default=180, help="Number of frames to run before quitting.")
    smoke_parser.add_argument("--timeout", type=int, default=180, help="Timeout in seconds.")
    smoke_parser.set_defaults(func=cmd_smoke)

    script_parser = subparsers.add_parser("script-check", help="Parse-check a GDScript file and quit.")
    script_parser.add_argument("--project", required=True, help="Absolute project directory or project.godot path.")
    script_parser.add_argument("--script", required=True, help="Script path, usually res://path/to/file.gd.")
    script_parser.add_argument("--timeout", type=int, default=60, help="Timeout in seconds.")
    script_parser.set_defaults(func=cmd_script_check)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
