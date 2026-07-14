import { BookOpenCheckIcon, ChevronRightIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useEvidence } from "@/evidence/evidence-context";
import { cn } from "@/lib/utils";
import { LearningCard } from "./learning-card";

export interface WorkedExampleStep {
  title: string;
  content: ReactNode;
}

interface WorkedExampleProps {
  id: string;
  title?: string;
  description?: string;
  steps: WorkedExampleStep[];
}

export function WorkedExample({
  id,
  title = "Worked example",
  description = "Reveal one step at a time, then reconstruct the method without the scaffold.",
  steps,
}: WorkedExampleProps) {
  const { snapshot, recordEvent, markComplete } = useEvidence();
  const priorReveals = Number(snapshot.responses[id]?.metadata?.revealedSteps ?? 0);
  const [revealed, setRevealed] = useState(Math.max(1, priorReveals));
  const allRevealed = revealed >= steps.length;

  const revealNext = () => {
    const next = Math.min(steps.length, revealed + 1);
    setRevealed(next);
    recordEvent(id, "interaction", { action: "reveal_step", step: next });
    if (next === steps.length) markComplete(id, { revealedSteps: next });
  };

  return (
    <LearningCard
      id={id}
      title={title}
      description={description}
      icon={<BookOpenCheckIcon aria-hidden="true" />}
      footer={
        !allRevealed ? (
          <Button type="button" onClick={revealNext}>
            Reveal next step
            <ChevronRightIcon data-icon="inline-end" aria-hidden="true" />
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            All steps revealed. Try the next checkpoint without reopening them.
          </p>
        )
      }
    >
      <ol className="flex flex-col gap-3">
        {steps.map((step, index) => {
          const visible = index < revealed;
          return (
            <li
              key={step.title}
              className={cn(
                "grid grid-cols-[2rem_1fr] gap-3 rounded-lg border border-border p-4 transition-opacity",
                !visible && "select-none opacity-35 blur-[2px]",
              )}
              aria-hidden={!visible}
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                {index + 1}
              </span>
              <div className="flex flex-col gap-2">
                <h4 className="font-semibold">{step.title}</h4>
                <div className="lesson-prose text-sm">{visible ? step.content : "Hidden until the prior step is considered."}</div>
              </div>
            </li>
          );
        })}
      </ol>
    </LearningCard>
  );
}
