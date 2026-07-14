import type { CourseConfig } from "./types";

export const courseConfig = {
  id: "__COURSE_SLUG__",
  title: "__COURSE_TITLE__",
  description: "A local-first, adaptive learning workspace.",
  tutorName: "Tutor",
  learnerName: "Learner",
  defaultTheme: "default",
  defaultMode: "system",
  repositoryCreatedAt: "__CREATED_DATE__",
} satisfies CourseConfig;
