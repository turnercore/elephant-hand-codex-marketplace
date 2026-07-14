# __COURSE_TITLE__

A local-first Teach Loop course created on __CREATED_DATE__.

## Tutor workflow

1. Read the installed Teach Loop `SKILL.md`.
2. Read `MISSION.md`, `LEARNER.md`, `LEARNING_MAP.md`, `RESOURCES.md`,
   `TUTOR_NOTES.md`, `QUESTIONS.md`, and `state/learner-state.json`.
3. Research before creating a substantive lesson.
4. Create a lesson with `npm run new:lesson -- "Focused title"`.
5. Edit the new MDX file in `lessons/`.
6. Run `npm run validate`, `npm test`, and `npm run build`.
7. After the learner returns results, preserve them in `lesson-returns/`, discuss
   them, and update the learner model before deciding what comes next.

## Learner commands

```bash
npm run dev
```

Open the local URL. Notes and activity evidence are stored in the browser. Use
**Return to tutor** to copy or download a Markdown prompt and machine-readable
JSON.

## Authoring commands

```bash
npm run new:lesson -- "Lesson title"
npm run validate
npm test
npm run build
npm run build:lesson -- 0001-lesson-id
npm run test:e2e
```

## Theme customization

Use the in-app Theme Studio for immediate customization. Durable course themes
live in `src/themes/course-themes.ts`. A lesson may suggest a theme in its
metadata, but learner accessibility choices take precedence.

## Component gallery

During development, open `/?gallery=1` to inspect the reusable lesson kit and
evidence behavior.
