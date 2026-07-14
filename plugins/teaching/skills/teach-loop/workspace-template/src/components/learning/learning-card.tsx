import type { ReactNode } from "react";
import { MessageSquarePlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNotesPanel } from "@/components/runtime/notes-panel-context";

interface LearningCardProps {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}

export function LearningCard({
  id,
  title,
  description,
  icon,
  children,
  className,
  footer,
}: LearningCardProps) {
  const { openNotes } = useNotesPanel();
  return (
    <Card id={id} className={cn("my-6 overflow-hidden", className)}>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          {icon ? (
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              {icon}
            </div>
          ) : null}
          <div className="flex min-w-0 flex-col gap-1.5">
            <CardTitle className="leading-snug">{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
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
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
      {footer ? <div className="flex flex-wrap items-center gap-2 border-t border-border px-5 py-4">{footer}</div> : null}
    </Card>
  );
}
