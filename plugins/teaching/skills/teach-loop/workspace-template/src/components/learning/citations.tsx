import { BookOpenIcon, ExternalLinkIcon, FilmIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { courseSources, getCourseSource } from "@/course/sources";
import type { CourseSource } from "@/course/types";

function sourceById(id: string): CourseSource | undefined {
  return getCourseSource(id);
}

export function Cite({ source, children }: { source: string; children?: ReactNode }) {
  const item = sourceById(source);
  if (!item) {
    return (
      <span className="rounded bg-destructive/10 px-1 text-sm text-destructive" title={`Unknown source: ${source}`}>
        [missing source]
      </span>
    );
  }
  const number = courseSources.findIndex((candidate) => candidate.id === source) + 1;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="ml-0.5 inline-flex translate-y-[-0.08em] items-center rounded-sm px-1 text-xs font-semibold text-primary outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Open citation ${number}: ${item.title}`}
        >
          {children ?? `[${number}]`}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{item.role}</Badge>
          <span className="text-xs text-muted-foreground">{item.type}</span>
        </div>
        <div>
          <p className="font-semibold leading-snug">{item.title}</p>
          {item.creator || item.organization ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {[item.creator, item.organization].filter(Boolean).join(" · ")}
            </p>
          ) : null}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{item.qualityNotes}</p>
        <Button asChild variant="outline" size="sm">
          <a href={item.url} target="_blank" rel="noreferrer">
            Open source
            <ExternalLinkIcon data-icon="inline-end" aria-hidden="true" />
          </a>
        </Button>
      </PopoverContent>
    </Popover>
  );
}

interface SourcePanelProps {
  sourceIds: string[];
  title?: string;
}

export function SourcePanel({ sourceIds, title = "Sources used in this lesson" }: SourcePanelProps) {
  const sources = sourceIds.map(sourceById).filter((source): source is CourseSource => Boolean(source));
  if (sources.length === 0) return null;
  return (
    <section className="my-10" aria-labelledby="lesson-sources-title">
      <div className="mb-4 flex items-center gap-2">
        <BookOpenIcon className="text-primary" aria-hidden="true" />
        <h2 id="lesson-sources-title" className="text-xl font-semibold">
          {title}
        </h2>
      </div>
      <div className="grid gap-3">
        {sources.map((source) => (
          <Card key={source.id}>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{source.role}</Badge>
                <Badge variant="outline">{source.type}</Badge>
              </div>
              <CardTitle className="text-base leading-snug">{source.title}</CardTitle>
              <CardDescription>
                {[source.creator, source.organization].filter(Boolean).join(" · ")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm leading-relaxed text-muted-foreground">{source.qualityNotes}</p>
              {source.supports.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Used for</p>
                  <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                    {source.supports.map((claim) => <li key={claim}>{claim}</li>)}
                  </ul>
                </div>
              ) : null}
              <Button asChild variant="outline" size="sm" className="self-start">
                <a href={source.url} target="_blank" rel="noreferrer">
                  Read source
                  <ExternalLinkIcon data-icon="inline-end" aria-hidden="true" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

interface FurtherReadingProps {
  sourceIds: string[];
  title?: string;
}

export function FurtherReading({ sourceIds, title = "Further reading and watching" }: FurtherReadingProps) {
  const sources = sourceIds.map(sourceById).filter((source): source is CourseSource => Boolean(source));
  if (sources.length === 0) return null;
  return (
    <section className="my-8 rounded-xl border border-border bg-muted/30 p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4 grid gap-3">
        {sources.map((source) => (
          <a
            key={source.id}
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="group flex items-start gap-3 rounded-lg border border-border bg-background p-4 outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
          >
            {source.role === "video" ? <FilmIcon className="mt-0.5 text-primary" aria-hidden="true" /> : <BookOpenIcon className="mt-0.5 text-primary" aria-hidden="true" />}
            <span className="min-w-0 flex-1">
              <span className="block font-medium group-hover:underline">{source.title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{source.qualityNotes}</span>
            </span>
            <ExternalLinkIcon className="mt-0.5 text-muted-foreground" aria-hidden="true" />
          </a>
        ))}
      </div>
    </section>
  );
}
