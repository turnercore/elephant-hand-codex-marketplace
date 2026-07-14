import { CircleHelpIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useEvidence } from "@/evidence/evidence-context";
import { cn } from "@/lib/utils";
import { LearningCard } from "./learning-card";

export interface ChoiceOption {
  id: string;
  label: string;
  feedback?: string;
}

interface MultipleChoiceProps {
  id: string;
  prompt: string;
  options: ChoiceOption[];
  correctId?: string;
  explanation?: string;
}

export function MultipleChoice({ id, prompt, options, correctId, explanation }: MultipleChoiceProps) {
  const { snapshot, setResponse } = useEvidence();
  const existingValue = snapshot.responses[id]?.value;
  const [selected, setSelected] = useState(typeof existingValue === "string" ? existingValue : "");
  const [checked, setChecked] = useState(Boolean(snapshot.responses[id]));
  const correct = correctId ? selected === correctId : undefined;
  const selectedOption = options.find((option) => option.id === selected);

  return (
    <LearningCard
      id={id}
      title="Check your model"
      description={prompt}
      icon={<CircleHelpIcon aria-hidden="true" />}
      footer={
        <Button
          type="button"
          disabled={!selected}
          onClick={() => {
            setChecked(true);
            setResponse(id, selected, {
              kind: "multiple_choice",
              correct,
              completed: correctId ? correct : true,
              metadata: { optionLabel: selectedOption?.label },
            });
          }}
        >
          Check answer
        </Button>
      }
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">{prompt}</legend>
        {options.map((option) => (
          <Label
            key={option.id}
            htmlFor={`${id}-${option.id}`}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 font-normal transition-colors hover:bg-accent",
              selected === option.id && "border-primary bg-accent",
            )}
          >
            <input
              id={`${id}-${option.id}`}
              name={id}
              type="radio"
              value={option.id}
              checked={selected === option.id}
              onChange={() => {
                setSelected(option.id);
                setChecked(false);
              }}
              className="mt-1 accent-[var(--primary)]"
            />
            <span>{option.label}</span>
          </Label>
        ))}
      </fieldset>
      {checked ? (
        <div
          className={cn(
            "rounded-lg border p-4 text-sm leading-relaxed",
            correct === true && "border-primary/40 bg-accent",
            correct === false && "border-destructive/40 bg-destructive/10",
          )}
          aria-live="polite"
        >
          <p className="font-medium">
            {correct === undefined ? "Response saved." : correct ? "That holds up." : "Not quite yet."}
          </p>
          {selectedOption?.feedback ? <p className="mt-1">{selectedOption.feedback}</p> : null}
          {explanation ? <p className="mt-1">{explanation}</p> : null}
        </div>
      ) : null}
    </LearningCard>
  );
}
