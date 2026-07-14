import { MessagesSquareIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEvidence } from "@/evidence/evidence-context";
import { LearningCard } from "./learning-card";

interface ReflectionPromptProps {
  id: string;
  prompt: string;
  placeholder?: string;
}

export function ReflectionPrompt({
  id,
  prompt,
  placeholder = "Capture what changed, what surprised you, or what remains foggy…",
}: ReflectionPromptProps) {
  const { snapshot, setResponse } = useEvidence();
  const existing = snapshot.responses[id]?.value;
  const [text, setText] = useState(typeof existing === "string" ? existing : "");
  return (
    <LearningCard
      id={id}
      title="Reflect before you leave"
      description={prompt}
      icon={<MessagesSquareIcon aria-hidden="true" />}
      footer={
        <Button
          type="button"
          disabled={!text.trim()}
          onClick={() =>
            setResponse(id, text.trim(), {
              kind: "reflection",
              completed: true,
              preserveOriginal: false,
              eventType: "reflection",
            })
          }
        >
          Save reflection
        </Button>
      }
    >
      <Label htmlFor={`${id}-reflection`} className="sr-only">
        Reflection
      </Label>
      <Textarea
        id={`${id}-reflection`}
        value={text}
        placeholder={placeholder}
        onChange={(event) => setText(event.target.value)}
      />
    </LearningCard>
  );
}
