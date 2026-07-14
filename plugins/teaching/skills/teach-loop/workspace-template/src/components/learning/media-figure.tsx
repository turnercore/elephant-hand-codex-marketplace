import { ExternalLinkIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { getCourseSource } from "@/course/sources";
import { Cite } from "./citations";

interface MediaFigureProps {
  src: string;
  alt: string;
  caption: ReactNode;
  sourceId?: string;
  sourceUrl?: string;
  sourceLabel?: string;
  aspect?: "video" | "wide" | "square" | "auto";
}

const aspectClasses = {
  video: "aspect-video",
  wide: "aspect-[16/7]",
  square: "aspect-square",
  auto: "",
};

export function MediaFigure({
  src,
  alt,
  caption,
  sourceId,
  sourceUrl,
  sourceLabel = "Image source",
  aspect = "auto",
}: MediaFigureProps) {
  const registeredSource = sourceId ? getCourseSource(sourceId) : undefined;
  const link = registeredSource?.url ?? sourceUrl;

  return (
    <figure className="my-6 overflow-hidden rounded-xl border border-border bg-card">
      <div className={aspectClasses[aspect]}>
        <img src={src} alt={alt} loading="lazy" className="size-full object-contain" />
      </div>
      <figcaption className="flex flex-wrap items-start justify-between gap-3 border-t border-border p-4 text-sm text-muted-foreground">
        <div className="min-w-0 flex-1 lesson-prose">
          {caption}
          {sourceId ? <span className="ml-1 whitespace-nowrap">Image source <Cite source={sourceId} /></span> : null}
        </div>
        {link ? (
          <Button asChild variant="ghost" size="sm">
            <a href={link} target="_blank" rel="noreferrer">
              {sourceLabel}
              <ExternalLinkIcon data-icon="inline-end" aria-hidden="true" />
            </a>
          </Button>
        ) : null}
      </figcaption>
    </figure>
  );
}
