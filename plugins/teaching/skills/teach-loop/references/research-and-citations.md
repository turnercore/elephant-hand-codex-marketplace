# Research and citations

## Research gate

Do not author a factual lesson until the source packet is sufficient for the
lesson's narrow target.

Check:

- central claims have support
- primary, official, or canonical sources are represented when available
- the information is current enough for the topic
- likely learner questions can be answered or marked unresolved
- disagreements and caveats are visible
- useful examples, diagrams, datasets, images, animations, or video demonstrations are available
- sources can be cited near the claims they support

## Source hierarchy

Prefer, depending on domain:

1. specifications, official documentation, statutes, primary documents,
   original works, source code, datasets, or research papers
2. authoritative institutional references or recognized textbooks
3. high-quality syntheses and practitioner explanations
4. examples, tutorials, community discussions, and videos as supplements

Do not pad the packet with many shallow sources that repeat one another.

## Resource record

Every source should state:

- stable ID
- title and creator or institution
- type and primary/secondary status
- URL
- access or publication date when useful
- relevant sections or timestamps
- claims or skills supported
- quality notes and limitations
- lesson uses

Keep human-readable records in `RESOURCES.md` and runtime records in
`src/course/sources.ts`.

## Inline citations

Use `<Cite source="source-id" />` directly after the supported claim. Use a
`<SourcePanel />` near the end of the lesson. Do not attach one citation to a
paragraph containing several unrelated claims.

Citations should distinguish source roles such as:

- primary source
- official documentation
- research paper
- accessible explanation
- example implementation
- video demonstration
- optional deep dive

## Further reading

A further-reading item needs a reason:

- what it adds
- when to use it
- estimated effort or relevant segment
- whether it is foundational, practical, or optional

## Re-research

Reopen source material when:

- the learner asks a precise follow-up
- a lesson relies on a previous claim
- new evidence suggests the explanation may be incomplete
- current information may have changed
- sources disagree
- a generated visualization or simulation needs factual validation

Never cite a source you did not inspect.

## Procedural realism gate

For a physical or visually intricate procedure, search for and inspect a real demonstration before creating the lesson. Prefer:

1. an official or expert demonstration
2. a controllable step-by-step animation or image sequence
3. a short, clearly framed video segment
4. generated diagrams only for a simpler supporting relationship

Use `VideoSegment`, `GuidedResource`, or a sourced `MediaFigure`. Do not rely on an agent-drawn sequence as the only authority for hand positions, rope paths, tool orientation, body movement, or safety-critical order.

When image search is available, use it to discover candidate diagrams and inspect their source pages. Do not copy an asset merely because it appeared in image results. Verify provenance, license or permission, and instructional accuracy.
