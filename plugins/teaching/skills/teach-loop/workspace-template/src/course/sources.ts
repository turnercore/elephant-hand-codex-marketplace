import type { CourseSource } from "./types";

/**
 * Mirror the curated human-readable source packet in RESOURCES.md here so
 * lessons can cite sources by stable ID. Never add a source the tutor has not
 * inspected.
 */
export const courseSources: CourseSource[] = [];

export function getCourseSource(id: string): CourseSource | undefined {
  return courseSources.find((source) => source.id === id);
}
