# Lesson authoring

## One tangible win

A lesson should change one meaningful capability. Examples:

- predict the sign of a dot product from vector orientation
- distinguish two easily confused historical causes
- debug one class of asynchronous bug
- hear and reproduce one rhythmic pattern
- identify the controlling variable in an experiment

Avoid “understand chapter three.”

## Lightweight lesson intent

Before coding, identify:

```yaml
target_gap:
mission_connection:
milestone_ids: []
tangible_win:
success_evidence: []
likely_misconceptions: []
methods: []
source_ids: []
lesson_type: conceptual | procedural | practice | project | review
key_terms: []
```

This may live in the lesson metadata. It is planning for the tutor, not a rigid
course plan for the learner.

## Suggested rhythm

Use only the stages that help:

1. orient to the goal
2. elicit a prediction or prior model
3. provide the smallest useful explanation
4. let the learner manipulate, compare, or practice
5. give immediate feedback
6. reduce assistance
7. test transfer or reconstruction
8. invite reflection and questions
9. return evidence to the tutor

## Cognitive load

- Keep prose sections short.
- Put explanations beside the relevant visual.
- Hide optional depth behind disclosure, tooltips, or linked references.
- Avoid making the learner remember instructions while interacting elsewhere.
- Introduce terminology only when it compresses an idea the learner can use. Mark important first-use vocabulary with `KeyTerm`.
- Prefer one strong representation to several ornamental ones.

## Adaptivity

State why this lesson exists in relation to prior evidence. A targeted lesson
should reference the exact confusion, question, or observed help pattern that
motivated it, without shaming the learner.

## Stable IDs

Every evidence-producing component needs a lesson-unique, durable ID. Never use
array indexes or random values. IDs survive copy edits and make returns
comparable over time.

## Custom components

Create a custom component when standard components cannot express the learning
interaction. Place it in `src/components/custom/`, type its props, use semantic
theme tokens, connect it to `useEvidence()`, and provide an accessible fallback.
Do not duplicate notes, export, citation, or theme infrastructure.

## Procedural lessons

Set `lessonType: "procedural"` and include at least one inspected real-world demonstration through `VideoSegment`, `GuidedResource`, or a sourced `MediaFigure`. The validator enforces this gate. Explain what the learner should notice before the demonstration and require performance, reconstruction, or diagnosis afterward.
