import { CheckIcon, ExternalLinkIcon, PlayCircleIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useEvidence } from "@/evidence/evidence-context";
import { LearningCard } from "./learning-card";
import { Cite } from "./citations";

interface VideoSegmentProps {
  id: string;
  title: string;
  sourceId?: string;
  videoId?: string;
  embedUrl?: string;
  externalUrl?: string;
  startSeconds?: number;
  endSeconds?: number;
  durationLabel: string;
  purpose: string;
  before: ReactNode;
  after: ReactNode;
  alternative: ReactNode;
}

export function VideoSegment({
  id,
  title,
  sourceId,
  videoId,
  embedUrl,
  externalUrl,
  startSeconds = 0,
  endSeconds,
  durationLabel,
  purpose,
  before,
  after,
  alternative,
}: VideoSegmentProps) {
  const { snapshot, recordEvent, markComplete } = useEvidence();
  const [loaded, setLoaded] = useState(false);
  const completed = snapshot.completedIds.includes(id);
  const youtubeUrl = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?start=${startSeconds}${endSeconds ? `&end=${endSeconds}` : ""}&rel=0`
    : undefined;
  const src = embedUrl ?? youtubeUrl;

  return (
    <LearningCard
      id={id}
      title={title}
      description={`${durationLabel} · ${purpose}`}
      icon={<PlayCircleIcon aria-hidden="true" />}
      footer={
        <>
          <Button
            type="button"
            variant={completed ? "secondary" : "default"}
            onClick={() => markComplete(id, { action: "learner_marked_complete" })}
          >
            <CheckIcon data-icon="inline-start" aria-hidden="true" />
            {completed ? "Segment completed" : "Mark segment complete"}
          </Button>
          {externalUrl ? (
            <Button asChild type="button" variant="outline">
              <a href={externalUrl} target="_blank" rel="noreferrer">
                Open externally
                <ExternalLinkIcon data-icon="inline-end" aria-hidden="true" />
              </a>
            </Button>
          ) : null}
        </>
      }
    >
      <div className="rounded-lg bg-muted p-4 text-sm leading-relaxed">
        <p className="font-medium">Before watching</p>
        <div className="mt-1 text-muted-foreground lesson-prose">{before}</div>
      </div>
      {src ? (
        loaded ? (
          <div className="aspect-video overflow-hidden rounded-lg border border-border bg-black">
            <iframe
              title={title}
              src={src}
              className="size-full"
              loading="lazy"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => recordEvent(id, "video", { action: "embed_loaded" })}
            />
          </div>
        ) : (
          <button
            type="button"
            className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-lg border border-border bg-muted/40 p-6 text-center outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => {
              setLoaded(true);
              recordEvent(id, "video", { action: "embed_requested" });
            }}
          >
            <PlayCircleIcon className="text-primary" aria-hidden="true" />
            <span className="font-medium">Load external video segment</span>
            <span className="max-w-md text-sm text-muted-foreground">
              External media loads only after you choose to open it.
            </span>
          </button>
        )
      ) : null}
      {sourceId ? <p className="text-sm text-muted-foreground">Video source <Cite source={sourceId} /></p> : null}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-border p-4 text-sm leading-relaxed">
          <p className="font-medium">After watching</p>
          <div className="mt-1 text-muted-foreground lesson-prose">{after}</div>
        </div>
        <div className="rounded-lg border border-border p-4 text-sm leading-relaxed">
          <p className="font-medium">Non-video alternative</p>
          <div className="mt-1 text-muted-foreground lesson-prose">{alternative}</div>
        </div>
      </div>
    </LearningCard>
  );
}
