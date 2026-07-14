# Godot CLI Notes

Use this file only when the command behavior is unclear.

## Current assumptions

- Prefer the installed editor binary.
- Prefer `--headless --path <project>` for automated checks.
- Prefer `--quit-after N` for deterministic smoke tests.
- Prefer `--import` when imported assets may be stale.
- Prefer `--script ... --check-only` for isolated GDScript parse validation.

## Relevant docs

- Official Godot docs confirm `--headless` disables rendering and window management.
- Official Godot docs confirm `--path` points commands at a project directory.
- Official Godot docs confirm `--quit` exits after the first iteration.
- The installed Godot 4.6.1 help output confirms `--quit-after`, `--scene`, `--import`, and `--check-only`.

## Practical guidance

- Use `smoke` after gameplay, scene, resource, or project setting changes.
- Use `import` before `smoke` if `.import` state may be outdated.
- Use `script-check` for focused GDScript changes when a full project run is unnecessary.
- Treat warnings separately from hard failures. Report both, but do not confuse a non-fatal warning with a failing exit code.
