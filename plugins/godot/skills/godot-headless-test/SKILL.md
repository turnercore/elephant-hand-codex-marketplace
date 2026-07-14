---
name: godot-headless-test
description: "Run, import, and smoke-test Godot 4.x projects from the terminal using the installed editor binary in headless mode. Use when Codex needs to actually validate a Godot project instead of only reading code: startup checks, asset import checks, scene smoke tests, script parse checks, CLI verification, or quick regression testing for Godot games and tools."
---

# Godot Headless Test

Use this skill to validate a Godot project by running the engine headlessly.

## Workflow

1. Confirm the Godot binary.
Run `scripts/godot_headless.py locate` or `scripts/godot_headless.py version`.

2. Import assets when project files or imported resources may be stale.
Run `scripts/godot_headless.py import --project /abs/project`.

3. Smoke-test the project or a scene.
Run `scripts/godot_headless.py smoke --project /abs/project`.
Use `--scene res://path/to/scene.tscn` to start a specific scene.
Use `--frames N` to control how long the scene runs before auto-quit.

4. Parse-check a script when the change is isolated to one GDScript file.
Run `scripts/godot_headless.py script-check --project /abs/project --script res://path/to/file.gd`.

5. Report what was run and the key output.
Include the exact command mode, the exit code, and any engine errors or warnings that look relevant.

## Defaults

- Prefer `smoke` for fast validation after gameplay or scene changes.
- Prefer `import` before `smoke` if resources, `.tscn`, `.tres`, or imported art changed.
- Use `--timeout` when a project may hang in headless mode.
- Use `GODOT_BIN=/path/to/Godot` when the default binary discovery is wrong.

## Limits

- Headless mode disables rendering and window management. Visual layout issues still need a real windowed run.
- `smoke` is only a startup/runtime sanity check. Passing it does not prove gameplay is correct.
- If a project relies on user input or a long-running main loop, keep `--frames` finite so the run exits deterministically.

## Resources

- Script runner: `scripts/godot_headless.py`
- Command notes: `references/cli-notes.md`
