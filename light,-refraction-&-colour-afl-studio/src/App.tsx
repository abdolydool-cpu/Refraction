import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FLASHCARDS, MOCK_AFL_PAPERS, QUIZ_BANK } from './data/curriculum';
import type {
  AppTabMode,
  ClientWsMessage,
  RoomSnapshot,
  ServerWsMessage,
  SyncedLabState,
} from './shared/protocol';
import { computeMasteryPct, normalizeRoomCode, shuffleArray } from './utils/scoring';
import { MultiplayerBar } from './components/MultiplayerBar';
import { OpticalLabsView } from './components/OpticalLabsView';
import { FlashcardsView, type FlashcardFilter } from './components/FlashcardsView';
import { ChallengesView } from './components/ChallengesView';
import { QuizView } from './components/QuizView';

const STORAGE_KEY = 'optics_afl_studio_v2';

interface PersistedProgress {
  callsign: string;
  roomCode: string;
  activeTab: AppTabMode;
  lab: SyncedLabState;
  masteredIds: number[];
  matrixAnswers: Record<string, string>;
  densityAnswers: Record<string, { speed: string; bend: string }>;
  rayPathAnswers: Record<string, string>;
  stackedAnswers: Record<string, string>;
  phenomenaAnswers: Record<string, string>;
  quizTotalAnswered: number;
  quizTotalCorrect: number;
}

const DEFAULT_LAB: SyncedLabState = {
  refLabMode: 'boundary',
  lensKind: 'convex',
  boundaryPreset: 'air-glass',
  incAngle: 45,
  showWavefronts: true,
  lensFocal: 180,
  colorLabMode: 'prism',
  prismBeam: 'white',
  rgbR: true,
  rgbG: true,
  rgbB: true,
  filter1: 'red',
  filter2: 'none',
};

const DEFAULT_PROGRESS: PersistedProgress = {
  callsign: 'Explorer 1',
  roomCode: '42',
  activeTab: 'labs',
  lab: DEFAULT_LAB,
  masteredIds: [],
  matrixAnswers: {},
  densityAnswers: {},
  rayPathAnswers: {},
  stackedAnswers: {},
  phenomenaAnswers: {},
  quizTotalAnswered: 0,
  quizTotalCorrect: 0,
};

function loadProgress(): PersistedProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<PersistedProgress>;
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      lab: { ...DEFAULT_LAB, ...(parsed.lab || {}) },
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export default function App() {
  const [progress, setProgress] = useState<PersistedProgress>(() => loadProgress());

  // Flashcard UI state
  const [fcFilter, setFcFilter] = useState<FlashcardFilter>('all');
  const [deckOrder, setDeckOrder] = useState<number[]>(() => FLASHCARDS.map((c) => c.id));
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // WebSocket Multiplayer state
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [peerId, setPeerId] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<RoomSnapshot | null>(null);
  const [statusNote, setStatusNote] = useState(
    'Enter any 2-digit code (00–99) to sync Optical Labs, Flashcards, and Mock AFL Races across devices.'
  );

  // Persist progress safely
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota errors
    }
  }, [progress]);

  const sendWs = useCallback((msg: ClientWsMessage) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }, []);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  const handleJoinLeave = () => {
    if (connected) {
      sendWs({ type: 'room:leave' });
      wsRef.current?.close();
      wsRef.current = null;
      setConnected(false);
      setConnecting(false);
      setPeerId(null);
      setSnapshot(null);
      setStatusNote('Left study room. Practicing solo.');
      return;
    }

    const code = normalizeRoomCode(progress.roomCode);
    const callsign = progress.callsign.trim() || 'Explorer 1';
    setProgress((prev) => ({ ...prev, roomCode: code, callsign }));
    setConnecting(true);

    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${proto}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      sendWs({
        type: 'room:join',
        roomCode: code,
        callsign,
        activeTab: progress.activeTab,
      });
    };

    ws.onmessage = (ev) => {
      let msg: ServerWsMessage;
      try {
        msg = JSON.parse(String(ev.data)) as ServerWsMessage;
      } catch {
        return;
      }

      if (msg.type === 'room:joined') {
        setConnected(true);
        setConnecting(false);
        setPeerId(msg.peerId);
        setSnapshot(msg.snapshot);
        setStatusNote(`Connected to Room ${msg.snapshot.roomCode}.`);
      } else if (msg.type === 'room:state') {
        setSnapshot(msg.snapshot);
      } else if (msg.type === 'lab:updated') {
        setProgress((prev) => ({ ...prev, activeTab: 'labs', lab: msg.lab }));
        setStatusNote(`${msg.senderName} synced the Optical Lab bench.`);
      } else if (msg.type === 'flashcard:updated') {
        const idx = FLASHCARDS.findIndex((c) => c.id === msg.cardIndex);
        if (idx >= 0) {
          setFcFilter('all');
          setDeckOrder(FLASHCARDS.map((c) => c.id));
          setCardIndex(idx);
          setFlipped(false);
          setProgress((prev) => ({ ...prev, activeTab: 'flashcards' }));
          setStatusNote(`${msg.senderName} synced Flashcard #${msg.cardIndex}.`);
        }
      } else if (msg.type === 'race:started') {
        setSnapshot(msg.snapshot);
        setProgress((prev) => ({ ...prev, activeTab: 'quiz' }));
        setStatusNote(`${msg.race.startedBy} started "${msg.race.title}"!`);
      } else if (msg.type === 'room:error') {
        setStatusNote(msg.message);
      }
    };

    ws.onerror = () => {
      setConnecting(false);
      setConnected(false);
      setStatusNote('WebSocket connection failed. Try again or continue solo.');
    };

    ws.onclose = () => {
      setConnecting(false);
      setConnected(false);
    };
  };

  const switchTab = (tab: AppTabMode) => {
    setProgress((prev) => ({ ...prev, activeTab: tab }));
    if (connected) {
      sendWs({ type: 'peer:tab', activeTab: tab });
    }
  };

  const handleChangeLab = (patch: Partial<SyncedLabState>) => {
    setProgress((prev) => ({
      ...prev,
      lab: { ...prev.lab, ...patch },
    }));
  };

  const handleSyncLab = () => {
    if (!connected) return;
    sendWs({ type: 'lab:sync', lab: progress.lab });
    setStatusNote(`Shared Optical Lab configuration to Room ${snapshot?.roomCode ?? progress.roomCode}.`);
  };

  const handleLaunchRace = (presetId: string) => {
    if (!connected) return;
    const preset = MOCK_AFL_PAPERS.find((p) => p.id === presetId) ?? MOCK_AFL_PAPERS[0];
    const qIds =
      preset.questionIds.length > 0
        ? preset.questionIds
        : shuffleArray(QUIZ_BANK)
            .slice(0, 10)
            .map((q) => q.id);
    sendWs({
      type: 'race:start',
      title: preset.label,
      questionIds: qIds,
      timedSeconds: preset.timedSeconds,
    });
  };

  const masteryPct = computeMasteryPct(progress.quizTotalCorrect, progress.quizTotalAnswered);

  return (
    <div className="mx-auto grid max-w-[1220px] gap-6 p-4 md:p-6">
      {/* Studio Header */}
      <header className="grid grid-cols-1 items-end gap-6 border-b border-[var(--outline-variant)] pb-6 lg:grid-cols-[1.45fr_1fr]">
        <div>
          <div className="font-mono-label text-xs uppercase tracking-wider text-[var(--tertiary)]">
            Science 8 · AFL Assessment Preparation
          </div>
          <h1 className="font-headline mt-1 text-3xl font-medium leading-tight tracking-tight text-balance text-[var(--on-surface)] md:text-[2.5rem]">
            Light, Refraction &amp; <em className="italic text-[var(--primary)]">Colour</em> Study Lab
          </h1>
          <p className="font-mono-label mt-2 text-xs uppercase tracking-wider text-[var(--primary)]">
            Ray Diagrams · Lenses &amp; TIR · Prism Dispersion · RGB &amp; Double Filters · Mock AFLs
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container)] p-3">
            <div className="font-mono-label text-[11px] uppercase tracking-wider text-[var(--tertiary)]">AFL Mastery</div>
            <div className="font-headline mt-1 whitespace-nowrap text-2xl text-[var(--on-surface)] sm:text-3xl" data-testid="stat-mastery">
              {masteryPct}%
            </div>
            <div className="text-xs text-[var(--on-surface-variant)]">{progress.quizTotalAnswered} answered</div>
          </div>
          <div className="rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container)] p-3">
            <div className="font-mono-label text-[11px] uppercase tracking-wider text-[var(--tertiary)]">Flashcards</div>
            <div className="font-headline mt-1 whitespace-nowrap text-2xl text-[var(--on-surface)] sm:text-3xl" data-testid="stat-cards">
              {progress.masteredIds.length} / {FLASHCARDS.length}
            </div>
            <div className="text-xs text-[var(--on-surface-variant)]">mastered</div>
          </div>
          <div className="rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container)] p-3">
            <div className="font-mono-label text-[11px] uppercase tracking-wider text-[var(--tertiary)]">Study Room</div>
            <div className="font-headline mt-1 whitespace-nowrap text-2xl text-[var(--on-surface)] sm:text-3xl" data-testid="stat-room">
              {connected ? `Room ${snapshot?.roomCode ?? progress.roomCode}` : 'Solo'}
            </div>
            <div className="text-xs text-[var(--on-surface-variant)]">
              {connected ? `${snapshot?.peers.length ?? 1} connected` : 'Offline practice'}
            </div>
          </div>
        </div>
      </header>

      {/* Live WebSocket Multiplayer Room Bar */}
      <MultiplayerBar
        callsign={progress.callsign}
        roomCode={progress.roomCode}
        connected={connected}
        connecting={connecting}
        peerId={peerId}
        snapshot={snapshot}
        statusNote={statusNote}
        onChangeCallsign={(val) => setProgress((prev) => ({ ...prev, callsign: val }))}
        onChangeRoomCode={(val) => setProgress((prev) => ({ ...prev, roomCode: val }))}
        onJoinLeave={handleJoinLeave}
        onSyncLab={handleSyncLab}
        onLaunchRace={handleLaunchRace}
        onSendChat={(text) => sendWs({ type: 'room:chat', text })}
      />

      {/* Primary Workspace Mode Tabs */}
      <nav aria-label="Study Modules" className="flex flex-wrap gap-2 border-b border-[var(--outline-variant)] pb-4">
        {[
          { id: 'labs' as const, label: '1. Interactive Optical Labs' },
          { id: 'flashcards' as const, label: `2. Flashcards (${FLASHCARDS.length})` },
          { id: 'challenges' as const, label: '3. Collaborative Challenges (6)' },
          { id: 'quiz' as const, label: `4. Mock AFL & Drills (${QUIZ_BANK.length} Qs)` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => switchTab(tab.id)}
            className={`font-mono-label min-h-[44px] whitespace-nowrap rounded border px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
              progress.activeTab === tab.id
                ? 'border-[var(--primary)] bg-[var(--primary-container)] text-[var(--primary)]'
                : 'border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] hover:text-[var(--on-surface)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Active Mode View */}
      {progress.activeTab === 'labs' && <OpticalLabsView lab={progress.lab} onChangeLab={handleChangeLab} />}

      {progress.activeTab === 'flashcards' && (
        <FlashcardsView
          filter={fcFilter}
          deckOrder={deckOrder}
          cardIndex={cardIndex}
          flipped={flipped}
          masteredIds={progress.masteredIds}
          roomConnected={connected}
          onChangeFilter={(f) => {
            setFcFilter(f);
            setCardIndex(0);
            setFlipped(false);
          }}
          onFlip={() => setFlipped((v) => !v)}
          onPrev={() => {
            const count =
              fcFilter === 'all' ? FLASHCARDS.length : FLASHCARDS.filter((c) => c.topic === fcFilter).length;
            setCardIndex((i) => (i - 1 + count) % count);
            setFlipped(false);
          }}
          onNext={() => {
            const count =
              fcFilter === 'all' ? FLASHCARDS.length : FLASHCARDS.filter((c) => c.topic === fcFilter).length;
            setCardIndex((i) => (i + 1) % count);
            setFlipped(false);
          }}
          onShuffle={() => {
            setDeckOrder(shuffleArray(FLASHCARDS.map((c) => c.id)));
            setCardIndex(0);
            setFlipped(false);
          }}
          onMarkMastered={(id, mastered) => {
            setProgress((prev) => {
              const set = new Set(prev.masteredIds);
              if (mastered) set.add(id);
              else set.delete(id);
              return { ...prev, masteredIds: Array.from(set) };
            });
            const count =
              fcFilter === 'all' ? FLASHCARDS.length : FLASHCARDS.filter((c) => c.topic === fcFilter).length;
            setCardIndex((i) => (i + 1) % count);
            setFlipped(false);
          }}
          onSyncCard={(cardId) => sendWs({ type: 'flashcard:sync', cardIndex: cardId })}
        />
      )}

      {progress.activeTab === 'challenges' && (
        <ChallengesView
          matrixAnswers={progress.matrixAnswers}
          densityAnswers={progress.densityAnswers}
          rayPathAnswers={progress.rayPathAnswers}
          stackedAnswers={progress.stackedAnswers}
          phenomenaAnswers={progress.phenomenaAnswers}
          roomConnected={connected}
          onUpdateMatrix={(key, val) =>
            setProgress((prev) => ({
              ...prev,
              matrixAnswers: { ...prev.matrixAnswers, [key]: val },
            }))
          }
          onResetMatrix={() => setProgress((prev) => ({ ...prev, matrixAnswers: {} }))}
          onUpdateDensity={(id, field, val) =>
            setProgress((prev) => ({
              ...prev,
              densityAnswers: {
                ...prev.densityAnswers,
                [id]: { ...(prev.densityAnswers[id] || { speed: '', bend: '' }), [field]: val },
              },
            }))
          }
          onUpdateRayPath={(id, choice) =>
            setProgress((prev) => ({
              ...prev,
              rayPathAnswers: { ...prev.rayPathAnswers, [id]: choice },
            }))
          }
          onUpdateStacked={(id, choice) =>
            setProgress((prev) => ({
              ...prev,
              stackedAnswers: { ...prev.stackedAnswers, [id]: choice },
            }))
          }
          onUpdatePhenomena={(id, val) =>
            setProgress((prev) => ({
              ...prev,
              phenomenaAnswers: { ...prev.phenomenaAnswers, [id]: val },
            }))
          }
          onShareScore={(score, label) => sendWs({ type: 'challenge:score', challengeScore: score, label })}
        />
      )}

      {progress.activeTab === 'quiz' && (
        <QuizView
          roomConnected={connected}
          roomRace={snapshot?.race ?? null}
          roomPeers={snapshot?.peers ?? []}
          selfPeerId={peerId}
          onRecordGlobalAnswer={(isCorrect) =>
            setProgress((prev) => ({
              ...prev,
              quizTotalAnswered: prev.quizTotalAnswered + 1,
              quizTotalCorrect: prev.quizTotalCorrect + (isCorrect ? 1 : 0),
            }))
          }
          onReportRaceProgress={(score, answered, total, streak, finished) =>
            sendWs({ type: 'race:progress', score, answered, total, streak, finished })
          }
          onResetAllProgress={() =>
            setProgress((prev) => ({
              ...prev,
              masteredIds: [],
              matrixAnswers: {},
              densityAnswers: {},
              rayPathAnswers: {},
              stackedAnswers: {},
              phenomenaAnswers: {},
              quizTotalAnswered: 0,
              quizTotalCorrect: 0,
            }))
          }
        />
      )}

      <footer className="flex flex-wrap justify-between gap-2 border-t border-[var(--outline-variant)] pt-4 font-mono-label text-xs text-[var(--on-surface-variant)]">
        <span>Science 8 Light, Refraction, Lenses, Dispersion &amp; Colour AFL Preparation Studio</span>
        <span>40 Flashcards · 60 Questions · 3 Mock AFL Papers · Live WebSocket Study Rooms</span>
      </footer>
    </div>
  );
}
