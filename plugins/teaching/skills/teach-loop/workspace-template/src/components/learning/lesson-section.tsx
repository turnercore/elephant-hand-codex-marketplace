import type { ReactNode } from "react";
import { MessageSquarePlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotesPanel } from "@/components/runtime/notes-panel-context";
import { cn } from "@/lib/utils";

interface LessonSectionProps {
  id: string;
  title: string;
  children: ReactNode;
  eyebrow?: string;
  className?: string;
}

export function LessonSection({ id, title, children, eyebrow, className }: LessonSectionProps) {
  const { openNotes } = useNotesPanel();
  return (
    <section id={id} className={cn("lesson-section scroll-mt-24", className)}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p> : null}
          <h2 className="text-balance text-2xl font-semibold tracking-tight">{title}</h2>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Add a note about ${title}`}
          onClick={() => openNotes({ id, label: title })}
        >
          <MessageSquarePlusIcon aria-hidden="true" />
        </Button>
      </div>
      <div className="lesson-prose">{children}</div>
    </section>
  );
}
