# Example lesson return

This is a shortened illustration. Actual returns also include machine-readable
JSON and detailed event data.

## Completion

- initial-prediction
- vector-explorer
- transfer-checkpoint

## Responses and evidence

### initial-prediction

- Attempts: 2
- Hints used: none
- Confidence: 65
- Original response: “The value measures distance between the arrow tips.”
- Revised response: “It combines direction alignment with both vector lengths.”

### transfer-checkpoint

- Attempts: 1
- Hints used: hint-1
- Confidence: 55
- Response: “Normalizing lets me interpret the result mainly as alignment.”

## Notes

- **Projection playground:** “I understand the sign change now. I still do not
  know when keeping magnitude is useful.”

## Learner reflection

- What I understand: The operation is not only an angle test unless the inputs
  have unit length.
- What remains unresolved: Practical cases where non-normalized inputs are the
  desired behavior.
- Difficulty: about right
- What helped: Predicting first, then moving through positive and negative cases.
- What I want next: A shader example with one intentionally non-normalized input.
