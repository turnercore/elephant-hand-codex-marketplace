import {
  Callout,
  ChartExplorer,
  Checkpoint,
  ConceptTooltip,
  ConfidenceCheck,
  ContrastCases,
  FlashcardDeck,
  LessonSection,
  MultipleChoice,
  ParameterExplorer,
  PredictionPrompt,
  ReflectionPrompt,
  SortAndClassify,
  VectorProjectionDemo,
  VideoSegment,
  WorkedExample,
} from "@/lesson-kit";

export default function ComponentGallery() {
  return (
    <>
      <Callout title="This is a workshop, not a lesson" kind="insight">
        Open this page while authoring. Every interaction below writes to the same evidence system used by real lessons.
      </Callout>

      <LessonSection id="gallery-language" title="Explanations without clutter" eyebrow="Reading">
        <p>
          Use a <ConceptTooltip term="concept tooltip">a short, keyboard-accessible definition at the point of need</ConceptTooltip> for compact context. Anything longer deserves a callout, popover, or full section.
        </p>
      </LessonSection>

      <LessonSection id="gallery-prediction" title="Prediction and confidence" eyebrow="Elicit the model">
        <PredictionPrompt
          id="gallery-prediction-prompt"
          prompt="What do you predict will happen when the angle between two vectors passes 90 degrees?"
          reveal="The sign changes because cosine changes sign beyond 90 degrees."
        />
        <ConfidenceCheck id="gallery-confidence" label="How confident is that prediction?" />
      </LessonSection>

      <LessonSection id="gallery-guidance" title="Guidance that fades" eyebrow="Practice">
        <WorkedExample
          id="gallery-worked-example"
          title="A staged worked example"
          steps={[
            { title: "Name the target", content: <p>Identify exactly what the learner must predict or produce.</p> },
            { title: "Expose the relationship", content: <p>Show only the relationship needed for the next move.</p> },
            { title: "Remove the scaffold", content: <p>Ask for a fresh case without the worked steps.</p> },
          ]}
        />
        <Checkpoint
          id="gallery-checkpoint"
          prompt="Rewrite the worked-example rhythm for a skill you care about."
          hints={[
            "Name a visible performance, not a broad topic.",
            "Decide what can be modeled once, then removed.",
            "End with a changed context rather than an identical repetition.",
          ]}
        />
      </LessonSection>

      <LessonSection id="gallery-quiz" title="Quizzes and classification" eyebrow="Retrieval">
        <MultipleChoice
          id="gallery-multiple-choice"
          prompt="Which response is strongest evidence of transfer?"
          correctId="new-context"
          options={[
            { id: "recognize", label: "Recognizing the definition in a list", feedback: "Recognition can be useful, but it is weak evidence of transfer." },
            { id: "repeat", label: "Repeating the demonstrated example", feedback: "This may show procedural imitation rather than flexible understanding." },
            { id: "new-context", label: "Applying the idea in a changed context", feedback: "A changed context tests whether the idea travels." },
          ]}
        />
        <SortAndClassify
          id="gallery-classification"
          prompt="Classify each activity by its dominant learning verb."
          categories={[
            { id: "retrieve", label: "Retrieve" },
            { id: "compare", label: "Compare" },
            { id: "manipulate", label: "Manipulate" },
          ]}
          items={[
            { id: "flashcard", label: "Answer a flashcard before reveal", categoryId: "retrieve" },
            { id: "contrast", label: "Inspect two confusable cases", categoryId: "compare" },
            { id: "simulation", label: "Change a parameter and observe the system", categoryId: "manipulate" },
          ]}
        />
        <FlashcardDeck
          id="gallery-flashcards"
          cards={[
            { id: "prediction", front: "Why capture a prediction before reveal?", back: "It preserves the learner's initial model instead of letting hindsight rewrite it." },
            { id: "hints", front: "What should a hint ladder do?", back: "Increase specificity gradually, from orienting attention to direct explanation." },
            { id: "transfer", front: "What distinguishes transfer from repetition?", back: "The learner applies the idea in a meaningfully changed context." },
          ]}
        />
      </LessonSection>

      <LessonSection id="gallery-visuals" title="Charts and parameter exploration" eyebrow="Visual models">
        <ChartExplorer
          id="gallery-chart"
          title="Spacing changes what survives"
          prompt="Inspect the difference between immediate fluency and later retention."
          type="line"
          xKey="day"
          xLabel="Day"
          yLabel="Recall %"
          data={[
            { day: 0, massed: 92, spaced: 78 },
            { day: 2, massed: 63, spaced: 74 },
            { day: 7, massed: 38, spaced: 68 },
            { day: 14, massed: 24, spaced: 61 },
          ]}
          series={[
            { dataKey: "massed", label: "Massed practice" },
            { dataKey: "spaced", label: "Spaced practice" },
          ]}
          accessibleSummary="An illustrative line chart. Massed practice begins higher but drops faster; spaced practice begins lower and remains higher over time. These values are synthetic component-gallery data, not research measurements."
        />
        <ParameterExplorer
          id="gallery-parameter-explorer"
          title="A declarative parameter explorer"
          prompt="Change difficulty and support to see a simple conceptual balance."
          parameters={[
            { id: "difficulty", label: "Difficulty", min: 0, max: 100, step: 5, initial: 58, unit: "%" },
            { id: "support", label: "Support", min: 0, max: 100, step: 5, initial: 42, unit: "%" },
          ]}
        >
          {(values) => {
            const productive = Math.max(0, 100 - Math.abs((values.difficulty ?? 0) - ((values.support ?? 0) + 20)));
            return (
              <div className="flex h-full min-h-44 flex-col items-center justify-center gap-3 text-center">
                <p className="text-sm text-muted-foreground">Illustrative productive-challenge balance</p>
                <p className="text-5xl font-semibold tabular-nums">{Math.round(productive)}</p>
                <div className="h-3 w-full max-w-sm overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-primary transition-[width]" style={{ width: `${productive}%` }} />
                </div>
              </div>
            );
          }}
        </ParameterExplorer>
      </LessonSection>

      <LessonSection id="gallery-three" title="Three.js when depth carries meaning" eyebrow="Spatial interaction">
        <VectorProjectionDemo id="gallery-vector-projection" />
      </LessonSection>

      <LessonSection id="gallery-comparison" title="Contrast cases" eyebrow="Misconception repair">
        <ContrastCases
          id="gallery-contrast"
          prompt="Switch between the cases and name the boundary."
          cases={[
            { id: "fluency", title: "Fluency", content: <p>The answer feels available immediately because it was just seen or practiced.</p>, diagnosticQuestion: "Would it still be available after time and interference?" },
            { id: "storage", title: "Storage", content: <p>The knowledge remains retrievable after delay, variation, and competing material.</p>, diagnosticQuestion: "Can the learner reconstruct it without the original cues?" },
          ]}
        />
      </LessonSection>

      <LessonSection id="gallery-video" title="Purpose-framed external media" eyebrow="Video">
        <VideoSegment
          id="gallery-video-segment"
          title="Video segment pattern"
          durationLabel="3–5 minutes"
          purpose="Demonstrates the framing contract without loading a real third-party video in the starter."
          before={<p>Make a prediction or name what you will watch for.</p>}
          after={<p>Explain the specific observation that changed your model.</p>}
          alternative={<p>Provide a concise text explanation, diagram, transcript excerpt within copyright limits, or an equivalent interactive.</p>}
        />
      </LessonSection>

      <LessonSection id="gallery-reflection" title="Reflection and tutor return" eyebrow="Close the loop">
        <ReflectionPrompt id="gallery-reflection-prompt" prompt="Which component would be most useful in the next real lesson, and why?" />
      </LessonSection>
    </>
  );
}
