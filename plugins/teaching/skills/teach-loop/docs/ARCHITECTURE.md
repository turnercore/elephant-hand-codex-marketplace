# Teach Loop architecture

## Two repositories in one package

The installed skill remains intact in the agent's skills directory. Its
initializer copies `workspace-template/` into a fresh course directory. The
course then owns its local learner state, source packet, lessons, UI source,
tests, and build outputs.

```text
installed teach-loop skill
  SKILL.md
  references/
  scripts/init-course.mjs
  workspace-template/
            |
            | copy + substitute + install + git init
            v
local course repository
  mission + learner model + sources + notes
  React/MDX lesson runtime
  lesson sources and portable HTML builds
```

## Runtime layers

### Course and lesson content

- `src/course/course.config.ts`
- `src/course/sources.ts`
- `lessons/*.mdx`

MDX keeps prose inspectable while allowing typed React learning components.
The Vite lesson registry discovers numbered lesson files automatically.

### Lesson kit

`src/lesson-kit.ts` exposes the authoring API. UI primitives are source-owned,
shadcn/ui-compatible wrappers over Radix primitives. Learning components add
pedagogical behavior and evidence capture.

### Evidence and notes

`EvidenceProvider` stores a snapshot per course and lesson. Components report
responses, attempts, hints, confidence, meaningful interaction state,
completion, and notes. Local storage is used when available; export still works
in memory when storage is blocked.

### Return packet

`ExportDialog` combines evidence with learner reflection and theme preferences.
It produces Markdown for pasting into a tutor conversation and JSON for durable
or programmatic use.

### Themes

Semantic CSS variables drive all ordinary components. Theme resolution is:

1. learner custom theme
2. learner-selected preset
3. lesson suggestion
4. course default
5. Teach Loop default

Mode is system, light, or dark. Custom theme data is part of the lesson return.

### Three.js

Three.js runs through a reusable React canvas shell with resize handling,
render-on-demand controls, cleanup, reset, theme-aware background, evidence
hooks, and a non-WebGL fallback. Custom experiences should keep instructions,
labels, and exact values in accessible DOM UI around the canvas.

## Build outputs

- `npm run build` creates one self-contained course HTML file.
- `npm run build:lesson -- <id>` creates one self-contained lesson HTML file.
- external videos and remote resources remain external by design and must have
  offline or non-video alternatives.

## v0.2 lesson shell

The desktop shell uses three responsive columns: a collapsible current-section rail, the reading surface, and a collapsible notes dock. The header owns the course selector, theme controls, tutor-return action, and a thin reading-progress strip. On mobile, the section rail disappears and notes move into a sheet.

`CourseShell` discovers `LessonSection` elements after render and tracks the active section from scroll position. Adjacent lesson links are computed only from lesson files that currently exist. `ExportDialog` uses a fixed header and action footer around a scrollable body, keeping return controls reachable on short screens.

Procedural lesson validation is intentionally stricter than general conceptual lessons. A physical procedure must include an inspected real-world demonstration through `VideoSegment`, `GuidedResource`, or a source-registered `MediaFigure`.
