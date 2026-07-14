import { courseConfig } from "@/course/course.config";
import type { LessonDefinition } from "@/course/types";
import type { ThemeState } from "@/themes/types";
import type {
  EvidenceSnapshot,
  LearnerReflection,
  LessonReturnPacket,
} from "./types";

export function buildReturnPacket(
  lesson: LessonDefinition,
  snapshot: EvidenceSnapshot,
  reflection: LearnerReflection,
  theme: ThemeState & { resolvedMode: "light" | "dark" },
): LessonReturnPacket {
  return {
    schemaVersion: "1.0.0",
    course: { id: courseConfig.id, title: courseConfig.title },
    lesson: {
      id: lesson.id,
      title: lesson.title,
      summary: lesson.summary,
      milestoneIds: lesson.milestoneIds,
      outcomes: lesson.outcomes,
      targetGap: lesson.targetGap,
    },
    generatedAt: new Date().toISOString(),
    responses: snapshot.responses,
    notes: snapshot.notes.filter((note) => note.text.trim().length > 0),
    events: snapshot.events,
    completedIds: snapshot.completedIds,
    reflection,
    theme,
  };
}

function formatValue(value: unknown): string {
  if (typeof value === "string") return value || "_(blank)_";
  return `\n\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
}

export function returnPacketToMarkdown(packet: LessonReturnPacket): string {
  const responses = Object.values(packet.responses);
  const notes = packet.notes;
  const lines = [
    `# Lesson Return: ${packet.lesson.title}`,
    "",
    `Course: ${packet.course.title}`,
    `Lesson ID: \`${packet.lesson.id}\``,
    `Generated: ${packet.generatedAt}`,
    "",
    "## Tutor instructions",
    "",
    "Use this return with the local Teach Loop workspace. Discuss uncertainty and questions with me before deciding what comes next. Prefer Socratic probing when I can plausibly generate the next step, explain directly when that is more useful, verify my understanding afterward, then update the learner model and living learning map from evidence. Do not mechanically advance to the next topic.",
    "",
    "## Completion",
    "",
    packet.completedIds.length > 0
      ? packet.completedIds.map((id) => `- ${id}`).join("\n")
      : "_No components were marked complete._",
    "",
    "## Responses and evidence",
    "",
  ];

  if (responses.length === 0) {
    lines.push("_No responses were recorded._", "");
  } else {
    for (const response of responses) {
      lines.push(
        `### ${response.componentId}`,
        "",
        `- Kind: ${response.kind}`,
        `- Attempts: ${response.attempts}`,
        `- Hints used: ${response.hintsUsed.length > 0 ? response.hintsUsed.join(", ") : "none"}`,
        `- Confidence: ${response.confidence ?? "not recorded"}`,
        `- Correct: ${response.correct ?? "not automatically scored"}`,
        `- Completed: ${response.completed ? "yes" : "no"}`,
        "",
        "Response:",
        "",
        formatValue(response.value),
        "",
      );
    }
  }

  lines.push("## Notes", "");
  if (notes.length === 0) {
    lines.push("_No notes were recorded._", "");
  } else {
    for (const note of notes) {
      lines.push(`- **${note.anchorLabel ?? note.anchorId}:** ${note.text}`, "");
    }
  }

  lines.push(
    "## Learner reflection",
    "",
    `### What I understand now\n${packet.reflection.understood || "_(not supplied)_"}`,
    "",
    `### What remains unresolved\n${packet.reflection.unresolved || "_(not supplied)_"}`,
    "",
    `### Questions for the tutor\n${packet.reflection.questions || "_(none supplied)_"}`,
    "",
    `### Difficulty\n${packet.reflection.difficulty}`,
    "",
    `### What helped\n${packet.reflection.helpful || "_(not supplied)_"}`,
    "",
    `### What I want next\n${packet.reflection.nextPreference || "_(not supplied)_"}`,
    "",
    "## Theme and reading preferences",
    "",
    `- Mode: ${packet.theme.mode} (resolved ${packet.theme.resolvedMode})`,
    `- Preset: ${packet.theme.preset}`,
    `- Custom theme enabled: ${packet.theme.customEnabled ? "yes" : "no"}`,
  );

  if (packet.theme.customEnabled) {
    lines.push("", "```json", JSON.stringify(packet.theme.custom, null, 2), "```");
  }

  lines.push(
    "",
    "## Machine-readable return",
    "",
    "```json",
    JSON.stringify(packet, null, 2),
    "```",
  );

  return lines.join("\n");
}
