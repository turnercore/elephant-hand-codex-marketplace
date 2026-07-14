# Teach Loop

A local-first, agent-forward private tutor skill. Teach Loop turns an empty
folder into a durable learning workspace and a polished React lesson runtime.
The tutor researches, builds one tightly scoped interactive lesson, receives a
structured return packet, discusses the evidence with the learner, updates its
model, and chooses the next best action.

Teach Loop is intentionally not a syllabus generator, LMS, grading system, or
teacher administration suite. The lesson-to-conversation feedback loop is the
product.

## What ships

- An installable `SKILL.md` with a complete tutor workflow.
- A safe course initializer that refuses to overwrite non-empty directories.
- A Vite + React + TypeScript + MDX course runtime.
- Source-owned shadcn/ui-style components built on Radix primitives.
- System, light, and dark modes plus course, lesson, and learner themes.
- An interactive theme studio whose settings are included in lesson returns.
- Global and anchored notes in a collapsible desktop dock or mobile sheet, autosaved locally.
- Markdown and JSON return packets with a fixed, always-reachable export footer.
- Reusable prediction, quiz, checkpoint, worked-example, flashcard, chart,
  guided-resource, video, vocabulary, citation, tooltip, and Three.js components.
- Local learner state, living milestones, source records, questions, and
  evidence-oriented learning records.
- Agent playbooks for research, Socratic dialogue, lesson authoring,
  visualization, Three.js, video, citations, accessibility, and QA.
- A current-section progress rail, top reading-progress strip, and adjacent lesson navigation.
- Procedural-realism, research, vocabulary, citation, and media validation gates.
- Unit tests, seven browser tests, validation scripts, and single-file lesson builds.

## Install as a skill

Copy this entire folder into your agent's skills directory. The exact location
varies by agent. The folder must remain intact because `SKILL.md` invokes
`scripts/init-course.mjs` and copies `workspace-template/`.

## Start a course manually

```bash
mkdir shader-math
cd shader-math
node /absolute/path/to/teach-loop-skill/scripts/init-course.mjs "Shader Math"
```

The initializer installs dependencies and runs `git init` by default. Useful
flags:

```bash
node /path/to/teach-loop-skill/scripts/init-course.mjs "Shader Math" --no-git
node /path/to/teach-loop-skill/scripts/init-course.mjs "Shader Math" --no-install
node /path/to/teach-loop-skill/scripts/init-course.mjs "Shader Math" --package-manager pnpm
```

Then:

```bash
npm run dev
npm run new:lesson -- "A focused lesson title"
npm run validate
npm run build
npm run build:lesson -- 0001-focused-lesson-title
```

## Screenshots

- `docs/orientation-light.png`
- `docs/orientation-dark.png`
- `docs/orientation-mobile.png`
- `docs/component-gallery.png`
- `docs/v0.2-shell.png`
- `docs/v0.2-export-dialog.png`

See `docs/ARCHITECTURE.md` for the runtime and data flow.

## Core loop

```text
goal and context
  -> light diagnosis
  -> source research
  -> interactive lesson
  -> return packet
  -> Socratic/direct conversation
  -> learner model update
  -> next best action
```

The next action does not have to be another lesson. It may be a direct answer,
a diagnostic question, a short practice prompt, a milestone revision, more
research, or a targeted lesson.

## Attribution

Teach Loop extends Matt Pocock's MIT-licensed `teach` skill. See
`THIRD_PARTY_NOTICES.md`.
