import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface NoteAnchor {
  id: string;
  label?: string;
}

interface NotesPanelContextValue {
  open: boolean;
  anchor: NoteAnchor;
  openNotes: (anchor?: Partial<NoteAnchor>) => void;
  closeNotes: () => void;
  setOpen: (open: boolean) => void;
}

const NotesPanelContext = createContext<NotesPanelContextValue | null>(null);

export function NotesPanelProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<NoteAnchor>({ id: "lesson", label: "Whole lesson" });

  const openNotes = useCallback((next?: Partial<NoteAnchor>) => {
    setAnchor({ id: next?.id ?? "lesson", label: next?.label ?? "Whole lesson" });
    setOpen(true);
  }, []);
  const closeNotes = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ open, anchor, openNotes, closeNotes, setOpen }),
    [anchor, closeNotes, open, openNotes],
  );

  return <NotesPanelContext.Provider value={value}>{children}</NotesPanelContext.Provider>;
}

export function useNotesPanel(): NotesPanelContextValue {
  const value = useContext(NotesPanelContext);
  if (!value) throw new Error("useNotesPanel must be used inside NotesPanelProvider.");
  return value;
}
