import { Columns3Icon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEvidence } from "@/evidence/evidence-context";
import { LearningCard } from "./learning-card";

export interface ContrastCase {
  id: string;
  title: string;
  content: ReactNode;
  diagnosticQuestion?: string;
}

interface ContrastCasesProps {
  id: string;
  title?: string;
  prompt: string;
  cases: ContrastCase[];
}

export function ContrastCases({ id, title = "Contrast the cases", prompt, cases }: ContrastCasesProps) {
  const { recordEvent, markComplete } = useEvidence();
  const [viewed, setViewed] = useState<Set<string>>(() => new Set(cases.slice(0, 1).map((item) => item.id)));

  const onValueChange = (value: string) => {
    setViewed((current) => {
      const next = new Set(current);
      next.add(value);
      if (next.size === cases.length) markComplete(id, { viewedCases: [...next] });
      return next;
    });
    recordEvent(id, "interaction", { action: "view_case", caseId: value });
  };

  return (
    <LearningCard id={id} title={title} description={prompt} icon={<Columns3Icon aria-hidden="true" />}>
      <Tabs defaultValue={cases[0]?.id} onValueChange={onValueChange}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start">
          {cases.map((item) => (
            <TabsTrigger key={item.id} value={item.id}>
              {item.title}
            </TabsTrigger>
          ))}
        </TabsList>
        {cases.map((item) => (
          <TabsContent key={item.id} value={item.id}>
            <div className="rounded-lg border border-border bg-muted/35 p-4 lesson-prose">
              {item.content}
              {item.diagnosticQuestion ? (
                <p className="mt-3 font-medium text-foreground">Notice: {item.diagnosticQuestion}</p>
              ) : null}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>{viewed.size} of {cases.length} cases inspected</span>
        <Button type="button" variant="ghost" size="sm" onClick={() => setViewed(new Set())}>
          Reset viewed state
        </Button>
      </div>
    </LearningCard>
  );
}
