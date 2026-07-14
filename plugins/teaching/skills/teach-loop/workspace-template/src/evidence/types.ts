import type { LessonDefinition } from "@/course/types";
import type { ThemeState } from "@/themes/types";

export type EvidenceEventType =
  | "response"
  | "prediction"
  | "confidence"
  | "hint"
  | "completion"
  | "reflection"
  | "note"
  | "interaction"
  | "video"
  | "theme";

export interface EvidenceEvent {
  id: string;
  lessonId: string;
  componentId: string;
  type: EvidenceEventType;
  timestamp: string;
  payload: Record<string, unknown>;
}

export interface EvidenceResponse {
  componentId: string;
  kind: string;
  value: unknown;
  originalValue?: unknown;
  revisedValue?: unknown;
  correct?: boolean;
  attempts: number;
  hintsUsed: string[];
  confidence?: number;
  selfAssessment?: string;
  completed: boolean;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface LessonNote {
  id: string;
  anchorId: string;
  anchorLabel?: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceSnapshot {
  schemaVersion: "1.0.0";
  lessonId: string;
  responses: Record<string, EvidenceResponse>;
  notes: LessonNote[];
  events: EvidenceEvent[];
  completedIds: string[];
  updatedAt: string;
}

export interface LearnerReflection {
  understood: string;
  unresolved: string;
  questions: string;
  difficulty: "too_easy" | "about_right" | "too_hard" | "not_sure";
  helpful: string;
  nextPreference: string;
}

export interface LessonReturnPacket {
  schemaVersion: "1.0.0";
  course: { id: string; title: string };
  lesson: Pick<
    LessonDefinition,
    "id" | "title" | "summary" | "milestoneIds" | "outcomes" | "targetGap"
  >;
  generatedAt: string;
  responses: Record<string, EvidenceResponse>;
  notes: LessonNote[];
  events: EvidenceEvent[];
  completedIds: string[];
  reflection: LearnerReflection;
  theme: ThemeState & { resolvedMode: "light" | "dark" };
}
