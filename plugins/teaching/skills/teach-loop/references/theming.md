# Theming

## Layers

Theme resolution follows:

1. learner custom theme, when enabled
2. learner-selected built-in theme
3. lesson theme suggestion
4. course default
5. Teach Loop default

Mode is independent: system, light, or dark.

## Semantic tokens

Use tokens such as:

- `background`, `foreground`
- `card`, `card-foreground`
- `muted`, `muted-foreground`
- `primary`, `primary-foreground`
- `secondary`, `secondary-foreground`
- `accent`, `accent-foreground`
- `destructive`, `border`, `input`, `ring`
- chart tokens

Lesson components must not hard-code palette classes such as `bg-blue-500`.
Use semantic utilities such as `bg-primary`, `text-muted-foreground`, and
`border-border`.

## Custom themes

The learner or tutor can use Theme Studio to adjust palette, radius, typeface,
reading width, and scale. The runtime stores changes locally and includes them
in the return packet. Promote a successful custom theme into
`src/themes/course-themes.ts` when it should become a durable course option.

## Per-lesson themes

A lesson may suggest a preset for a genuine reason, such as high contrast or an
editorial historical palette. It should not force a mode that overrides an
accessibility need. Keep information hierarchy and component behavior stable
across themes.
