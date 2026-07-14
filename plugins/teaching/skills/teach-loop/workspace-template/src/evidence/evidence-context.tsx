import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { courseConfig } from "@/course/course.config";
import { makeId } from "@/lib/utils";
import { readJsonStorage, writeJsonStorage } from "@/lib/storage";
import type {
  EvidenceEvent,
  EvidenceEventType,
  EvidenceResponse,
  EvidenceSnapshot,
  LessonNote,
} from "./types";

interface SetResponseOptions {
  kind: string;
  correct?: boolean;
  confidence?: number;
  selfAssessment?: string;
  completed?: boolean;
  preserveOriginal?: boolean;
  metadata?: Record<string, unknown>;
  eventType?: EvidenceEventType;
}

interface EvidenceContextValue {
  snapshot: EvidenceSnapshot;
  setResponse: (componentId: string, value: unknown, options: SetResponseOptions) => void;
  addHint: (componentId: string, hintId: string) => void;
  markComplete: (componentId: string, metadata?: Record<string, unknown>) => void;
  recordEvent: (
    componentId: string,
    type: EvidenceEventType,
    payload?: Record<string, unknown>,
  ) => void;
  addNote: (anchorId: string, anchorLabel?: string) => LessonNote;
  updateNote: (noteId: string, text: string) => void;
  deleteNote: (noteId: string) => void;
  resetLessonEvidence: () => void;
}

const EvidenceContext = createContext<EvidenceContextValue | null>(null);

function emptySnapshot(lessonId: string): EvidenceSnapshot {
  return {
    schemaVersion: "1.0.0",
    lessonId,
    responses: {},
    notes: [],
    events: [],
    completedIds: [],
    updatedAt: new Date().toISOString(),
  };
}

function storageKey(lessonId: string): string {
  return `teach-loop:evidence:${courseConfig.id}:${lessonId}`;
}

export function EvidenceProvider({ lessonId, children }: { lessonId: string; children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<EvidenceSnapshot>(() =>
    readJsonStorage(storageKey(lessonId), emptySnapshot(lessonId)),
  );

  useEffect(() => {
    setSnapshot(readJsonStorage(storageKey(lessonId), emptySnapshot(lessonId)));
  }, [lessonId]);

  useEffect(() => {
    writeJsonStorage(storageKey(lessonId), snapshot);
  }, [lessonId, snapshot]);

  const appendEvent = useCallback(
    (
      current: EvidenceSnapshot,
      componentId: string,
      type: EvidenceEventType,
      payload: Record<string, unknown> = {},
    ): EvidenceSnapshot => {
      const timestamp = new Date().toISOString();
      const event: EvidenceEvent = {
        id: makeId("evidence"),
        lessonId,
        componentId,
        type,
        timestamp,
        payload,
      };
      return { ...current, events: [...current.events, event], updatedAt: timestamp };
    },
    [lessonId],
  );

  const recordEvent = useCallback(
    (componentId: string, type: EvidenceEventType, payload: Record<string, unknown> = {}) => {
      setSnapshot((current) => appendEvent(current, componentId, type, payload));
    },
    [appendEvent],
  );

  const setResponse = useCallback(
    (componentId: string, value: unknown, options: SetResponseOptions) => {
      setSnapshot((current) => {
        const timestamp = new Date().toISOString();
        const previous = current.responses[componentId];
        const attempts = (previous?.attempts ?? 0) + 1;
        const preserveOriginal = options.preserveOriginal ?? true;
        const response: EvidenceResponse = {
          componentId,
          kind: options.kind,
          value,
          originalValue:
            preserveOriginal && previous?.originalValue === undefined
              ? previous?.value ?? value
              : previous?.originalValue,
          revisedValue: previous ? value : undefined,
          correct: options.correct,
          attempts,
          hintsUsed: previous?.hintsUsed ?? [],
          confidence: options.confidence ?? previous?.confidence,
          selfAssessment: options.selfAssessment ?? previous?.selfAssessment,
          completed: options.completed ?? previous?.completed ?? false,
          updatedAt: timestamp,
          metadata: { ...previous?.metadata, ...options.metadata },
        };
        const completedIds = response.completed
          ? [...new Set([...current.completedIds, componentId])]
          : current.completedIds;
        const next = {
          ...current,
          responses: { ...current.responses, [componentId]: response },
          completedIds,
          updatedAt: timestamp,
        };
        return appendEvent(next, componentId, options.eventType ?? "response", {
          value,
          correct: options.correct,
          confidence: options.confidence,
          attempt: attempts,
        });
      });
    },
    [appendEvent],
  );

  const addHint = useCallback(
    (componentId: string, hintId: string) => {
      setSnapshot((current) => {
        const timestamp = new Date().toISOString();
        const previous = current.responses[componentId] ?? {
          componentId,
          kind: "checkpoint",
          value: "",
          attempts: 0,
          hintsUsed: [],
          completed: false,
          updatedAt: timestamp,
        };
        const hintsUsed = [...new Set([...previous.hintsUsed, hintId])];
        const next = {
          ...current,
          responses: {
            ...current.responses,
            [componentId]: { ...previous, hintsUsed, updatedAt: timestamp },
          },
          updatedAt: timestamp,
        };
        return appendEvent(next, componentId, "hint", { hintId, count: hintsUsed.length });
      });
    },
    [appendEvent],
  );

  const markComplete = useCallback(
    (componentId: string, metadata: Record<string, unknown> = {}) => {
      setSnapshot((current) => {
        const timestamp = new Date().toISOString();
        const completedIds = [...new Set([...current.completedIds, componentId])];
        const previous = current.responses[componentId];
        const responses = previous
          ? {
              ...current.responses,
              [componentId]: {
                ...previous,
                completed: true,
                updatedAt: timestamp,
                metadata: { ...previous.metadata, ...metadata },
              },
            }
          : current.responses;
        return appendEvent(
          { ...current, completedIds, responses, updatedAt: timestamp },
          componentId,
          "completion",
          metadata,
        );
      });
    },
    [appendEvent],
  );

  const addNote = useCallback((anchorId: string, anchorLabel?: string) => {
    const timestamp = new Date().toISOString();
    const note: LessonNote = {
      id: makeId("note"),
      anchorId,
      anchorLabel,
      text: "",
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setSnapshot((current) => ({
      ...current,
      notes: [...current.notes, note],
      updatedAt: timestamp,
      events: [
        ...current.events,
        {
          id: makeId("evidence"),
          lessonId,
          componentId: anchorId,
          type: "note",
          timestamp,
          payload: { noteId: note.id, action: "created" },
        },
      ],
    }));
    return note;
  }, [lessonId]);

  const updateNote = useCallback((noteId: string, text: string) => {
    const timestamp = new Date().toISOString();
    setSnapshot((current) => ({
      ...current,
      notes: current.notes.map((note) =>
        note.id === noteId ? { ...note, text, updatedAt: timestamp } : note,
      ),
      updatedAt: timestamp,
    }));
  }, []);

  const deleteNote = useCallback((noteId: string) => {
    const timestamp = new Date().toISOString();
    setSnapshot((current) => ({
      ...current,
      notes: current.notes.filter((note) => note.id !== noteId),
      updatedAt: timestamp,
    }));
  }, []);

  const resetLessonEvidence = useCallback(() => {
    const next = emptySnapshot(lessonId);
    setSnapshot(next);
    writeJsonStorage(storageKey(lessonId), next);
  }, [lessonId]);

  const value = useMemo<EvidenceContextValue>(
    () => ({
      snapshot,
      setResponse,
      addHint,
      markComplete,
      recordEvent,
      addNote,
      updateNote,
      deleteNote,
      resetLessonEvidence,
    }),
    [
      addHint,
      addNote,
      deleteNote,
      markComplete,
      recordEvent,
      resetLessonEvidence,
      setResponse,
      snapshot,
      updateNote,
    ],
  );

  return <EvidenceContext.Provider value={value}>{children}</EvidenceContext.Provider>;
}

export function useEvidence(): EvidenceContextValue {
  const value = useContext(EvidenceContext);
  if (!value) throw new Error("useEvidence must be used inside EvidenceProvider.");
  return value;
}
