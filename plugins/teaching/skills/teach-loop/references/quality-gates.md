# Quality gates

## Before a lesson

- mission connection is explicit
- target gap is based on evidence or a declared question
- source packet is sufficient and has been re-opened for this lesson
- procedural lessons include an inspected real-world demonstration
- primary or official sources are used when available
- claims and media provenance are inspectable
- one tangible win is defined

## During authoring

- interaction serves a named learning verb
- stable IDs are unique
- hints increase in specificity
- citations sit near supported claims
- declared vocabulary is introduced with `KeyTerm`; optional tooltips remain concise
- video is segmented and framed
- visuals have an accessible summary
- Three.js has a reset and fallback
- theme tokens are semantic
- no runtime infrastructure is duplicated inside the lesson

## Before delivery

```bash
npm run validate
npm test
npm run build
```

Also inspect in a browser:

- desktop and mobile
- light and dark
- notes creation and persistence
- at least one interaction and hint path
- source links
- export preview, Markdown, and JSON; action buttons remain visible at short viewport heights
- section rail highlights the section currently being read
- desktop notes dock can expand and collapse without becoming unreachable
- keyboard focus and reduced-motion behavior
- no console errors

## After the return

- preserve raw return
- distinguish independent and assisted performance
- answer open questions
- update learner state with evidence
- revise milestones only when warranted
- choose the next best action rather than the next chapter
