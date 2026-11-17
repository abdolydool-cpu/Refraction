import React, { useEffect, useState } from 'react';
import { MOCK_AFL_PAPERS, QUIZ_BANK, type QuestionTopic, type QuizQuestion } from '../data/curriculum';
import { formatTimerSeconds, gradeBand, shuffleArray } from '../utils/scoring';
import { QuizDiagram } from './QuizDiagram';
import type { RoomPeer, RoomRaceState } from '../shared/protocol';

interface QuizViewProps {
  roomConnected: boolean;
  roomRace: RoomRaceState | null;
  roomPeers: RoomPeer[];
  selfPeerId: string | null;
  onRecordGlobalAnswer: (isCorrect: boolean) => void;
  onReportRaceProgress: (score: number, answered: number, total: number, streak: number, finished: boolean) => void;
  onResetAllProgress: () => void;
}

const TOPIC_NAMES: Record<QuestionTopic, string> = {
  refraction: 'Refraction Basics',
  lenses: 'Lenses & Real-World',
  'prism-rgb': 'Prism & RGB',
  filters: 'Optical Filters',
};

export const QuizView: React.FC<QuizViewProps> = ({
  roomConnected,
  roomRace,
  roomPeers,
  selfPeerId,
  onRecordGlobalAnswer,
  onReportRaceProgress,
  onResetAllProgress,
}) => {
  const [activePresetLabel, setActivePresetLabel] = useState('Quick 10 Mixed');
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => shuffleArray(QUIZ_BANK).slice(0, 10));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [missedIds, setMissedIds] = useState<string[]>([]);
  const [topicTallies, setTopicTallies] = useState<Record<string, { ok: number; total: number }>>({});
  const [finished, setFinished] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // Sync incoming multiplayer race from room
  useEffect(() => {
    if (!roomRace) return;
    const mapped = roomRace.questionIds
      .map((id) => QUIZ_BANK.find((q) => q.id === id))
      .filter((q): q is QuizQuestion => Boolean(q));
    if (mapped.length === 0) return;
    setActivePresetLabel(`Room Race · ${roomRace.title}`);
    setQuestions(mapped);
    setIdx(0);
    setScore(0);
    setStreak(0);
    setSelectedOpt(null);
    setMissedIds([]);
    setTopicTallies({});
    setFinished(false);
    setSecondsLeft(roomRace.timedSeconds);
  }, [roomRace?.raceId]);

  // Countdown timer for Mock AFL Papers
  useEffect(() => {
    if (secondsLeft === null || finished) return;
    if (secondsLeft <= 0) {
      setFinished(true);
      if (roomConnected) {
        onReportRaceProgress(score, questions.length, questions.length, streak, true);
      }
      return;
    }
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft, finished, roomConnected, score, questions.length, streak, onReportRaceProgress]);

  const startSession = (label: string, qs: QuizQuestion[], timedSec: number | null) => {
    setActivePresetLabel(label);
    setQuestions(qs);
    setIdx(0);
    setScore(0);
    setStreak(0);
    setSelectedOpt(null);
    setMissedIds([]);
    setTopicTallies({});
    setFinished(false);
    setSecondsLeft(timedSec);
  };

  const startTopicDrill = (topic: QuestionTopic) => {
    const qs = shuffleArray(QUIZ_BANK.filter((q) => q.topic === topic));
    startSession(`${TOPIC_NAMES[topic]} (${qs.length} Qs)`, qs, null);
  };

  const startMockPaper = (presetId: string) => {
    const preset = MOCK_AFL_PAPERS.find((p) => p.id === presetId);
    if (!preset) return;
    const qs =
      preset.questionIds.length > 0
        ? preset.questionIds
            .map((id) => QUIZ_BANK.find((q) => q.id === id))
            .filter((q): q is QuizQuestion => Boolean(q))
        : shuffleArray(QUIZ_BANK).slice(0, 10);
    startSession(preset.label, qs, preset.timedSeconds);
  };

  const currentQ = questions[idx];

  const handleSelectOption = (optIdx: number) => {
    if (selectedOpt !== null || !currentQ || finished) return;
    setSelectedOpt(optIdx);
    const isCorrect = optIdx === currentQ.ans;
    const nextScore = isCorrect ? score + 1 : score;
    const nextStreak = isCorrect ? streak + 1 : 0;

    setScore(nextScore);
    setStreak(nextStreak);
    if (!isCorrect) {
      setMissedIds((prev) => [...prev, currentQ.id]);
    }
    setTopicTallies((prev) => {
      const cur = prev[currentQ.topic] || { ok: 0, total: 0 };
      return {
        ...prev,
        [currentQ.topic]: {
          ok: cur.ok + (isCorrect ? 1 : 0),
          total: cur.total + 1,
        },
      };
    });

    onRecordGlobalAnswer(isCorrect);

    if (roomConnected) {
      const isLast = idx + 1 >= questions.length;
      onReportRaceProgress(nextScore, idx + 1, questions.length, nextStreak, isLast);
    }
  };

  const handleNext = () => {
    if (idx + 1 >= questions.length) {
      setFinished(true);
      if (roomConnected) {
        onReportRaceProgress(score, questions.length, questions.length, streak, true);
      }
    } else {
      setIdx((i) => i + 1);
      setSelectedOpt(null);
    }
  };

  const handleRetryMissed = () => {
    const missedQs = missedIds
      .map((id) => QUIZ_BANK.find((q) => q.id === id))
      .filter((q): q is QuizQuestion => Boolean(q));
    if (missedQs.length === 0) return;
    startSession(`Missed Review (${missedQs.length} Qs)`, missedQs, null);
  };

  const handleConfirmReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setConfirmReset(false);
    onResetAllProgress();
  };

  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const band = gradeBand(pct);
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <section className="grid gap-6">
      <div className="rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container)] p-5 md:p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="font-mono-label text-xs uppercase tracking-wider text-[var(--tertiary)]">
              AFL Assessment Simulator · {QUIZ_BANK.length} Question Bank
            </div>
            <h2 className="font-headline text-2xl font-medium text-[var(--on-surface)]">
              Topic Drills &amp; Timed Mock AFL Papers
            </h2>
          </div>

          {secondsLeft !== null && !finished && (
            <div className="font-mono-label rounded border border-[var(--primary)] bg-[var(--primary-container)] px-3 py-1.5 text-sm font-semibold text-[var(--primary)]">
              Timer: {formatTimerSeconds(secondsLeft)}
            </div>
          )}
        </div>

        {/* Mock AFL Papers & Topic Drills Selector */}
        <div className="mb-5 grid gap-2 border-b border-[var(--outline-variant)] pb-5">
          <div className="flex flex-wrap gap-2">
            {MOCK_AFL_PAPERS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => startMockPaper(p.id)}
                className={`font-mono-label min-h-[42px] whitespace-nowrap rounded border px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${
                  activePresetLabel === p.label || activePresetLabel === `Room Race · ${p.label}`
                    ? 'border-[var(--primary)] bg-[var(--primary-container)] text-[var(--primary)]'
                    : 'border-[var(--outline)] bg-[var(--surface-container-low)] text-[var(--on-surface)] hover:border-[var(--primary)]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {(['refraction', 'lenses', 'prism-rgb', 'filters'] as QuestionTopic[]).map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => startTopicDrill(topic)}
                className={`font-mono-label min-h-[38px] whitespace-nowrap rounded border px-3 py-1 text-xs uppercase tracking-wider transition-colors ${
                  activePresetLabel.startsWith(TOPIC_NAMES[topic])
                    ? 'border-[var(--tertiary)] bg-[rgba(124,196,232,0.14)] text-[var(--tertiary)]'
                    : 'border-[var(--outline-variant)] bg-[var(--background)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
                }`}
              >
                {TOPIC_NAMES[topic]} (15)
              </button>
            ))}
          </div>
        </div>

        {/* Live Telemetry Strip */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="font-mono-label flex flex-wrap items-center gap-3 uppercase tracking-wider">
            <span className="text-[var(--primary)]">{activePresetLabel}</span>
            <span className="text-[var(--on-surface-variant)]">·</span>
            <span className="text-[var(--on-surface)]">
              Question {Math.min(idx + 1, questions.length)} / {questions.length}
            </span>
            {currentQ && !finished && (
              <>
                <span className="text-[var(--on-surface-variant)]">·</span>
                <span className="text-[var(--tertiary)]">
                  {TOPIC_NAMES[currentQ.topic]} ({currentQ.difficulty})
                </span>
              </>
            )}
          </div>
          <div className="font-mono-label text-[var(--on-surface)]">
            Score: {score} / {finished ? questions.length : idx + (selectedOpt !== null ? 1 : 0)} · Streak: {streak}
          </div>
        </div>

        <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full border border-[var(--outline-variant)] bg-[var(--background)]">
          <div
            className="h-full bg-[var(--primary)] transition-all"
            style={{ width: `${Math.round(((finished ? questions.length : idx + 1) / questions.length) * 100)}%` }}
          />
        </div>

        {/* Active Question or Final Report */}
        {!finished && currentQ ? (
          <div className="grid gap-4 rounded border border-[var(--outline-variant)] bg-[var(--background)] p-5">
            <h3 className="font-headline text-xl leading-snug text-[var(--on-surface)] md:text-2xl">
              {currentQ.q}
            </h3>

            {currentQ.diagram && <QuizDiagram diagram={currentQ.diagram} />}

            <div className="grid gap-2.5">
              {currentQ.opts.map((opt, oIdx) => {
                const isSelected = selectedOpt === oIdx;
                const isCorrect = oIdx === currentQ.ans;
                let cls =
                  'border-[var(--outline)] bg-[var(--surface-container-low)] hover:border-[var(--primary)] hover:bg-[var(--surface-container-high)]';
                if (selectedOpt !== null) {
                  if (isCorrect) cls = 'border-[var(--positive)] bg-[rgba(82,209,156,0.14)]';
                  else if (isSelected) cls = 'border-[var(--error)] bg-[rgba(242,116,116,0.14)]';
                  else cls = 'border-[var(--outline-variant)] bg-[var(--surface-container-low)] opacity-70';
                }

                return (
                  <button
                    key={oIdx}
                    type="button"
                    disabled={selectedOpt !== null}
                    onClick={() => handleSelectOption(oIdx)}
                    className={`flex min-h-[48px] w-full items-center gap-3 rounded border px-4 py-2.5 text-left text-sm text-[var(--on-surface)] transition-colors ${cls}`}
                  >
                    <span className="font-mono-label rounded border border-[var(--outline-variant)] px-2 py-0.5 text-xs font-semibold text-[var(--primary)]">
                      {letters[oIdx]}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {selectedOpt !== null && (
              <div
                className={`rounded border p-3.5 text-sm ${
                  selectedOpt === currentQ.ans
                    ? 'border-[var(--positive)] bg-[rgba(82,209,156,0.08)]'
                    : 'border-[var(--error)] bg-[rgba(242,116,116,0.08)]'
                }`}
              >
                <strong className={selectedOpt === currentQ.ans ? 'text-[var(--positive)]' : 'text-[var(--error)]'}>
                  {selectedOpt === currentQ.ans ? 'Correct.' : 'Review needed.'}
                </strong>{' '}
                <span className="text-[var(--on-surface)]">{currentQ.exp}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className="text-xs text-[var(--on-surface-variant)]">
                {roomConnected
                  ? `Connected to Live Room — progress updates the leaderboard automatically.`
                  : 'Answer to reveal the curriculum explanation immediately.'}
              </span>
              {selectedOpt !== null && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="font-mono-label min-h-[44px] rounded border border-[var(--primary)] bg-[var(--primary)] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--on-primary)]"
                >
                  {idx + 1 >= questions.length ? 'View AFL Report' : 'Next Question'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-5 rounded border border-[var(--outline-variant)] bg-[var(--background)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="font-mono-label text-xs uppercase tracking-wider text-[var(--tertiary)]">
                  Assessment Complete · {band.label}
                </div>
                <div className="font-headline mt-1 text-3xl text-[var(--on-surface)]">
                  {score} / {questions.length} ({pct}%)
                </div>
                <p className="mt-1 text-sm text-[var(--on-surface-variant)]">{band.summary}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => startSession(activePresetLabel, shuffleArray(questions), secondsLeft !== null ? 15 * 60 : null)}
                  className="font-mono-label min-h-[44px] rounded border border-[var(--primary)] bg-[var(--primary)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--on-primary)]"
                >
                  Practice Again
                </button>
                {missedIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleRetryMissed}
                    className="font-mono-label min-h-[44px] rounded border border-[var(--outline)] px-4 py-2 text-xs uppercase tracking-wider text-[var(--on-surface)] hover:border-[var(--tertiary)]"
                  >
                    Retry Missed ({missedIds.length})
                  </button>
                )}
              </div>
            </div>

            {/* Topic Breakdown */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {(Object.keys(TOPIC_NAMES) as QuestionTopic[]).map((t) => {
                const stat = topicTallies[t];
                if (!stat) return null;
                return (
                  <div key={t} className="rounded border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-3">
                    <div className="font-mono-label text-xs uppercase text-[var(--tertiary)]">{TOPIC_NAMES[t]}</div>
                    <div className="font-mono-label mt-1 text-lg font-semibold text-[var(--on-surface)]">
                      {stat.ok} / {stat.total} ({Math.round((stat.ok / stat.total) * 100)}%)
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Room Race Podium when connected */}
            {roomConnected && roomPeers.length > 0 && (
              <div className="rounded border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4">
                <div className="font-mono-label mb-2 text-xs uppercase tracking-wider text-[var(--primary)]">
                  Room Race Standings
                </div>
                <div className="space-y-1.5 text-sm">
                  {[...roomPeers]
                    .sort((a, b) => b.quizScore - a.quizScore)
                    .map((p, i) => (
                      <div key={p.id} className="flex justify-between">
                        <span>
                          #{i + 1} {p.callsign} {p.id === selfPeerId ? '(You)' : ''}
                        </span>
                        <span className="font-mono-label text-[var(--on-surface-variant)]">
                          {p.quizScore} / {p.quizTotal || questions.length}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Missed Questions Review */}
            {missedIds.length > 0 && (
              <div className="grid gap-2.5">
                <div className="font-mono-label text-xs uppercase tracking-wider text-[var(--error)]">
                  Questions to Review
                </div>
                {missedIds.map((mid) => {
                  const q = QUIZ_BANK.find((item) => item.id === mid);
                  if (!q) return null;
                  return (
                    <div key={mid} className="rounded border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-3 text-sm">
                      <div className="font-medium text-[var(--on-surface)]">{q.q}</div>
                      <div className="mt-1 text-xs text-[var(--on-surface-variant)]">
                        <strong className="text-[var(--positive)]">Answer: {q.opts[q.ans]}</strong> — {q.exp}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleConfirmReset}
            className="font-mono-label min-h-[40px] rounded border border-[var(--outline-variant)] px-3 py-1.5 text-xs uppercase tracking-wider text-[var(--on-surface-variant)] hover:border-[var(--error)] hover:text-[var(--error)]"
          >
            {confirmReset ? 'Click Again to Confirm Reset' : 'Reset Saved Progress'}
          </button>
        </div>
      </div>
    </section>
  );
};
