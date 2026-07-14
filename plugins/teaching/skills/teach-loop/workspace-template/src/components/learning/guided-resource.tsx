import { CheckIcon, ExternalLinkIcon, RouteIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { getCourseSource } from "@/course/sources";
import { useEvidence } from "@/evidence/evidence-context";
import { Cite } from "./citations";
import { LearningCard } from "./learning-card";

interface GuidedResourceProps {
  id: string;
  sourceId: string;
  title?: string;
  estimatedTime?: string;
  purpose: string;
  before?: ReactNode;
  inspect: ReactNode;
  after: ReactNode;
  alternative?: ReactNode;
}

/** Frame an external animation, article, demo, or step-through as an active learning task. */
export function GuidedResource({
  id,
  sourceId,
  title,
  estimatedTime,
  purpose,
  before,
  inspect,
  after,
  alternative,
}: GuidedResourceProps) {
  const source = getCourseSource(sourceId);
  const { snapshot, markComplete, recordEvent } = useEvidence();
  const completed = snapshot.completedIds.includes(id);

  if (!source) {
    return <p className="rounded-lg bg-destructive/10 p-4 text-destructive">Unknown guided resource: {sourceId}</p>;
  }

  return (
    <LearningCard
      id={id}
      title={title ?? source.title}
      description={[estimatedTime, purpose].filter(Boolean).join(" · ")}
      icon={<RouteIcon aria-hidden="true" />}
      footer={
        <>
          <Button
            asChild
            type="button"
            onClick={() => recordEvent(id, "interaction", { action: "opened", sourceId })}
          >
            <a href={source.url} target="_blank" rel="noreferrer">
              Open guided resource
              <ExternalLinkIcon data-icon="inline-end" aria-hidden="true" />
            </a>
          </Button>
          <Button
            type="button"
            variant={completed ? "secondary" : "outline"}
            onClick={() => markComplete(id, { action: "learner_marked_complete", sourceId })}
          >
            <CheckIcon data-icon="inline-start" aria-hidden="true" />
            {completed ? "Resource completed" : "Mark complete"}
          </Button>
        </>
      }
    >
      {before ? (
        <div className="rounded-lg bg-muted p-4 text-sm leading-relaxed">
          <p className="font-medium">Before opening</p>
          <div className="mt-1 text-muted-foreground lesson-prose">{before}</div>
        </div>
      ) : null}
      <div className="rounded-lg border border-border p-4 text-sm leading-relaxed">
        <p className="font-medium">What to inspect</p>
        <div className="mt-1 text-muted-foreground lesson-prose">{inspect}</div>
      </div>
      <div className="rounded-lg border border-border p-4 text-sm leading-relaxed">
        <p className="font-medium">Afterward</p>
        <div className="mt-1 text-muted-foreground lesson-prose">{after}</div>
      </div>
      {alternative ? (
        <div className="rounded-lg border border-border p-4 text-sm leading-relaxed">
          <p className="font-medium">Alternative</p>
          <div className="mt-1 text-muted-foreground lesson-prose">{alternative}</div>
        </div>
      ) : null}
      <p className="text-sm text-muted-foreground">Source <Cite source={sourceId} /></p>
    </LearningCard>
  );
}
