# Changelog

## 0.2.0 · 2026-07-14

- Added a collapsible section-progress rail that highlights the section currently being read.
- Replaced the redundant evidence sidebar with a slim top reading-progress strip.
- Added a persistent, collapsible desktop notes dock and a dedicated mobile notes sheet.
- Rebuilt the tutor-return dialog with a scrollable body and fixed action footer so Copy, Markdown, and JSON remain visible at short viewport heights.
- Added previous and next available lesson navigation.
- Added `KeyTerm` for first-use vocabulary definitions with accessible popovers and optional citations.
- Added `GuidedResource` for framing external animations, step-throughs, demonstrations, and articles as active learning tasks.
- Added source-aware media captions and stronger inline citation requirements.
- Added a procedural-realism validation gate: physical procedures require an inspected video, guided resource, or sourced image sequence.
- Strengthened agent instructions to use web and image search, inspect real demonstrations, and avoid relying on generated diagrams for intricate physical procedures.
- Expanded browser coverage to seven passing tests across notes, return export, section tracking, theming, portable output, short viewports, and mobile.

## 0.1.0 · 2026-07-13

- Initial Teach Loop skill and course scaffold.
- React, Vite, TypeScript, MDX, Tailwind, Radix, and shadcn/ui-compatible UI.
- Notes sidebar and structured Markdown/JSON tutor returns.
- Course, lesson, and learner-controlled theming with system/light/dark modes.
- Prediction, checkpoint, quiz, flashcard, classification, worked-example,
  chart, parameter, video, citation, tooltip, and Three.js components.
- Local learner model, living milestones, source packet, tutor notes, questions,
  learning records, and lesson returns.
- Safe empty-directory initializer, optional git, validation, unit tests,
  Playwright tests, and single-file lesson builds.
