import { BookOpenTextIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Cite } from "./citations";

interface KeyTermProps {
  term: string;
  children: ReactNode;
  sourceId?: string;
}

/**
 * Introduce important vocabulary at first meaningful use without bloating the paragraph.
 * Use the term as visible text and put the concise learner-facing definition in children.
 */
export function KeyTerm({ term, children, sourceId }: KeyTermProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline rounded-sm border-b border-dotted border-primary/70 font-semibold text-foreground outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Define ${term}`}
        >
          {term}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="max-w-sm">
        <div className="flex items-start gap-3">
          <BookOpenTextIcon className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
          <div className="min-w-0">
            <p className="font-semibold">{term}</p>
            <div className="mt-1 text-sm leading-relaxed text-muted-foreground lesson-prose">{children}</div>
            {sourceId ? <p className="mt-2 text-xs text-muted-foreground">Definition source <Cite source={sourceId} /></p> : null}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
