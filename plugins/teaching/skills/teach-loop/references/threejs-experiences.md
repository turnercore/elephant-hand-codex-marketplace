# Three.js learning experiences

Teach Loop uses native Three.js inside reusable React components.

## Use 3D when depth matters

Good uses include:

- coordinate spaces and transforms
- geometry, vectors, normals, and projections
- anatomy and spatial structure
- orbital, mechanical, or physical systems
- architecture and spatial composition
- camera, lighting, and shader concepts
- volumetric or surface data

Prefer SVG, Canvas2D, or a chart when labels, exact values, or simple 2D
relationships dominate.

## Scene contract

Before coding, define:

- learning question
- objects and what each represents
- coordinate frame and scale
- learner controls
- prediction or task before manipulation
- evidence to record
- reset behavior
- named camera states or orientation cues
- reduced-motion behavior
- text or 2D fallback
- mobile touch behavior

## Runtime pattern

Use `ThreeLessonScene` or `ThreeCanvas` for the shell. Put custom Three.js setup in a focused
component. Keep labels, instructions, legends, and exact values in DOM overlays.
Use `useEvidence()` to record meaningful state changes, not every animation
frame.

Record events such as:

- learner predicted a result before moving controls
- learner tested both positive and negative cases
- learner reset and retried
- learner reached a target configuration
- final parameter state

## Performance

- Lazy-load 3D components.
- Cap device pixel ratio.
- Pause or reduce rendering when offscreen.
- Avoid many simultaneous canvases.
- Reuse geometry and materials.
- Prefer instancing for repeated objects.
- Respect `prefers-reduced-motion`.
- Test mobile and keyboard-accessible alternative controls.

## Visual truthfulness

Perspective, size, color, motion, and particles must encode something real. If
an effect has no learning meaning, remove it. Cosmetic 3D adds cognitive and
technical cost without adding understanding.
