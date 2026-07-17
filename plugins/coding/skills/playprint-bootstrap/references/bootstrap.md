# Bootstrap command

Run the bundled Node script from the installed skill directory:

```sh
node scripts/bootstrap.mjs \
  --root /absolute/path/to/host-game \
  --godot godot \
  --ref v0.2.0-alpha.3
```

Options:

- `--root` is required and must be the Host Game Repository root.
- `--godot` defaults to `godot`. It may point at an existing same-repository Godot project. If the path is absent or empty, the script creates a minimal Godot 4 project.
- `--ref` defaults to the bootstrap skill's pinned release and must be an immutable tag or commit.
- `--source` defaults to the internal Forgejo repository.

The script verifies Git and Node, installs `.playprint/toolchain`, builds the packages, runs Playprint initialization, installs the tracked prototype workspace dependencies, and runs doctor. It is resumable when the existing snapshot is clean and matches the configured source.

If installation fails:

1. Keep `playprint/INIT.md`.
2. Read the first failing command and repair that boundary.
3. If `.playprint/toolchain` is dirty or unrecognized, ask before removing it and rerun bootstrap.
4. Do not hand-copy compiler output or weaken validation to make doctor pass.
