import { SlidersHorizontalIcon } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useEvidence } from "@/evidence/evidence-context";
import { LearningCard } from "./learning-card";

export interface ExplorerParameter {
  id: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  initial: number;
  unit?: string;
  format?: (value: number) => string;
}

interface ParameterExplorerProps {
  id: string;
  title: string;
  prompt: string;
  parameters: ExplorerParameter[];
  children: (values: Record<string, number>) => ReactNode;
}

export function ParameterExplorer({ id, title, prompt, parameters, children }: ParameterExplorerProps) {
  const { setResponse, recordEvent } = useEvidence();
  const initial = useMemo(
    () => Object.fromEntries(parameters.map((parameter) => [parameter.id, parameter.initial])),
    [parameters],
  );
  const [values, setValues] = useState<Record<string, number>>(initial);
  return (
    <LearningCard
      id={id}
      title={title}
      description={prompt}
      icon={<SlidersHorizontalIcon aria-hidden="true" />}
      footer={
        <Button
          type="button"
          onClick={() =>
            setResponse(id, values, {
              kind: "parameter_explorer",
              completed: true,
              preserveOriginal: false,
            })
          }
        >
          Save this state
        </Button>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(14rem,0.7fr)_1.3fr]">
        <div className="flex flex-col gap-5 rounded-lg border border-border p-4">
          {parameters.map((parameter) => {
            const value = values[parameter.id] ?? parameter.initial;
            return (
              <div key={parameter.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor={`${id}-${parameter.id}`}>{parameter.label}</Label>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {parameter.format ? parameter.format(value) : `${value}${parameter.unit ?? ""}`}
                  </span>
                </div>
                <Slider
                  id={`${id}-${parameter.id}`}
                  min={parameter.min}
                  max={parameter.max}
                  step={parameter.step ?? 1}
                  value={[value]}
                  onValueChange={([next]) =>
                    setValues((current) => ({ ...current, [parameter.id]: next ?? parameter.initial }))
                  }
                  onValueCommit={([next]) =>
                    recordEvent(id, "interaction", {
                      action: "parameter_changed",
                      parameterId: parameter.id,
                      value: next ?? parameter.initial,
                    })
                  }
                  aria-label={parameter.label}
                />
              </div>
            );
          })}
        </div>
        <div className="min-h-52 rounded-lg border border-border bg-muted/25 p-4">{children(values)}</div>
      </div>
    </LearningCard>
  );
}
