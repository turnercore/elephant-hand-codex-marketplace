# Validation record

Validated on 2026-07-14 with Node 22.16.0, npm, and system Chromium.

## Fresh scaffold

The release was tested from the installable skill, not only inside its template:

- initialized a genuinely empty directory with dependency installation
- initialized git on the `main` branch
- passed the workspace doctor
- confirmed the generated project reports version `0.2.0`
- generated a correctly numbered second lesson
- confirmed the initializer leaves the reusable skill template free of `node_modules`, build output, and test artifacts

## Static, unit, and production checks

```text
npm run validate                         passed
npm test                                 1/1 passed
npm run build:lesson -- 0000-orientation passed
npm run build                            passed
```

Both the single lesson and complete course were emitted as self-contained HTML files. TypeScript strict checking is part of `npm run validate`.

The validator was also exercised negatively: a lesson marked `procedural` without a sourced `VideoSegment`, `GuidedResource`, or `MediaFigure` was correctly rejected.

## Browser checks

The Browser plugin was not available in this environment, so Playwright used the installed system Chromium. The portable single-file course was injected directly into the browser page because administrator policy blocked localhost and `file:` navigation. This still exercised the production HTML, CSS, JavaScript, local state, and interactions.

Seven Playwright tests passed:

1. anchored note capture and inclusion in the Markdown tutor return
2. dark-mode selection
3. portable course rendering without application console errors
4. collapsible lesson-progress rail and current-section tracking
5. reachable, collapsible desktop notes dock
6. visible Copy, Markdown, and JSON actions at a 1100×600 viewport
7. mobile notes sheet and top reading-progress strip

## Visual review

Reviewed screenshots at 1440×950 and 1100×600:

- expanded lesson section rail
- expanded desktop notes dock
- reading layout and responsive column behavior
- fixed tutor-return action footer
- visible Copy, Markdown, and JSON controls at short height
- semantic light-theme rendering and typography

Screenshots:

- `docs/v0.2-shell.png`
- `docs/v0.2-export-dialog.png`

No material visual or interaction defects remain in the tested flow.
