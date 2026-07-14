import { GaugeIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useEvidence } from "@/evidence/evidence-context";
import { LearningCard } from "./learning-card";

interface ConfidenceCheckProps {
  id: string;
  label?: string;
  lowLabel?: string;
  highLabel?: string;
}

export function ConfidenceCheck({
  id,
  label = "How confident are you?",
  lowLabel = "Not yet",
  highLabel = "Ready to apply it",
}: ConfidenceCheckProps) {
  const { snapshot, setResponse } = useEvidence();
  const [value, setValue] = useState(snapshot.responses[id]?.confidence ?? 50);
  return (
    <LearningCard
      id={id}
      title={label}
      description="Confidence is useful evidence only when it is kept separate from correctness."
      icon={<GaugeIcon aria-hidden="true" />}
      footer={
        <Button
          type="button"
          onClick={() =>
            setResponse(id, value, {
              kind: "confidence",
              confidence: value,
              completed: true,
              preserveOriginal: false,
              eventType: "confidence",
            })
          }
        >
          Save confidence
        </Button>
      }
    >
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor={`${id}-slider`}>{lowLabel}</Label>
        <span className="text-lg font-semibold tabular-nums">{value}%</span>
        <Label htmlFor={`${id}-slider`}>{highLabel}</Label>
      </div>
      <Slider
        id={`${id}-slider`}
        min={0}
        max={100}
        step={5}
        value={[value]}
        onValueChange={([next]) => setValue(next ?? 0)}
        aria-label={label}
      />
    </LearningCard>
  );
}
