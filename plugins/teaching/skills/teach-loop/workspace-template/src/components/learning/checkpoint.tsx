import { CheckCircle2Icon, HelpCircleIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEvidence } from "@/evidence/evidence-context";
import { LearningCard } from "./learning-card";

interface CheckpointProps {
  id: string;
  prompt: string;
  hints?: string[];
  placeholder?: string;
  minimumCharacters?: number;
}

export function Checkpoint({
  id,
  prompt,
  hints = [],
  placeholder = "Work it through in your own words…",
  minimumCharacters = 1,
}: CheckpointProps) {
  const { snapshot, setResponse, addHint } = useEvidence();
  const existing = snapshot.responses[id];
  const [text, setText] = useState(typeof existing?.value === "string" ? existing.value : "");
  const [visibleHints, setVisibleHints] = useState(existing?.hintsUsed.length ?? 0);
  const [selfAssessment, setSelfAssessment] = useState(existing?.selfAssessment ?? "");
  const canSave = text.trim().length >= minimumCharacters;

  const revealHint = () => {
    const index = visibleHints;
    if (index >= hints.length) return;
    addHint(id, `hint-${index + 1}`);
    setVisibleHints((count) => count + 1);
  };

  return (
    <LearningCard
      id={id}
      title="Checkpoint"
      description={prompt}
      icon={<CheckCircle2Icon aria-hidden="true" />}
      footer={
        <>
          <Button
            type="button"
            disabled={!canSave}
            onClick={() =>
              setResponse(id, text.trim(), {
                kind: "checkpoint",
                selfAssessment: selfAssessment || undefined,
                completed: true,
                preserveOriginal: true,
              })
            }
          >
            Save response
          </Button>
          {visibleHints < hints.length ? (
            <Button type="button" variant="outline" onClick={revealHint}>
              <HelpCircleIcon data-icon="inline-start" aria-hidden="true" />
              Reveal hint {visibleHints + 1}
            </Button>
          ) : null}
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-response`}>Your answer or working</Label>
        <Textarea
          id={`${id}-response`}
          value={text}
          placeholder={placeholder}
          onChange={(event) => setText(event.target.value)}
        />
      </div>
      {visibleHints > 0 ? (
        <div className="flex flex-col gap-2" aria-live="polite">
          {hints.slice(0, visibleHints).map((hint, index) => (
            <div key={hint} className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Hint {index + 1}: </span>
              {hint}
            </div>
          ))}
        </div>
      ) : null}
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Before feedback, how does this feel?</legend>
        <div className="flex flex-wrap gap-2">
          {[
            ["ready", "I can explain it"],
            ["uncertain", "I am uncertain"],
            ["stuck", "I need direct help"],
          ].map(([value, label]) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={selfAssessment === value ? "secondary" : "outline"}
              aria-pressed={selfAssessment === value}
              onClick={() => setSelfAssessment(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </fieldset>
    </LearningCard>
  );
}
