/// <reference types="vite/client" />

declare module "*.mdx" {
  import type { ComponentType } from "react";
  import type { LessonDefinition } from "@/course/types";

  export const lesson: LessonDefinition;
  const MDXComponent: ComponentType;
  export default MDXComponent;
}

declare module "virtual:teach-loop-lessons" {
  import type { ComponentType } from "react";
  import type { LessonDefinition } from "@/course/types";

  export const lessonModules: Array<{
    Component: ComponentType;
    lesson: LessonDefinition;
  }>;
}
