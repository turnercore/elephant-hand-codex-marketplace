#!/usr/bin/env node
import { access, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 56) || "focused-lesson";
}

const title = process.argv.slice(2).join(" ").trim();
if (!title) {
  console.error('Usage: npm run new:lesson -- "Focused lesson title"');
  process.exit(1);
}

const lessonsDirectory = path.resolve("lessons");
await access(lessonsDirectory);
const files = await readdir(lessonsDirectory);
const highest = files.reduce((max, file) => {
  const match = /^(\d{4})-/.exec(file);
  return match ? Math.max(max, Number(match[1])) : max;
}, -1);
const number = String(Math.max(1, highest + 1)).padStart(4, "0");
const id = `${number}-${slugify(title)}`;
const target = path.join(lessonsDirectory, `${id}.mdx`);

const content = `import {
  Callout,
  Cite,
  Checkpoint,
  ConfidenceCheck,
  KeyTerm,
  LessonSection,
  PredictionPrompt,
  ReflectionPrompt,
  SourcePanel,
} from "@/lesson-kit";
import { defineLesson } from "@/course/define-lesson";

export const lesson = defineLesson({
  id: "${id}",
  title: ${JSON.stringify(title)},
  summary: "Replace this with the tightly scoped win for this lesson.",
  estimatedMinutes: 12,
  milestoneIds: [],
  outcomes: ["Replace with one observable outcome."],
  targetGap: "Describe the evidence-based gap this lesson addresses.",
  successEvidence: ["Describe what the learner will do to show progress."],
  sourceIds: [],
  lessonType: "conceptual",
  keyTerms: [],
  theme: { preset: "course" },
});

<Callout title="Why this lesson now">
  Connect the lesson to the learner's mission and the specific evidence that
  motivated it.
</Callout>

<LessonSection id="orient" title="Make a prediction">
  Introduce the smallest useful context.

  <PredictionPrompt
    id="initial-prediction"
    prompt="Ask a prediction that reveals the learner's current model."
    placeholder="Write your prediction and reasoning…"
  />
</LessonSection>

<LessonSection id="explain" title="Build the model">
  Add a concise explanation grounded in inspected sources. Place <Cite source="source-id" />
  directly after each supported claim. Introduce important vocabulary with
  <KeyTerm term="example term">A concise definition.</KeyTerm>.
</LessonSection>

<LessonSection id="practice" title="Try it with less support">
  <Checkpoint
    id="focused-checkpoint"
    prompt="Give the learner a focused application or reconstruction task."
    hints={[
      "First hint: orient attention without giving away the step.",
      "Second hint: recall the relevant relationship.",
      "Third hint: model part of the process.",
    ]}
  />

  <ConfidenceCheck id="post-practice-confidence" label="How confident are you now?" />
</LessonSection>

<LessonSection id="reflect" title="Reflect and return">
  <ReflectionPrompt
    id="lesson-reflection"
    prompt="What changed in your understanding, and what still feels unresolved?"
  />
</LessonSection>

<SourcePanel sourceIds={lesson.sourceIds} />
`;

await writeFile(target, content, { flag: "wx" });
console.log(`Created ${path.relative(process.cwd(), target)}`);
console.log("Next: research, update the lesson metadata, author the interaction, then run npm run validate.");
