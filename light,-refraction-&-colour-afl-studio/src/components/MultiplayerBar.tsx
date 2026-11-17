import React, { useState } from 'react';
import { Radio, Users, Send, Shuffle, Play } from 'lucide-react';
import type { RoomSnapshot } from '../shared/protocol';
import { normalizeRoomCode } from '../utils/scoring';

interface MultiplayerBarProps {
  callsign: string;
  roomCode: string;
  connected: boolean;
  connecting: boolean;
  peerId: string | null;
  snapshot: RoomSnapshot | null;
  statusNote: string;
  onChangeCallsign: (val: string) => void;
  onChangeRoomCode: (val: string) => void;
  onJoinLeave: () => void;
  onSyncLab: () => void;
  onLaunchRace: (presetId: string) => void;
  onSendChat: (text: string) => void;
}

export const MultiplayerBar: React.FC<MultiplayerBarProps> = ({
  callsign,
  roomCode,
  connected,
  connecting,
  peerId,
  snapshot,
  statusNote,
  onChangeCallsign,
  onChangeRoomCode,
  onJoinLeave,
  onSyncLab,
  onLaunchRace,
  onSendChat,
}) => {
  const [chatInput, setChatInput] = useState('');
  const [racePreset, setRacePreset] = useState('quick-10');
  const [showRoomPanel, setShowRoomPanel] = useState(false);

  const handleRandomRoom = () => {
    const code = String(Math.floor(Math.random() * 100)).padStart(2, '0');
    onChangeRoomCode(code);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    onSendChat(trimmed);
    setChatInput('');
  };

  const cleanCode = normalizeRoomCode(roomCode);
  const peers = snapshot?.peers ?? [];

  return (
    <section
      aria-label="Multiplayer Study Room"
      className="rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4 md:p-5"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.2fr_0.9fr_auto] md:items-end">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="input-callsign"
            className="font-mono-label text-xs uppercase tracking-wider text-[var(--on-surface-variant)]"
          >
            Student Callsign
          </label>
          <input
            id="input-callsign"
            type="text"
            maxLength={18}
            value={callsign}
            disabled={connected}
            onChange={(e) => onChangeCallsign(e.target.value)}
            placeholder="Explorer 1"
            className="min-h-[44px] rounded border border-[var(--outline)] bg-[var(--background)] px-3 py-2 text-[var(--on-surface)] transition-colors hover:border-[var(--tertiary)] disabled:opacity-65"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="input-room-code"
            className="font-mono-label text-xs uppercase tracking-wider text-[var(--on-surface-variant)]"
          >
            2-Digit Room (00–99)
          </label>
          <div className="flex gap-2">
            <input
              id="input-room-code"
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={roomCode}
              disabled={connected}
              onChange={(e) => onChangeRoomCode(e.target.value.replace(/\D/g, '').slice(0, 2))}
              className="font-mono-label min-h-[44px] w-24 rounded border border-[var(--outline)] bg-[var(--background)] px-3 py-2 text-center font-semibold tracking-widest text-[var(--on-surface)] transition-colors hover:border-[var(--tertiary)] disabled:opacity-65"
            />
            <button
              type="button"
              onClick={handleRandomRoom}
              disabled={connected}
              title="Pick random 2-digit room"
              aria-label="Pick random 2-digit room"
              className="font-mono-label inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded border border-[var(--outline-variant)] bg-[var(--surface-container)] px-3 py-2 text-xs uppercase tracking-wider text-[var(--on-surface-variant)] transition-colors hover:border-[var(--primary)] hover:text-[var(--on-surface)] disabled:opacity-45"
            >
              <Shuffle className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Random</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="btn-room-connect"
            onClick={onJoinLeave}
            disabled={connecting}
            className={`font-mono-label inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              connected
                ? 'border border-[var(--error)] bg-transparent text-[var(--error)] hover:bg-[rgba(242,116,116,0.12)]'
                : 'border border-[var(--primary)] bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--on-primary-container)]'
            }`}
          >
            <Radio className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              {connecting
                ? 'Connecting…'
                : connected
                ? `Leave Room ${snapshot?.roomCode ?? cleanCode}`
                : `Join Live Room ${cleanCode}`}
            </span>
          </button>

          {connected && (
            <button
              type="button"
              onClick={() => setShowRoomPanel((v) => !v)}
              aria-expanded={showRoomPanel}
              className="font-mono-label inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded border border-[var(--outline)] bg-transparent px-3 py-2 text-xs uppercase tracking-wider text-[var(--on-surface)] hover:border-[var(--tertiary)]"
            >
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{showRoomPanel ? 'Hide Room Feed' : `Room Feed (${peers.length})`}</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Roster & Sync Actions Strip */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--outline-variant)] pt-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
          <span className="font-mono-label inline-flex items-center gap-1.5 text-xs uppercase tracking-wider">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                connected ? 'bg-[var(--positive)]' : 'bg-[var(--secondary)]'
              }`}
              aria-hidden="true"
            />
            <span className={connected ? 'text-[var(--positive)]' : 'text-[var(--on-surface-variant)]'}>
              {connected ? `Live Room ${snapshot?.roomCode ?? cleanCode}` : 'Solo Offline'}
            </span>
          </span>

          {connected && peers.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {peers.map((p) => {
                const isSelf = p.id === peerId;
                return (
                  <span
                    key={p.id}
                    className={`font-mono-label rounded border px-2.5 py-1 text-xs ${
                      isSelf
                        ? 'border-[var(--primary)] bg-[var(--primary-container)] text-[var(--on-primary-container)]'
                        : 'border-[var(--outline-variant)] bg-[var(--surface-container)] text-[var(--on-surface)]'
                    }`}
                  >
                    {p.callsign}
                    {isSelf ? ' (You)' : ''}
                    {p.isHost ? ' · Host' : ''}
                    {' · '}
                    {p.quizTotal > 0 ? `${p.quizScore}/${p.quizTotal}` : `${p.challengeScore} chg`}
                  </span>
                );
              })}
            </div>
          ) : (
            <span className="text-xs text-[var(--on-surface-variant)]">{statusNote}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {connected && (
            <>
              <select
                aria-label="Choose quiz or mock paper to sync"
                value={racePreset}
                onChange={(e) => setRacePreset(e.target.value)}
                className="font-mono-label min-h-[40px] rounded border border-[var(--outline-variant)] bg-[var(--background)] px-2.5 py-1.5 text-xs text-[var(--on-surface)]"
              >
                <option value="quick-10">Sync Quick 10 Race</option>
                <option value="paper-a">Sync Mock AFL Paper A (25Q)</option>
                <option value="paper-b">Sync Mock AFL Paper B (25Q)</option>
                <option value="marathon-50">Sync Full Syllabus Mock (50Q)</option>
              </select>
              <button
                type="button"
                id="btn-sync-quiz"
                onClick={() => onLaunchRace(racePreset)}
                className="font-mono-label inline-flex min-h-[40px] items-center gap-1.5 whitespace-nowrap rounded border border-[var(--primary)] bg-[var(--primary-container)] px-3 py-1.5 text-xs uppercase tracking-wider text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--on-primary)]"
              >
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Start Room Race</span>
              </button>
              <button
                type="button"
                id="btn-sync-lab"
                onClick={onSyncLab}
                className="font-mono-label min-h-[40px] whitespace-nowrap rounded border border-[var(--outline-variant)] bg-[var(--surface-container)] px-3 py-1.5 text-xs uppercase tracking-wider text-[var(--on-surface)] hover:border-[var(--tertiary)]"
              >
                Sync Lab View
              </button>
            </>
          )}
        </div>
      </div>

      {/* Expandable Room Feed & Live Leaderboard */}
      {connected && showRoomPanel && snapshot && (
        <div className="mt-3 grid grid-cols-1 gap-4 border-t border-[var(--outline-variant)] pt-3 md:grid-cols-2">
          <div className="rounded border border-[var(--outline-variant)] bg-[var(--background)] p-3">
            <div className="font-mono-label mb-2 text-xs uppercase tracking-wider text-[var(--tertiary)]">
              Live Room Leaderboard {snapshot.race ? `· ${snapshot.race.title}` : ''}
            </div>
            <div className="space-y-1.5">
              {[...peers]
                .sort((a, b) => b.quizScore - a.quizScore || b.challengeScore - a.challengeScore)
                .map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between border-b border-[var(--outline-variant)] pb-1.5 text-xs last:border-b-0 last:pb-0"
                  >
                    <span className="font-medium text-[var(--on-surface)]">
                      {idx + 1}. {p.callsign} {p.id === peerId ? '(You)' : ''}
                    </span>
                    <span className="font-mono-label text-[var(--on-surface-variant)]">
                      {p.quizTotal > 0
                        ? `${p.quizScore}/${p.quizTotal} (${p.quizAnswered} done${p.quizFinished ? ' · Finished' : ''})`
                        : `Lab: ${p.activeTab} · Challenges: ${p.challengeScore}`}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="flex flex-col justify-between rounded border border-[var(--outline-variant)] bg-[var(--background)] p-3">
            <div>
              <div className="font-mono-label mb-2 text-xs uppercase tracking-wider text-[var(--tertiary)]">
                Study Room Notes &amp; Quick Hints
              </div>
              <div className="max-h-32 space-y-1 overflow-y-auto text-xs">
                {snapshot.chat.length === 0 ? (
                  <p className="text-[var(--on-surface-variant)]">No messages yet. Share a hint or start a Mock AFL race.</p>
                ) : (
                  snapshot.chat.map((c) => (
                    <div key={c.id} className="text-[var(--on-surface)]">
                      <span className="font-mono-label text-[var(--primary)]">{c.callsign}:</span>{' '}
                      <span className="text-[var(--on-surface-variant)]">{c.text}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <form onSubmit={handleChatSubmit} className="mt-2 flex gap-2">
              <input
                type="text"
                maxLength={140}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Send study hint to room..."
                aria-label="Send study hint to room"
                className="min-h-[40px] flex-1 rounded border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-2.5 py-1 text-xs text-[var(--on-surface)]"
              />
              <button
                type="submit"
                aria-label="Send message"
                className="font-mono-label inline-flex min-h-[40px] items-center gap-1 rounded border border-[var(--outline)] px-3 py-1 text-xs uppercase text-[var(--on-surface)] hover:border-[var(--primary)]"
              >
                <Send className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
