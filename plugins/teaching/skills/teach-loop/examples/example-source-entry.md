# Example source record

Human-readable entry for `RESOURCES.md`:

```yaml
id: engine-vector-math
name: Vector math documentation
type: official-documentation
role: official
creator_or_organization: Example Engine Team
url: https://example.com/vector-math
accessed_at: 2026-07-13
relevant_sections:
  - Dot product
  - Normalized vectors
supports:
  - The algebraic definition used in the lesson
  - The engine's coordinate and normalization conventions
quality_notes: Canonical reference for behavior in the learner's chosen engine.
limitations:
  - Assumes prior familiarity with vectors
lesson_uses:
  - validate equations
  - cite engine-specific conventions
```

Mirror it as a typed `CourseSource` in `src/course/sources.ts` so `<Cite />`,
`<SourcePanel />`, and `<FurtherReading />` can render it.
