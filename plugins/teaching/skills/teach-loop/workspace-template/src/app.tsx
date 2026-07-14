import { lazy, Suspense, useMemo, useState } from "react";
import { lessonModules } from "virtual:teach-loop-lessons";
import type { LessonModule } from "@/course/types";
import { EvidenceProvider } from "@/evidence/evidence-context";
import { CourseShell } from "@/components/runtime/course-shell";
import { NotesPanelProvider } from "@/components/runtime/notes-panel-context";

const DevComponentGallery = import.meta.env.DEV
  ? lazy(() => import("@/dev/component-gallery"))
  : null;

const galleryModule: LessonModule = {
  lesson: {
    id: "component-gallery",
    title: "Lesson component gallery",
    summary: "A developer-only workshop for inspecting the lesson kit, evidence behavior, charts, media, and Three.js patterns.",
    estimatedMinutes: 20,
    milestoneIds: [],
    outcomes: ["Inspect reusable components before authoring a custom interaction."],
    targetGap: "Course authoring reference",
    successEvidence: ["Components render and return meaningful evidence."],
    sourceIds: [],
    theme: { preset: "default" },
  },
  Component: () =>
    DevComponentGallery ? (
      <Suspense fallback={<p className="text-muted-foreground">Loading component gallery…</p>}>
        <DevComponentGallery />
      </Suspense>
    ) : null,
};

function readInitialLesson(lessons: LessonModule[]): string {
  const query = new URLSearchParams(window.location.search);
  const requested = query.get("lesson");
  return lessons.some((item) => item.lesson.id === requested) ? requested! : lessons[0]?.lesson.id ?? "";
}

export function App() {
  const lessons = useMemo(
    () => [...lessonModules].sort((a, b) => a.lesson.id.localeCompare(b.lesson.id)),
    [],
  );
  const initialGallery = import.meta.env.DEV && new URLSearchParams(window.location.search).get("gallery") === "1";
  const [selectedId, setSelectedId] = useState(() => readInitialLesson(lessons));
  const [gallery, setGallery] = useState(initialGallery);
  const current = gallery ? galleryModule : lessons.find((item) => item.lesson.id === selectedId) ?? lessons[0];

  if (!current) {
    return <main className="p-8"><h1 className="text-2xl font-semibold">No lessons found</h1><p className="mt-2 text-muted-foreground">Create a numbered MDX file in lessons/.</p></main>;
  }

  const selectLesson = (id: string) => {
    setGallery(false);
    setSelectedId(id);
    const url = new URL(window.location.href);
    url.searchParams.delete("gallery");
    url.searchParams.set("lesson", id);
    history.replaceState(null, "", url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openGallery = () => {
    if (!import.meta.env.DEV) return;
    setGallery(true);
    const url = new URL(window.location.href);
    url.searchParams.delete("lesson");
    url.searchParams.set("gallery", "1");
    history.replaceState(null, "", url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <EvidenceProvider lessonId={current.lesson.id}>
      <NotesPanelProvider>
        <CourseShell
          current={current}
          lessons={lessons}
          onSelectLesson={selectLesson}
          isGallery={gallery}
          onOpenGallery={import.meta.env.DEV ? openGallery : undefined}
        />
      </NotesPanelProvider>
    </EvidenceProvider>
  );
}
