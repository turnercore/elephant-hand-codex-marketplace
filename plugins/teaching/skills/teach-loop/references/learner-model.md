# Learner model

## Evidence classes

Keep three categories separate:

### Learner-declared

Claims supplied by the learner, such as prior experience, goals, preferences,
and constraints. Treat prior-knowledge claims as useful but unverified until
observed in use.

### Observed

Evidence from answers, explanations, creations, simulations, hint use,
confidence, transfer tasks, and conversation.

### Inferred

Tentative explanations for observed behavior. Every inference needs:

- a specific claim
- confidence from 0 to 1
- supporting evidence IDs
- date
- contradiction or supersession support

## Help levels

Use these consistently:

- `independent`
- `light_prompt`
- `heavy_scaffold`
- `modeled`
- `copied_or_selected`

Record the strongest help used before success. Do not label heavily scaffolded
success as independent mastery.

## Knowledge states

Suggested concept states:

- `unknown`
- `emerging`
- `developing`
- `reliable`
- `transferable`
- `uncertain`
- `misconception_suspected`
- `needs_revisit`

## Preference handling

Store direct preferences, but test them empirically. “More visuals” may be
helpful for spatial concepts and unnecessary for a naming convention. Record
what actually improved performance, comprehension, motivation, or retention.

Do not assign fixed visual, auditory, or kinesthetic learner identities.

## Updating state

After a lesson return:

1. Preserve raw evidence.
2. Add observations with source pointers.
3. Revise inferences conservatively.
4. Update concept states only when evidence warrants it.
5. Record implications for the next teaching action.
6. Keep uncertainty visible.
