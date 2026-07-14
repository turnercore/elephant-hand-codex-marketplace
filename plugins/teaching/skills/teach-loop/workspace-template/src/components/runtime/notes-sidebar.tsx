import {
  ChevronRightIcon,
  MessageSquarePlusIcon,
  NotebookPenIcon,
  PanelRightCloseIcon,
  Trash2Icon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useEvidence } from "@/evidence/evidence-context";
import { useNotesPanel } from "./notes-panel-context";

function NotesEditor({ idPrefix, onCollapse }: { idPrefix: string; onCollapse?: () => void }) {
  const { anchor } = useNotesPanel();
  const { snapshot, addNote, updateNote, deleteNote } = useEvidence();
  const [draft, setDraft] = useState("");

  useEffect(() => setDraft(""), [anchor.id]);

  const sortedNotes = useMemo(
    () =>
      [...snapshot.notes].sort((a, b) => {
        const aCurrent = a.anchorId === anchor.id ? 1 : 0;
        const bCurrent = b.anchorId === anchor.id ? 1 : 0;
        return bCurrent - aCurrent || b.updatedAt.localeCompare(a.updatedAt);
      }),
    [anchor.id, snapshot.notes],
  );

  const saveDraft = () => {
    if (!draft.trim()) return;
    const note = addNote(anchor.id, anchor.label);
    updateNote(note.id, draft.trim());
    setDraft("");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <NotebookPenIcon className="text-primary" aria-hidden="true" />
            <h2 className="font-semibold">Lesson notes</h2>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Saved locally and included in the tutor return.
          </p>
        </div>
        {onCollapse ? (
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Collapse notes" onClick={onCollapse}>
            <PanelRightCloseIcon aria-hidden="true" />
          </Button>
        ) : null}
      </div>

      <div className="rounded-lg border border-border bg-muted/35 p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Current anchor</p>
        <p className="mt-1 truncate text-sm font-medium">{anchor.label ?? anchor.id}</p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-new-anchored-note`}>New note</Label>
        <Textarea
          id={`${idPrefix}-new-anchored-note`}
          value={draft}
          placeholder="What are you thinking, noticing, or questioning here?"
          onChange={(event) => setDraft(event.target.value)}
          className="min-h-28"
        />
        <Button type="button" onClick={saveDraft} disabled={!draft.trim()}>
          <MessageSquarePlusIcon data-icon="inline-start" aria-hidden="true" />
          Save anchored note
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <p className="mb-2 text-sm font-medium">Saved notes</p>
        <ScrollArea className="min-h-0 flex-1 pr-3">
          <div className="flex flex-col gap-3 pb-6">
            {sortedNotes.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
                Notes you write while learning will gather here.
              </div>
            ) : (
              sortedNotes.map((note) => (
                <div key={note.id} className="rounded-lg border border-border bg-card p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="truncate text-xs font-medium text-muted-foreground">
                      {note.anchorLabel ?? note.anchorId}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Delete note"
                      onClick={() => deleteNote(note.id)}
                    >
                      <Trash2Icon aria-hidden="true" />
                    </Button>
                  </div>
                  <Textarea
                    value={note.text}
                    aria-label={`Note about ${note.anchorLabel ?? note.anchorId}`}
                    onChange={(event) => updateNote(note.id, event.target.value)}
                  />
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export function DesktopNotesDock() {
  const { open, setOpen } = useNotesPanel();
  const { snapshot } = useEvidence();

  return (
    <aside
      className="sticky top-[4.25rem] hidden h-[calc(100dvh-4.25rem)] min-h-0 border-l border-border bg-background lg:flex"
      aria-label="Lesson notes"
      data-testid="desktop-notes-dock"
      data-state={open ? "open" : "collapsed"}
    >
      {open ? (
        <NotesEditor idPrefix="desktop" onCollapse={() => setOpen(false)} />
      ) : (
        <button
          type="button"
          className="flex h-full w-full flex-col items-center gap-3 px-2 py-5 text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          onClick={() => setOpen(true)}
          aria-label="Expand lesson notes"
        >
          <NotebookPenIcon aria-hidden="true" />
          <span className="[writing-mode:vertical-rl] text-xs font-semibold tracking-wide">Notes</span>
          {snapshot.notes.length > 0 ? (
            <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {snapshot.notes.length}
            </span>
          ) : null}
          <ChevronRightIcon className="mt-auto" aria-hidden="true" />
        </button>
      )}
    </aside>
  );
}

export function MobileNotesSheet() {
  const { open, setOpen } = useNotesPanel();
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && !window.matchMedia("(min-width: 1024px)").matches);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsMobile(!media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  if (!isMobile) return null;

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="flex flex-col gap-0 p-0">
          <div className="sr-only">
            <SheetTitle>Lesson notes</SheetTitle>
            <SheetDescription>Notes stay in this browser and are included in the return to your tutor.</SheetDescription>
          </div>
          <NotesEditor idPrefix="mobile" />
        </SheetContent>
      </Sheet>
    </div>
  );
}

/** Backward-compatible mobile sheet export for generated lessons that imported NotesSidebar directly. */
export const NotesSidebar = MobileNotesSheet;
