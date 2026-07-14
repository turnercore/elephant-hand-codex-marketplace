import { ListTreeIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useEvidence } from "@/evidence/evidence-context";
import { LearningCard } from "./learning-card";

export interface ClassificationItem {
  id: string;
  label: string;
  categoryId: string;
}

export interface ClassificationCategory {
  id: string;
  label: string;
}

interface SortAndClassifyProps {
  id: string;
  prompt: string;
  items: ClassificationItem[];
  categories: ClassificationCategory[];
}

export function SortAndClassify({ id, prompt, items, categories }: SortAndClassifyProps) {
  const { setResponse } = useEvidence();
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const allAssigned = items.every((item) => assignments[item.id]);
  const correctCount = items.filter((item) => assignments[item.id] === item.categoryId).length;
  return (
    <LearningCard
      id={id}
      title="Sort and classify"
      description={prompt}
      icon={<ListTreeIcon aria-hidden="true" />}
      footer={
        <Button
          type="button"
          disabled={!allAssigned}
          onClick={() => {
            setChecked(true);
            setResponse(id, assignments, {
              kind: "classification",
              correct: correctCount === items.length,
              completed: true,
              metadata: { correctCount, total: items.length },
            });
          }}
        >
          Check classifications
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        {items.map((item) => {
          const correct = assignments[item.id] === item.categoryId;
          return (
            <div key={item.id} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr_12rem] sm:items-center">
              <Label htmlFor={`${id}-${item.id}`}>{item.label}</Label>
              <select
                id={`${id}-${item.id}`}
                value={assignments[item.id] ?? ""}
                onChange={(event) => {
                  setAssignments((current) => ({ ...current, [item.id]: event.target.value }));
                  setChecked(false);
                }}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Choose a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
              {checked ? (
                <p className="text-xs text-muted-foreground sm:col-span-2">
                  {correct ? "Correct." : `Reconsider this one. It belongs with ${categories.find((category) => category.id === item.categoryId)?.label}.`}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
      {checked ? (
        <p className="text-sm font-medium" aria-live="polite">
          {correctCount} of {items.length} classified correctly.
        </p>
      ) : null}
    </LearningCard>
  );
}
