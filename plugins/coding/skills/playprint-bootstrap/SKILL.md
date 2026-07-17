---
name: playprint-bootstrap
description: Explicitly initialize or repair Playprint in a Host Game Repository by installing a pinned Toolchain Snapshot, creating the tracked workspace and repository skill, connecting a same-repository Godot project, and verifying the result.
---

# Playprint Bootstrap

Use this skill only when the user explicitly invokes `$playprint-bootstrap`. It mutates repository instructions and installs a pinned toolchain, so never trigger it implicitly.

## Workflow

1. Read the Host Game Repository's root `AGENTS.md`, inspect its working tree, and locate any existing Godot `project.godot`.
2. Choose an immutable Playprint tag or commit. Do not pin `main`, another branch, or `HEAD`.
3. Read [bootstrap.md](references/bootstrap.md), then run the bundled bootstrap script from this skill's directory.
4. Read the generated `playprint/INIT.md` if initialization pauses. Preserve it until the repair succeeds.
5. Run `node playprint/playprint.mjs doctor` and inspect the managed AGENTS section and `.agents/skills/playprint/SKILL.md`.
6. Report the exact Toolchain Snapshot ref, Godot project path, and verification result.

After initialization, route ordinary prototype work through the repository's `$playprint` skill. Do not keep this large bootstrap workflow in the active context.

## Safety boundaries

- Preserve user-authored AGENTS content and unrelated working-tree changes.
- Keep the replaceable snapshot under ignored `.playprint/toolchain/`.
- Keep durable prototypes, configuration, and instructions under tracked `playprint/` and `.agents/`.
- Refuse a dirty or unrecognized existing Toolchain Snapshot instead of resetting it.
- Never delete `playprint/INIT.md` manually after a failed initialization.
- Never overwrite a non-Playprint directory or an existing non-Godot directory.
