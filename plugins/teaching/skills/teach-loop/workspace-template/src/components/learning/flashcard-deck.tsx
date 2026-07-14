import { Layers3Icon, RotateCcwIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useEvidence } from "@/evidence/evidence-context";
import { LearningCard } from "./learning-card";

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface FlashcardDeckProps {
  id: string;
  title?: string;
  description?: string;
  cards: Flashcard[];
}

export function FlashcardDeck({
  id,
  title = "Retrieval deck",
  description = "Answer from memory before revealing the back.",
  cards,
}: FlashcardDeckProps) {
  const { setResponse, markComplete } = useEvidence();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [rated, setRated] = useState<Record<string, string>>({});
  const card = cards[index];
  const completed = Object.keys(rated).length;
  const progress = cards.length > 0 ? (completed / cards.length) * 100 : 0;

  const footer = useMemo(() => {
    if (!card) return null;
    return revealed ? (
      <div className="flex flex-wrap gap-2">
        {[
          ["again", "Again"],
          ["effortful", "Got it, effortful"],
          ["easy", "Got it, easy"],
        ].map(([value, label]) => (
          <Button
            key={value}
            type="button"
            variant={value === "again" ? "outline" : "secondary"}
            onClick={() => {
              const nextRated = { ...rated, [card.id]: value };
              setRated(nextRated);
              setResponse(`${id}:${card.id}`, value, {
                kind: "flashcard",
                completed: true,
                metadata: { front: card.front, back: card.back, rating: value },
                preserveOriginal: false,
              });
              if (Object.keys(nextRated).length === cards.length) markComplete(id, { cardsRated: cards.length });
              setIndex((current) => (current + 1) % cards.length);
              setRevealed(false);
            }}
          >
            {label}
          </Button>
        ))}
      </div>
    ) : (
      <Button type="button" onClick={() => setRevealed(true)}>
        Reveal answer
      </Button>
    );
  }, [card, cards.length, id, markComplete, rated, revealed, setResponse]);

  if (!card) return null;

  return (
    <LearningCard id={id} title={title} description={description} icon={<Layers3Icon aria-hidden="true" />} footer={footer}>
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>Card {index + 1} of {cards.length}</span>
        <span>{completed} rated</span>
      </div>
      <Progress value={progress} aria-label={`${Math.round(progress)} percent complete`} />
      <button
        type="button"
        className="min-h-48 rounded-xl border border-border bg-muted/35 p-6 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => setRevealed((value) => !value)}
        aria-label={revealed ? "Show flashcard question" : "Reveal flashcard answer"}
      >
        <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          {revealed ? "Answer" : "Recall"}
        </span>
        <span className="block text-xl font-semibold leading-relaxed">
          {revealed ? card.back : card.front}
        </span>
      </button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          setIndex(0);
          setRevealed(false);
          setRated({});
        }}
      >
        <RotateCcwIcon data-icon="inline-start" aria-hidden="true" />
        Restart deck
      </Button>
    </LearningCard>
  );
}
