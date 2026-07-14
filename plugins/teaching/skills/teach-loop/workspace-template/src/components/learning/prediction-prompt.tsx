import { BrainIcon, CheckIcon, RotateCcwIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useEvidence } from "@/evidence/evidence-context";
import { LearningCard } from "./learning-card";

interface PredictionPromptProps {
  id: string;
  prompt: string;
  placeholder?: string;
  reveal?: string;
  confidence?: boolean;
}

export function PredictionPrompt({
  id,
  prompt,
  placeholder = "Write your prediction and why…",
  reveal,
  confidence = true,
}: PredictionPromptProps) {
  const { snapshot, setResponse } = useEvidence();
  const existing = snapshot.responses[id];
  const initialText = typeof existing?.value === "string" ? existing.value : "";
  const [text, setText] = useState(initialText);
  const [confidenceValue, setConfidenceValue] = useState(existing?.confidence ?? 50);
  const [showReveal, setShowReveal] = useState(false);
  const submitted = Boolean(existing);
  const canSubmit = text.trim().length > 0;

  const footer = useMemo(
    () => (
      <>
        <Button
          type="button"
          disabled={!canSubmit}
          onClick={() =>
            setResponse(id, text.trim(), {
              kind: "prediction",
              confidence: confidenceValue,
              completed: true,
              preserveOriginal: true,
              eventType: "prediction",
            })
          }
        >
          <CheckIcon data-icon="inline-start" aria-hidden="true" />
          {submitted ? "Save revision" : "Lock prediction"}
        </Button>
        {submitted && reveal ? (
          <Button type="button" variant="outline" onClick={() => setShowReveal((value) => !value)}>
            {showReveal ? "Hide explanation" : "Reveal explanation"}
          </Button>
        ) : null}
        {submitted ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setText("");
              setConfidenceValue(50);
            }}
          >
            <RotateCcwIcon data-icon="inline-start" aria-hidden="true" />
            Clear draft
          </Button>
        ) : null}
      </>
    ),
    [canSubmit, confidenceValue, id, reveal, setResponse, showReveal, submitted, text],
  );

  return (
    <LearningCard
      id={id}
      title="Predict before the reveal"
      description={prompt}
      icon={<BrainIcon aria-hidden="true" />}
      footer={footer}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-response`}>Your prediction</Label>
        <Textarea
          id={`${id}-response`}
          value={text}
          placeholder={placeholder}
          onChange={(event) => setText(event.target.value)}
        />
        {submitted ? (
          <p className="text-xs text-muted-foreground">
            Your first submitted prediction remains preserved in the return even if you revise it.
          </p>
        ) : null}
      </div>
      {confidence ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor={`${id}-confidence`}>Confidence before feedback</Label>
            <span className="text-sm tabular-nums text-muted-foreground">{confidenceValue}%</span>
          </div>
          <Slider
            id={`${id}-confidence`}
            min={0}
            max={100}
            step={5}
            value={[confidenceValue]}
            onValueChange={([value]) => setConfidenceValue(value ?? 0)}
            aria-label="Prediction confidence"
          />
        </div>
      ) : null}
      {showReveal && reveal ? (
        <div className="rounded-lg bg-accent p-4 text-sm leading-relaxed text-accent-foreground" aria-live="polite">
          {reveal}
        </div>
      ) : null}
    </LearningCard>
  );
}
