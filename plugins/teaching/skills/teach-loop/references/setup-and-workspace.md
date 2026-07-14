# Setup and workspace

## Initialization contract

Teach Loop initializes only an empty directory. This protects existing work and
makes the course root unambiguous.

```bash
node "$SKILL_ROOT/scripts/init-course.mjs" "Course title"
```

Default behavior:

1. Refuse a non-empty target directory.
2. Copy `workspace-template/` including dotfiles.
3. Replace title, slug, date, and version placeholders.
4. Install dependencies with npm unless another package manager is selected.
5. Run `git init` when git is available.
6. Run the workspace doctor and print the next commands.

Flags:

- `--target <path>` initializes a directory other than the current directory.
- `--package-manager npm|pnpm|bun` selects the installer.
- `--no-install` copies without installing.
- `--no-git` skips git.
- `--force` is intentionally not supported. Safety beats convenience.

## Workspace files

| Path | Purpose |
|---|---|
| `MISSION.md` | Concrete purpose and observable success |
| `LEARNER.md` | Learner-declared context and preferences |
| `LEARNING_MAP.md` | Living optional milestones and capabilities |
| `RESOURCES.md` | Curated, annotated source packet |
| `TUTOR_NOTES.md` | Inspectable tutor observations and teaching notes |
| `QUESTIONS.md` | Open, answered, deferred, and lesson-worthy questions |
| `GLOSSARY.md` | Canonical vocabulary once understood |
| `state/learner-state.json` | Structured evidence and tentative inferences |
| `state/evidence.jsonl` | Optional append-only cross-lesson evidence ledger |
| `lessons/*.mdx` | Source lessons |
| `lesson-returns/` | Markdown or JSON returns from completed lessons |
| `learning-records/` | Decision-grade changes to future teaching assumptions |
| `reference/` | Durable cheat sheets and reference artifacts |
| `src/` | Reusable lesson runtime and custom components |
| `built-lessons/` | Portable single-file lesson builds |

## Git behavior

The initializer attempts `git init` but does not create a commit. This avoids
failing on machines without configured author identity. The tutor may stage or
commit only when the learner asks or the surrounding agent workflow permits it.

## Existing workspace recognition

`.teach-loop.json` is the marker. Never infer that a random React project is a
Teach Loop course merely because it has similar files.
