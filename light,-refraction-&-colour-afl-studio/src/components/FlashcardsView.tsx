import React from 'react';
import { FLASHCARDS, type FlashcardTopic } from '../data/curriculum';

export type FlashcardFilter = 'all' | FlashcardTopic;

interface FlashcardsViewProps {
  filter: FlashcardFilter;
  deckOrder: number[];
  cardIndex: number;
  flipped: boolean;
  masteredIds: number[];
  roomConnected: boolean;
  onChangeFilter: (f: FlashcardFilter) => void;
  onFlip: () => void;
  onPrev: () => void;
  onNext: () => void;
  onShuffle: () => void;
  onMarkMastered: (id: number, mastered: boolean) => void;
  onSyncCard: (globalCardId: number) => void;
}

const TOPIC_LABELS: Record<FlashcardTopic, string> = {
  refraction: 'Refraction Fundamentals',
  lenses: 'Lenses & Real-World',
  'prism-rgb': 'Prism & RGB Light',
  filters: 'Optical Filters & Appearance',
};

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  filter,
  deckOrder,
  cardIndex,
  flipped,
  masteredIds,
  roomConnected,
  onChangeFilter,
  onFlip,
  onPrev,
  onNext,
  onShuffle,
  onMarkMastered,
  onSyncCard,
}) => {
  const orderedCards = deckOrder
    .map((id) => FLASHCARDS.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const deck = filter === 'all' ? orderedCards : orderedCards.filter((c) => c.topic === filter);
  const safeIdx = deck.length > 0 ? Math.min(cardIndex, deck.length - 1) : 0;
  const current = deck[safeIdx];
  const isMastered = current ? masteredIds.includes(current.id) : false;
  const pct = Math.round((masteredIds.length / FLASHCARDS.length) * 100);

  return (
    <section className="rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container)] p-5 md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="font-mono-label text-xs uppercase tracking-wider text-[var(--tertiary)]">
            Active Recall Deck · {FLASHCARDS.length} Curriculum Cards
          </div>
          <h2 className="font-headline text-2xl font-medium text-[var(--on-surface)]">
            Key Definitions, Laws &amp; Applications
          </h2>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter flashcards by topic">
          {[
            { id: 'all' as const, label: `All (${FLASHCARDS.length})` },
            { id: 'refraction' as const, label: 'Refraction (10)' },
            { id: 'lenses' as const, label: 'Lenses & Mirages (10)' },
            { id: 'prism-rgb' as const, label: 'Prism & RGB (10)' },
            { id: 'filters' as const, label: 'Filters (10)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeFilter(tab.id)}
              className={`font-mono-label min-h-[40px] whitespace-nowrap rounded border px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${
                filter === tab.id
                  ? 'border-[var(--primary)] bg-[var(--primary-container)] text-[var(--primary)]'
                  : 'border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {current && (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="grid gap-4">
            <button
              type="button"
              id="flashcard-surface"
              onClick={onFlip}
              className={`flex min-h-[290px] w-full cursor-pointer flex-col justify-between gap-4 rounded-md border p-6 text-left transition-colors ${
                flipped
                  ? 'border-[var(--tertiary)] bg-[var(--background)]'
                  : 'border-[var(--outline)] bg-[var(--surface-container-low)] hover:border-[var(--primary)] hover:bg-[var(--surface-container-high)]'
              }`}
            >
              <div className="flex w-full items-center justify-between gap-2 text-xs">
                <span className="font-mono-label uppercase tracking-wider text-[var(--tertiary)]">
                  {TOPIC_LABELS[current.topic]}
                  {isMastered ? ' · Mastered' : ''}
                </span>
                <span className="font-mono-label text-[var(--on-surface-variant)]">
                  Card {safeIdx + 1} / {deck.length}
                </span>
              </div>

              <div>
                <div className="font-mono-label mb-2 text-xs uppercase tracking-wider text-[var(--primary)]">
                  {flipped ? 'Explanation — Click to Return' : 'Term / Question — Click to Flip'}
                </div>
                {flipped ? (
                  <p className="text-lg leading-relaxed text-[var(--on-surface)]">{current.def}</p>
                ) : (
                  <p className="font-headline text-2xl leading-snug text-[var(--on-surface)] md:text-3xl">
                    {current.term}
                  </p>
                )}
              </div>

              <div className="text-xs text-[var(--on-surface-variant)]">
                {flipped ? 'Rate your recall confidence below.' : 'Say the full explanation aloud before flipping.'}
              </div>
            </button>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onPrev}
                  className="font-mono-label min-h-[44px] rounded border border-[var(--outline)] px-4 py-2 text-xs uppercase tracking-wider text-[var(--on-surface)] hover:border-[var(--tertiary)]"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={onFlip}
                  className="font-mono-label min-h-[44px] rounded border border-[var(--primary)] bg-[var(--primary)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--on-primary)]"
                >
                  Flip Card
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  className="font-mono-label min-h-[44px] rounded border border-[var(--outline)] px-4 py-2 text-xs uppercase tracking-wider text-[var(--on-surface)] hover:border-[var(--tertiary)]"
                >
                  Next
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onMarkMastered(current.id, false)}
                  className="font-mono-label min-h-[44px] rounded border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-3 py-2 text-xs uppercase tracking-wider text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
                >
                  Needs Review
                </button>
                <button
                  type="button"
                  onClick={() => onMarkMastered(current.id, true)}
                  className="font-mono-label min-h-[44px] rounded border border-[var(--positive)] bg-[rgba(82,209,156,0.12)] px-3 py-2 text-xs uppercase tracking-wider text-[var(--positive)] hover:bg-[rgba(82,209,156,0.2)]"
                >
                  Mark Mastered
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 rounded border border-[var(--outline-variant)] bg-[var(--background)] p-4">
            <div>
              <div className="font-mono-label text-xs uppercase tracking-wider text-[var(--tertiary)]">Deck Progress</div>
              <div className="font-headline mt-1 text-3xl text-[var(--on-surface)]">
                {masteredIds.length} / {FLASHCARDS.length} Mastered
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full border border-[var(--outline-variant)] bg-[var(--surface-container-low)]">
                <div
                  className="h-full bg-[var(--primary)] transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <div className="rounded border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-3 text-sm text-[var(--on-surface-variant)]">
              <strong className="text-[var(--on-surface)]">Partner Recall Tip:</strong> When in a Live Room, click{' '}
              <strong className="text-[var(--on-surface)]">Sync Card to Room</strong> so your partner sees the exact same flashcard to test each other verbally.
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onShuffle}
                className="font-mono-label min-h-[44px] rounded border border-[var(--outline)] px-4 py-2 text-xs uppercase tracking-wider text-[var(--on-surface)] hover:border-[var(--primary)]"
              >
                Shuffle Deck Order
              </button>
              <button
                type="button"
                disabled={!roomConnected}
                onClick={() => onSyncCard(current.id)}
                className="font-mono-label min-h-[44px] rounded border border-[var(--outline-variant)] bg-[var(--surface-container)] px-4 py-2 text-xs uppercase tracking-wider text-[var(--on-surface)] hover:border-[var(--tertiary)] disabled:opacity-45"
              >
                Sync Card to Room
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
