# Lesson component guide

Import from `@/lesson-kit` in MDX.

## Structure and explanation

- `LessonSection`: titled section with an anchored note action.
- `Callout`: important context, caution, insight, or example.
- `ConceptTooltip`: a concise optional aside for a concept already introduced.
- `KeyTerm`: first-use vocabulary with an accessible definition popover and optional citation.
- `WorkedExample`: staged reasoning with controlled reveal.
- `ContrastCases`: compare ideas that are easy to confuse.

## Retrieval and assessment

- `PredictionPrompt`: locks the initial prediction before reveal.
- `MultipleChoice`: records choice, correctness, attempts, and confidence.
- `Checkpoint`: free response with a hint ladder and self-assessment.
- `ConfidenceCheck`: records confidence independently of correctness.
- `FlashcardDeck`: retrieval cards with confidence ratings.
- `ReflectionPrompt`: captures metacognitive reflection.

## Media and evidence

- `Cite`: inline source reference from the course source registry.
- `SourcePanel`: sources used by the lesson.
- `FurtherReading`: annotated next resources.
- `VideoSegment`: purpose-framed video segment with before/after prompts.
- `GuidedResource`: frames an external animation, step-through, demo, or article as an active task.
- `MediaFigure`: image or media with alt text, caption, and registered source.

## Visual and interactive

- `ChartExplorer`: responsive Recharts wrapper with a learning prompt.
- `ThreeLessonScene`: reusable Three.js canvas shell.
- `VectorProjectionDemo`: example 3D interaction and evidence pattern.
- `ParameterExplorer`: sliders driving a custom explanatory render.

## Runtime

The app shell automatically provides:

- a collapsible section-progress rail that tracks the current section
- adjacent lesson navigation when those lesson files exist
- light/dark/system modes
- course and learner themes
- a collapsible desktop notes dock and mobile notes sheet
- a top reading-progress strip
- Markdown and JSON return export
- local evidence persistence
- source registry context

Do not recreate runtime controls inside lessons.

## Vocabulary and tooltips

Use `KeyTerm` when important vocabulary is first introduced. Declare important terms in lesson metadata and define them in one or two learner-facing sentences. Use a tooltip for a short, optional clarification that is helpful at the exact
point of reading. Use a popover, callout, or section for anything requiring more
than roughly two sentences, interaction, media, or citations. The visible term
must remain understandable and keyboard-focusable without hover.

## shadcn/ui compatibility

The runtime owns its component source under `src/components/ui/` and uses Radix
primitives plus shadcn/ui conventions. `components.json` is configured so an
agent can add an uncommon component when network access is available:

```bash
npx shadcn@latest add <component>
```

Review generated files before accepting overwrites. Preserve semantic theme
tokens, existing accessibility behavior, and the Teach Loop evidence contract.
A new visual primitive does not automatically become a learning component.
Wrap it in `src/components/learning/` only when it supports a named learning
verb and returns useful evidence.
