export function shuffleArray<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

export function computeMasteryPct(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 100);
}

export function normalizeRoomCode(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 2);
  if (!digits) return '42';
  return digits.padStart(2, '0');
}

export function formatTimerSeconds(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function gradeBand(pct: number): { label: string; summary: string } {
  if (pct >= 90) {
    return {
      label: 'Distinction · AFL Ready',
      summary: 'Strong command of refraction geometry, dispersion wavelengths, and selective filter absorption.',
    };
  }
  if (pct >= 75) {
    return {
      label: 'Proficient · Solid Mastery',
      summary: 'Good grasp of core optics principles. Review missed questions below to lock in full marks.',
    };
  }
  if (pct >= 55) {
    return {
      label: 'Developing · Focused Review',
      summary: 'Use the Interactive Optical Labs and Missed Questions retry to strengthen weak areas.',
    };
  }
  return {
    label: 'Foundations · Lab Practice Needed',
    summary: 'Walk through the Refraction Ray Bench and Optical Filter Lab before attempting another Mock AFL.',
  };
}
