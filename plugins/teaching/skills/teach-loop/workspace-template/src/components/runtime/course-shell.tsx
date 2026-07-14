import { MDXProvider } from "@mdx-js/react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookOpenIcon,
  Clock3Icon,
  FlaskConicalIcon,
  MessageSquarePlusIcon,
  MilestoneIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { LessonModule } from "@/course/types";
import { courseConfig } from "@/course/course.config";
import { useTheme } from "@/themes/theme-provider";
import { ExportDialog } from "./export-dialog";
import { mdxComponents } from "./mdx-components";
import { DesktopNotesDock, MobileNotesSheet } from "./notes-sidebar";
import { useNotesPanel } from "./notes-panel-context";
import { ThemeMenu } from "./theme-menu";

interface CourseShellProps {
  current: LessonModule;
  lessons: LessonModule[];
  onSelectLesson: (id: string) => void;
  isGallery?: boolean;
  onOpenGallery?: () => void;
}

interface LessonSectionItem {
  id: string;
  title: string;
}

function useLessonScrollState(lessonId: string) {
  const [sections, setSections] = useState<LessonSectionItem[]>([]);
  const [currentSection, setCurrentSection] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const collect = () => {
      const next = Array.from(document.querySelectorAll<HTMLElement>(".lesson-section[id]")).map((element) => ({
        id: element.id,
        title: element.querySelector("h2")?.textContent?.trim() || element.id,
      }));
      setSections(next);
      if (next.length > 0) setCurrentSection((value) => value || next[0].id);
    };

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const elements = Array.from(document.querySelectorAll<HTMLElement>(".lesson-section[id]"));
        if (elements.length > 0) {
          const focusLine = window.innerHeight * 0.3;
          let active = elements[0].id;
          for (const element of elements) {
            if (element.getBoundingClientRect().top <= focusLine) active = element.id;
            else break;
          }
          setCurrentSection(active);
        }

        const article = document.querySelector<HTMLElement>("[data-lesson-article]");
        if (!article) return;
        const top = article.offsetTop;
        const range = Math.max(1, article.offsetHeight - window.innerHeight + 120);
        setProgress(Math.max(0, Math.min(100, ((window.scrollY - top + 120) / range) * 100)));
      });
    };

    const timer = window.setTimeout(() => {
      collect();
      update();
    }, 0);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [lessonId]);

  return { sections, currentSection, progress };
}

export function CourseShell({
  current,
  lessons,
  onSelectLesson,
  isGallery = false,
  onOpenGallery,
}: CourseShellProps) {
  const { openNotes } = useNotesPanel();
  const notesPanel = useNotesPanel();
  const { applyLessonSuggestion } = useTheme();
  const { lesson, Component } = current;
  const [railExpanded, setRailExpanded] = useState(false);
  const { sections, currentSection, progress } = useLessonScrollState(lesson.id);

  const currentLessonIndex = useMemo(
    () => lessons.findIndex((item) => item.lesson.id === lesson.id),
    [lesson.id, lessons],
  );
  const previousLesson = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : undefined;
  const nextLesson = currentLessonIndex >= 0 && currentLessonIndex < lessons.length - 1
    ? lessons[currentLessonIndex + 1]
    : undefined;

  useEffect(() => {
    applyLessonSuggestion(lesson.theme);
    document.title = `${lesson.title} · ${courseConfig.title}`;
  }, [applyLessonSuggestion, lesson.theme, lesson.title]);

  const jumpToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const gridTemplateColumns = `${railExpanded ? "13rem" : "3rem"} minmax(0,1fr) ${notesPanel.open ? "20rem" : "3rem"}`;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/92 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[110rem] items-center gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3 lg:w-64">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <BookOpenIcon aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold">{courseConfig.title}</p>
              <p className="hidden truncate text-xs text-muted-foreground sm:block">Local-first private tutor</p>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <label htmlFor="lesson-nav" className="sr-only">Choose lesson</label>
            <select
              id="lesson-nav"
              value={isGallery ? "__gallery__" : lesson.id}
              onChange={(event) => {
                if (event.target.value === "__gallery__") onOpenGallery?.();
                else onSelectLesson(event.target.value);
              }}
              className="h-9 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring lg:max-w-sm"
            >
              {lessons.map((item) => <option key={item.lesson.id} value={item.lesson.id}>{item.lesson.title}</option>)}
              {import.meta.env.DEV ? <option value="__gallery__">Component gallery</option> : null}
            </select>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Open lesson notes"
              onClick={() => openNotes({ id: currentSection || "lesson", label: sections.find((item) => item.id === currentSection)?.title ?? "Whole lesson" })}
            >
              <MessageSquarePlusIcon aria-hidden="true" />
            </Button>
            <ThemeMenu />
            <ExportDialog lesson={lesson} compact />
          </div>
        </div>
        <div className="h-1 bg-muted" aria-hidden="true">
          <div
            className="h-full bg-primary transition-[width] duration-150"
            style={{ width: `${progress}%` }}
            data-testid="top-reading-progress"
          />
        </div>
      </header>

      <div
        className="mx-auto max-w-[110rem] lg:grid"
        style={{ gridTemplateColumns }}
      >
        <aside
          className="sticky top-[4.25rem] hidden h-[calc(100dvh-4.25rem)] min-h-0 border-r border-border bg-background lg:flex lg:flex-col"
          aria-label="Lesson sections"
          data-testid="lesson-progress-rail"
          data-state={railExpanded ? "expanded" : "collapsed"}
        >
          <div className="flex items-center justify-between gap-2 border-b border-border p-2">
            {railExpanded ? <span className="truncate px-1 text-xs font-semibold">Lesson sections</span> : null}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={railExpanded ? "Collapse lesson progress" : "Expand lesson progress"}
              onClick={() => setRailExpanded((value) => !value)}
            >
              {railExpanded ? <PanelLeftCloseIcon aria-hidden="true" /> : <PanelLeftOpenIcon aria-hidden="true" />}
            </Button>
          </div>

          <nav className="relative min-h-0 flex-1 overflow-y-auto py-4" aria-label="Sections in this lesson">
            <div className={railExpanded ? "px-3" : "px-2"}>
              <div className={`absolute bottom-5 top-5 bg-border ${railExpanded ? "left-[1.55rem] w-px" : "left-1/2 w-1 -translate-x-1/2 rounded-full"}`} aria-hidden="true">
                {!railExpanded ? (
                  <div className="w-full rounded-full bg-primary" style={{ height: `${progress}%` }} />
                ) : null}
              </div>
              <div className="relative flex flex-col gap-2">
                {sections.length === 0 ? (
                  <p className={railExpanded ? "text-xs text-muted-foreground" : "sr-only"}>No lesson sections found.</p>
                ) : (
                  sections.map((item, index) => {
                    const active = item.id === currentSection;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => jumpToSection(item.id)}
                        aria-current={active ? "step" : undefined}
                        data-section-id={item.id}
                        className={`group relative flex min-h-8 items-center rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring ${railExpanded ? "w-full gap-3 py-1.5 pr-2" : "w-full justify-center"} ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        <span className={`relative z-10 flex shrink-0 items-center justify-center rounded-full border bg-background transition-colors ${active ? "size-5 border-primary bg-primary text-primary-foreground" : "size-3 border-border group-hover:border-primary"}`}>
                          {railExpanded && active ? <span className="text-[0.62rem]">{index + 1}</span> : null}
                        </span>
                        {railExpanded ? (
                          <span className={`min-w-0 text-xs leading-snug ${active ? "font-semibold" : "font-medium"}`}>{item.title}</span>
                        ) : (
                          <span className="sr-only">{item.title}</span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </nav>

          {import.meta.env.DEV && onOpenGallery ? (
            <div className="border-t border-border p-2">
              <Button type="button" variant={isGallery ? "secondary" : "ghost"} size={railExpanded ? "sm" : "icon-sm"} className={railExpanded ? "w-full justify-start" : "w-full"} onClick={onOpenGallery}>
                <FlaskConicalIcon data-icon={railExpanded ? "inline-start" : undefined} aria-hidden="true" />
                {railExpanded ? "Component gallery" : <span className="sr-only">Component gallery</span>}
              </Button>
            </div>
          ) : null}
        </aside>

        <main className="min-w-0">
          <article className="mx-auto w-full max-w-[var(--reading-width)] px-5 py-10 sm:px-8 sm:py-14" data-lesson-article>
            <div className="mb-10">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  <Clock3Icon aria-hidden="true" />
                  {lesson.estimatedMinutes} min
                </Badge>
                {lesson.milestoneIds.map((milestone) => (
                  <Badge key={milestone} variant="outline">
                    <MilestoneIcon aria-hidden="true" />
                    {milestone}
                  </Badge>
                ))}
                {isGallery ? <Badge variant="outline">Developer view</Badge> : null}
              </div>
              <h1 className="text-balance text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">{lesson.title}</h1>
              <p className="mt-4 text-pretty text-lg leading-8 text-muted-foreground">{lesson.summary}</p>
              {lesson.outcomes.length > 0 ? (
                <div className="mt-6 rounded-xl border border-border bg-muted/35 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Tangible win</p>
                  <ul className="mt-2 list-disc pl-5 text-sm leading-relaxed">
                    {lesson.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}
                  </ul>
                </div>
              ) : null}
            </div>

            <MDXProvider components={mdxComponents}>
              <Component />
            </MDXProvider>

            {!isGallery && (previousLesson || nextLesson) ? (
              <nav className="mt-14 grid gap-3 sm:grid-cols-2" aria-label="Adjacent lessons">
                <div>
                  {previousLesson ? (
                    <Button type="button" variant="outline" className="h-auto w-full justify-start py-3 text-left" onClick={() => onSelectLesson(previousLesson.lesson.id)}>
                      <ArrowLeftIcon data-icon="inline-start" aria-hidden="true" />
                      <span><span className="block text-xs text-muted-foreground">Previous lesson</span>{previousLesson.lesson.title}</span>
                    </Button>
                  ) : null}
                </div>
                <div>
                  {nextLesson ? (
                    <Button type="button" variant="outline" className="h-auto w-full justify-end py-3 text-right" onClick={() => onSelectLesson(nextLesson.lesson.id)}>
                      <span><span className="block text-xs text-muted-foreground">Next available lesson</span>{nextLesson.lesson.title}</span>
                      <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
                    </Button>
                  ) : null}
                </div>
              </nav>
            ) : null}

            <div className="mt-14 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Close the loop</p>
              <h2 className="mt-2 text-2xl font-semibold">Bring the evidence back to your tutor</h2>
              <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">
                Your return includes responses, notes, hint use, interaction evidence, questions, and reading-theme choices. The tutor should discuss it with you before choosing the next action.
              </p>
              <div className="mt-5"><ExportDialog lesson={lesson} /></div>
            </div>
          </article>
        </main>

        <DesktopNotesDock />
      </div>
      <MobileNotesSheet />
    </div>
  );
}
