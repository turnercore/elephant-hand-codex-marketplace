import type { ComponentType } from "react";

export type ThemeMode = "system" | "light" | "dark";

export interface LessonThemeSuggestion {
  preset?: string;
  mode?: ThemeMode;
  reason?: string;
}

export type LessonType =
  | "orientation"
  | "conceptual"
  | "procedural"
  | "practice"
  | "project"
  | "review";

export interface LessonDefinition {
  id: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  milestoneIds: string[];
  outcomes: string[];
  targetGap: string;
  successEvidence: string[];
  sourceIds: string[];
  lessonType?: LessonType;
  /** Explain why external research is unnecessary. Intended for orientation or learner-reflection lessons. */
  researchExemption?: string;
  /** Vocabulary that should be introduced with <KeyTerm> at first meaningful use. */
  keyTerms?: string[];
  theme?: LessonThemeSuggestion;
}

export interface LessonModule {
  Component: ComponentType;
  lesson: LessonDefinition;
}

export type SourceRole =
  | "primary"
  | "official"
  | "research"
  | "textbook"
  | "explanation"
  | "example"
  | "video"
  | "community"
  | "other";

export interface CourseSource {
  id: string;
  title: string;
  creator?: string;
  organization?: string;
  url: string;
  type: string;
  role: SourceRole;
  publishedAt?: string;
  accessedAt?: string;
  relevantSections?: string[];
  supports: string[];
  qualityNotes: string;
  limitations?: string[];
  durationMinutes?: number;
  segment?: { start?: string; end?: string };
}

export interface CourseConfig {
  id: string;
  title: string;
  description: string;
  tutorName: string;
  learnerName: string;
  defaultTheme: string;
  defaultMode: ThemeMode;
  repositoryCreatedAt: string;
}
