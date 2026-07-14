#!/usr/bin/env node
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const failures = [];
const warnings = [];
const required = [
  ".teach-loop.json",
  "MISSION.md",
  "LEARNER.md",
  "LEARNING_MAP.md",
  "RESOURCES.md",
  "TUTOR_NOTES.md",
  "QUESTIONS.md",
  "state/learner-state.json",
  "src/course/sources.ts",
  "src/course/course.config.ts",
];

for (const file of required) {
  if (!existsSync(file)) failures.push(`Missing required file: ${file}`);
}

try {
  const state = JSON.parse(await readFile("state/learner-state.json", "utf8"));
  for (const key of ["schemaVersion", "learnerDeclared", "observations", "inferences", "concepts"]) {
    if (!(key in state)) failures.push(`state/learner-state.json is missing ${key}.`);
  }
} catch (error) {
  failures.push(`state/learner-state.json is invalid: ${error.message}`);
}

const sourceText = existsSync("src/course/sources.ts")
  ? await readFile("src/course/sources.ts", "utf8")
  : "";
const sourceIds = new Set(
  [...sourceText.matchAll(/\bid:\s*["']([a-z0-9][a-z0-9-]*)["']/g)].map((match) => match[1]),
);

function stringArrayFromProperty(text, property) {
  const block = new RegExp(`\\b${property}:\\s*\\[([\\s\\S]*?)\\]`).exec(text)?.[1] ?? "";
  return [...block.matchAll(/["']([^"']+)["']/g)].map((match) => match[1]);
}

const lessonFiles = (await readdir("lessons"))
  .filter((file) => /^\d{4}-[a-z0-9-]+\.mdx$/.test(file))
  .sort();
if (lessonFiles.length === 0) failures.push("No numbered MDX lessons found in lessons/.");

const lessonIds = new Set();
for (const file of lessonFiles) {
  const text = await readFile(path.join("lessons", file), "utf8");
  const expectedId = file.replace(/\.mdx$/, "");
  const metadataId = /\bid:\s*["']([^"']+)["']/.exec(text)?.[1];
  if (!metadataId) failures.push(`${file}: lesson metadata has no id.`);
  if (metadataId && metadataId !== expectedId) {
    failures.push(`${file}: metadata id ${metadataId} must match filename ${expectedId}.`);
  }
  if (metadataId && lessonIds.has(metadataId)) failures.push(`${file}: duplicate lesson id ${metadataId}.`);
  if (metadataId) lessonIds.add(metadataId);

  if (!/export\s+const\s+lesson\s*=\s*defineLesson\(/.test(text)) {
    failures.push(`${file}: export lesson metadata with defineLesson().`);
  }

  const componentIds = [...text.matchAll(/\bid=["']([a-z0-9][a-z0-9-]*)["']/g)].map(
    (match) => match[1],
  );
  const duplicates = componentIds.filter((id, index) => componentIds.indexOf(id) !== index);
  for (const duplicate of new Set(duplicates)) failures.push(`${file}: duplicate component id ${duplicate}.`);

  const declaredSourceIds = stringArrayFromProperty(text, "sourceIds");
  const citedIds = [...text.matchAll(/<Cite\s+source=["']([^"']+)["']/g)].map((match) => match[1]);
  const componentSourceIds = [...text.matchAll(/\bsourceId=["']([^"']+)["']/g)].map((match) => match[1]);
  for (const id of [...new Set([...declaredSourceIds, ...citedIds, ...componentSourceIds])]) {
    if (!sourceIds.has(id)) failures.push(`${file}: references unknown source ${id}.`);
  }

  const researchExemption = /\bresearchExemption:\s*["']([^"']+)["']/.exec(text)?.[1];
  if (declaredSourceIds.length === 0 && !researchExemption) {
    failures.push(`${file}: add inspected sources or a specific researchExemption.`);
  }
  if (declaredSourceIds.length > 0) {
    if (citedIds.length === 0) failures.push(`${file}: sourced lessons need at least one inline <Cite>.`);
    if (!/<SourcePanel\b/.test(text)) failures.push(`${file}: sourced lessons need a visible <SourcePanel>.`);
  }

  const lessonType = /\blessonType:\s*["']([^"']+)["']/.exec(text)?.[1];
  if (lessonType === "procedural") {
    const hasRealWorldDemonstration = /<(?:VideoSegment|GuidedResource)\b/.test(text)
      || /<MediaFigure\b[\s\S]{0,500}\bsourceId=/.test(text);
    if (!hasRealWorldDemonstration) {
      failures.push(`${file}: procedural lessons require a sourced VideoSegment, GuidedResource, or MediaFigure.`);
    }
    if (/<(?:ThreeLessonScene|VectorProjectionDemo)\b/.test(text) && !hasRealWorldDemonstration) {
      failures.push(`${file}: generated diagrams cannot be the sole demonstration for a physical procedure.`);
    }
  }

  const keyTerms = stringArrayFromProperty(text, "keyTerms");
  for (const term of keyTerms) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!new RegExp(`<KeyTerm\\s+term=["']${escaped}["']`).test(text)) {
      failures.push(`${file}: key term "${term}" is declared but not introduced with <KeyTerm>.`);
    }
  }

  const paletteClasses = /\b(?:bg|text|border|ring)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g;
  const paletteMatches = text.match(paletteClasses) ?? [];
  if (paletteMatches.length > 0) {
    failures.push(`${file}: use semantic theme tokens instead of ${[...new Set(paletteMatches)].join(", ")}.`);
  }

  if (!/<(?:PredictionPrompt|MultipleChoice|Checkpoint|FlashcardDeck|ReflectionPrompt|ConfidenceCheck|ChartExplorer|ThreeLessonScene|VectorProjectionDemo|GuidedResource|VideoSegment)\b/.test(text)) {
    warnings.push(`${file}: no evidence-producing learning component detected.`);
  }
}

const mission = existsSync("MISSION.md") ? await readFile("MISSION.md", "utf8") : "";
if (mission.includes("_To be completed with the learner")) {
  warnings.push("MISSION.md still contains the initialization prompt.");
}
if (sourceIds.size === 0) warnings.push("src/course/sources.ts has no course sources yet.");

if (warnings.length > 0) {
  console.warn("Validation warnings:");
  warnings.forEach((warning) => console.warn(`  △ ${warning}`));
}

if (failures.length > 0) {
  console.error("Validation failed:");
  failures.forEach((failure) => console.error(`  ✗ ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Validation passed for ${lessonFiles.length} lesson${lessonFiles.length === 1 ? "" : "s"}.`);
}
