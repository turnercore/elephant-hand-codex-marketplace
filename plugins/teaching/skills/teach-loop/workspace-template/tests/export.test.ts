import { describe, expect, it } from "vitest";
import type { LessonDefinition } from "@/course/types";
import { buildReturnPacket, returnPacketToMarkdown } from "@/evidence/export";
import type { EvidenceSnapshot, LearnerReflection } from "@/evidence/types";

const lesson: LessonDefinition = {
  id: "0001-test-lesson",
  title: "Test lesson",
  summary: "A focused test.",
  estimatedMinutes: 8,
  milestoneIds: ["M1"],
  outcomes: ["Explain the test."],
  targetGap: "Unknown test model",
  successEvidence: ["Independent explanation"],
  sourceIds: [],
};

const snapshot: EvidenceSnapshot = {
  schemaVersion: "1.0.0",
  lessonId: lesson.id,
  responses: {
    prediction: {
      componentId: "prediction",
      kind: "prediction",
      value: "My revised answer",
      originalValue: "My first answer",
      attempts: 2,
      hintsUsed: ["hint-1"],
      confidence: 65,
      completed: true,
      updatedAt: "2026-07-13T10:00:00.000Z",
    },
  },
  notes: [
    {
      id: "note-1",
      anchorId: "section-1",
      anchorLabel: "Section one",
      text: "This diagram helped.",
      createdAt: "2026-07-13T10:00:00.000Z",
      updatedAt: "2026-07-13T10:01:00.000Z",
    },
  ],
  events: [],
  completedIds: ["prediction"],
  updatedAt: "2026-07-13T10:01:00.000Z",
};

const reflection: LearnerReflection = {
  understood: "I understand the core relationship.",
  unresolved: "I still need a changed-context example.",
  questions: "When does this break?",
  difficulty: "about_right",
  helpful: "The diagram and prediction.",
  nextPreference: "One transfer task.",
};

describe("lesson return export", () => {
  it("preserves evidence, notes, reflection, and theme in Markdown and JSON", () => {
    const packet = buildReturnPacket(lesson, snapshot, reflection, {
      mode: "dark",
      preset: "ocean",
      customEnabled: false,
      custom: { name: "My theme", light: {}, dark: {} },
      learnerSelected: true,
      resolvedMode: "dark",
    });
    const markdown = returnPacketToMarkdown(packet);

    expect(packet.responses.prediction.originalValue).toBe("My first answer");
    expect(markdown).toContain("This diagram helped.");
    expect(markdown).toContain("When does this break?");
    expect(markdown).toContain("Preset: ocean");
    expect(markdown).toContain('"schemaVersion": "1.0.0"');
  });
});
