import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ConceptTooltipProps {
  term: ReactNode;
  children: ReactNode;
}

export function ConceptTooltip({ term, children }: ConceptTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline rounded-sm border-b border-dotted border-current font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {term}
        </button>
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  );
}
