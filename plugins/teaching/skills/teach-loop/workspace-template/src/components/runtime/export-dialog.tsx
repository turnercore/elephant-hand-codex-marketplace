import { ClipboardCheckIcon, CopyIcon, DownloadIcon, SendIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { LessonDefinition } from "@/course/types";
import { useEvidence } from "@/evidence/evidence-context";
import { buildReturnPacket, returnPacketToMarkdown } from "@/evidence/export";
import type { LearnerReflection } from "@/evidence/types";
import { copyText, downloadText } from "@/lib/download";
import { useTheme } from "@/themes/theme-provider";

const initialReflection: LearnerReflection = {
  understood: "",
  unresolved: "",
  questions: "",
  difficulty: "not_sure",
  helpful: "",
  nextPreference: "",
};

export function ExportDialog({ lesson, compact = false }: { lesson: LessonDefinition; compact?: boolean }) {
  const { snapshot } = useEvidence();
  const theme = useTheme();
  const [reflection, setReflection] = useState<LearnerReflection>(initialReflection);
  const [status, setStatus] = useState("");

  const packet = useMemo(
    () =>
      buildReturnPacket(lesson, snapshot, reflection, {
        mode: theme.mode,
        preset: theme.preset,
        customEnabled: theme.customEnabled,
        custom: theme.custom,
        learnerSelected: theme.learnerSelected,
        resolvedMode: theme.resolvedMode,
      }),
    [lesson, reflection, snapshot, theme.custom, theme.customEnabled, theme.learnerSelected, theme.mode, theme.preset, theme.resolvedMode],
  );
  const markdown = useMemo(() => returnPacketToMarkdown(packet), [packet]);
  const json = useMemo(() => JSON.stringify(packet, null, 2), [packet]);

  const update = <K extends keyof LearnerReflection>(key: K, value: LearnerReflection[K]) =>
    setReflection((current) => ({ ...current, [key]: value }));

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size={compact ? "icon" : "default"} aria-label={compact ? "Return lesson evidence to tutor" : undefined}>
          <SendIcon data-icon={compact ? undefined : "inline-start"} aria-hidden="true" />
          {compact ? null : "Return to tutor"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl overflow-hidden p-0">
        <div className="flex max-h-[88dvh] min-h-0 flex-col">
          <DialogHeader className="shrink-0 border-b border-border px-6 py-5 pr-14">
            <DialogTitle>Return this lesson to your tutor</DialogTitle>
            <DialogDescription>
              Add the pieces only you can supply. Your responses, hints, notes, and interaction evidence are already included.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5" data-testid="export-dialog-scroll-region">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="reflection-understood">What do you understand now?</Label>
                <Textarea
                  id="reflection-understood"
                  value={reflection.understood}
                  onChange={(event) => update("understood", event.target.value)}
                  placeholder="Explain the model or skill in your own words…"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="reflection-unresolved">What still feels unresolved?</Label>
                <Textarea
                  id="reflection-unresolved"
                  value={reflection.unresolved}
                  onChange={(event) => update("unresolved", event.target.value)}
                  placeholder="Name the exact step, term, or contradiction…"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="reflection-questions">Questions for the tutor</Label>
                <Textarea
                  id="reflection-questions"
                  value={reflection.questions}
                  onChange={(event) => update("questions", event.target.value)}
                  placeholder="What should you discuss together?"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="reflection-helpful">What helped or got in the way?</Label>
                <Textarea
                  id="reflection-helpful"
                  value={reflection.helpful}
                  onChange={(event) => update("helpful", event.target.value)}
                  placeholder="Visuals, pacing, examples, wording, interface, difficulty…"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="reflection-difficulty">Overall difficulty</Label>
                <select
                  id="reflection-difficulty"
                  value={reflection.difficulty}
                  onChange={(event) => update("difficulty", event.target.value as LearnerReflection["difficulty"])}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="not_sure">Not sure</option>
                  <option value="too_easy">Too easy</option>
                  <option value="about_right">About right</option>
                  <option value="too_hard">Too hard</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="reflection-next">What would you like next?</Label>
                <Textarea
                  id="reflection-next"
                  value={reflection.nextPreference}
                  onChange={(event) => update("nextPreference", event.target.value)}
                  placeholder="Another example, direct explanation, practice, a new angle, or a pause…"
                  className="min-h-10"
                />
              </div>
            </div>

            <Tabs defaultValue="markdown" className="mt-5">
              <TabsList>
                <TabsTrigger value="markdown">Tutor prompt</TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
              </TabsList>
              <TabsContent value="markdown">
                <Textarea readOnly value={markdown} className="min-h-72 font-mono text-xs" aria-label="Markdown tutor return" />
              </TabsContent>
              <TabsContent value="json">
                <Textarea readOnly value={json} className="min-h-72 font-mono text-xs" aria-label="JSON tutor return" />
              </TabsContent>
            </Tabs>
          </div>

          <div className="shrink-0 border-t border-border bg-background px-6 py-4" data-testid="export-dialog-actions">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-h-5">
                {status ? (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
                    <ClipboardCheckIcon aria-hidden="true" />
                    {status}
                  </p>
                ) : null}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  onClick={async () => setStatus((await copyText(markdown)) ? "Tutor prompt copied." : "Copy failed. Download the Markdown file instead.")}
                >
                  <CopyIcon data-icon="inline-start" aria-hidden="true" />
                  Copy tutor prompt
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => downloadText(`${lesson.id}-return.md`, markdown, "text/markdown;charset=utf-8")}
                >
                  <DownloadIcon data-icon="inline-start" aria-hidden="true" />
                  Markdown
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => downloadText(`${lesson.id}-return.json`, json, "application/json;charset=utf-8")}
                >
                  <DownloadIcon data-icon="inline-start" aria-hidden="true" />
                  JSON
                </Button>
              </DialogFooter>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
