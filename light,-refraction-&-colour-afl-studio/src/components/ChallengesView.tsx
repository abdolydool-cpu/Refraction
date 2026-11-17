import React, { useState } from 'react';
import {
  DENSITY_DRILLS,
  PHENOMENON_ITEMS,
  PHENOMENON_MECHANISMS,
  RAY_PATH_PUZZLES,
  SPOTLIGHT_COLUMNS,
  SPOTLIGHT_ROWS,
  STACKED_FILTER_PUZZLES,
} from '../data/curriculum';
import {
  BOUNDARY_PRESETS,
  colorNameToCssVar,
  getFilterChannels,
  solveSurfaceAppearance,
  type OpticalColorName,
} from '../utils/optics';

export type ChallengeTabId =
  | 'spotlight'
  | 'density'
  | 'ray-path'
  | 'double-filter'
  | 'spectrum-rank'
  | 'phenomena';

interface ChallengesViewProps {
  matrixAnswers: Record<string, string>;
  densityAnswers: Record<string, { speed: string; bend: string }>;
  rayPathAnswers: Record<string, string>;
  stackedAnswers: Record<string, string>;
  phenomenaAnswers: Record<string, string>;
  roomConnected: boolean;
  onUpdateMatrix: (key: string, val: string) => void;
  onResetMatrix: () => void;
  onUpdateDensity: (id: string, field: 'speed' | 'bend', val: string) => void;
  onUpdateRayPath: (id: string, choice: string) => void;
  onUpdateStacked: (id: string, choice: string) => void;
  onUpdatePhenomena: (id: string, val: string) => void;
  onShareScore: (score: number, label: string) => void;
}

const CYCLE_COLORS: ('?' | OpticalColorName)[] = ['?', 'Red', 'Green', 'Blue', 'Yellow', 'Cyan', 'Magenta', 'Black'];

const EXPECTED_SPECTRUM_ORDER = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet'];

export const ChallengesView: React.FC<ChallengesViewProps> = ({
  matrixAnswers,
  densityAnswers,
  rayPathAnswers,
  stackedAnswers,
  phenomenaAnswers,
  roomConnected,
  onUpdateMatrix,
  onResetMatrix,
  onUpdateDensity,
  onUpdateRayPath,
  onUpdateStacked,
  onUpdatePhenomena,
  onShareScore,
}) => {
  const [activeChallenge, setActiveChallenge] = useState<ChallengeTabId>('spotlight');
  const [checkedMatrix, setCheckedMatrix] = useState(false);
  const [checkedDensity, setCheckedDensity] = useState(false);
  const [checkedRayPath, setCheckedRayPath] = useState(false);
  const [checkedStacked, setCheckedStacked] = useState(false);
  const [checkedPhenomena, setCheckedPhenomena] = useState(false);

  // Spectrum ranker local state
  const [spectrumOrder, setSpectrumOrder] = useState<string[]>([
    'Green',
    'Violet',
    'Red',
    'Blue',
    'Yellow',
    'Indigo',
    'Orange',
  ]);
  const [checkedSpectrum, setCheckedSpectrum] = useState(false);

  // Score computations
  const matrixTotal = SPOTLIGHT_ROWS.length * SPOTLIGHT_COLUMNS.length;
  const matrixScore = SPOTLIGHT_ROWS.reduce((acc, row) => {
    return (
      acc +
      SPOTLIGHT_COLUMNS.filter((col) => {
        const expected = solveSurfaceAppearance(row.label, getFilterChannels(col.id));
        return matrixAnswers[`${row.id}_${col.id}`] === expected;
      }).length
    );
  }, 0);

  const densityScore = DENSITY_DRILLS.filter(
    (d) => densityAnswers[d.id]?.speed === d.speed && densityAnswers[d.id]?.bend === d.bend
  ).length;

  const rayPathScore = RAY_PATH_PUZZLES.filter((p) => rayPathAnswers[p.id] === p.correctPath).length;
  const stackedScore = STACKED_FILTER_PUZZLES.filter((p) => stackedAnswers[p.id] === p.expected).length;
  const phenomenaScore = PHENOMENON_ITEMS.filter((p) => phenomenaAnswers[p.id] === p.correctMechanism).length;
  const spectrumScore = spectrumOrder.filter((c, i) => c === EXPECTED_SPECTRUM_ORDER[i]).length;

  const moveSpectrumColor = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= spectrumOrder.length) return;
    const next = spectrumOrder.slice();
    const tmp = next[idx];
    next[idx] = next[target];
    next[target] = tmp;
    setSpectrumOrder(next);
    setCheckedSpectrum(false);
  };

  const challengeTabs: { id: ChallengeTabId; label: string }[] = [
    { id: 'spotlight', label: '1. Spotlight Matrix (32)' },
    { id: 'density', label: '2. Speed & Normal (8)' },
    { id: 'ray-path', label: '3. Ray Path Inspector (3)' },
    { id: 'double-filter', label: '4. Double-Filter Stack (6)' },
    { id: 'spectrum-rank', label: '5. Spectrum Ranker (7)' },
    { id: 'phenomena', label: '6. Real-World Match (6)' },
  ];

  return (
    <section className="grid gap-6">
      {/* Sub-navigation bar for all 6 challenges */}
      <div className="rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container)] p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-mono-label text-xs uppercase tracking-wider text-[var(--tertiary)]">
              6 Interactive Curriculum Challenges
            </div>
            <h2 className="font-headline text-2xl font-medium text-[var(--on-surface)]">
              Applied Optics &amp; Collaborative Drills
            </h2>
          </div>
          <div className="font-mono-label text-xs text-[var(--on-surface-variant)]">
            Challenge Total: {matrixScore + densityScore + rayPathScore + stackedScore + spectrumScore + phenomenaScore} /{' '}
            {matrixTotal + DENSITY_DRILLS.length + RAY_PATH_PUZZLES.length + STACKED_FILTER_PUZZLES.length + 7 + PHENOMENON_ITEMS.length}
          </div>
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Select optics challenge">
          {challengeTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={activeChallenge === t.id}
              onClick={() => setActiveChallenge(t.id)}
              className={`font-mono-label min-h-[40px] whitespace-nowrap rounded border px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${
                activeChallenge === t.id
                  ? 'border-[var(--primary)] bg-[var(--primary-container)] text-[var(--primary)]'
                  : 'border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. EXPANDED THEATRE SPOTLIGHT COSTUME MATRIX (8x4 = 32 cells) */}
      {activeChallenge === 'spotlight' && (
        <div className="rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container)] p-5 md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-mono-label text-xs uppercase tracking-wider text-[var(--tertiary)]">
                Challenge 01 · Worksheet 8Je-4 Extended
              </div>
              <h3 className="font-headline text-2xl font-medium text-[var(--on-surface)]">
                Theatre Spotlight Costume Matrix (Primary + Secondary Surfaces)
              </h3>
              <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
                Click any cell to cycle what colour the performer’s costume appears under each spotlight. Notice how Yellow light contains both Red and Green!
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setCheckedMatrix(true);
                  if (roomConnected) onShareScore(matrixScore, 'Spotlight Matrix');
                }}
                className="font-mono-label min-h-[44px] rounded border border-[var(--primary)] bg-[var(--primary)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--on-primary)]"
              >
                Check Table
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetMatrix();
                  setCheckedMatrix(false);
                }}
                className="font-mono-label min-h-[44px] rounded border border-[var(--outline)] px-4 py-2 text-xs uppercase tracking-wider text-[var(--on-surface)]"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--outline-variant)]">
                  <th className="font-mono-label p-2.5 text-left text-xs uppercase tracking-wider text-[var(--on-surface-variant)]">
                    Costume in White Light
                  </th>
                  {SPOTLIGHT_COLUMNS.map((col) => (
                    <th key={col.id} className="font-mono-label p-2.5 text-left text-xs uppercase tracking-wider text-[var(--on-surface-variant)]">
                      <span className="inline-flex items-center gap-2">
                        <span className="inline-block h-3 w-3 rounded-sm border border-[var(--outline)]" style={{ background: col.swatch }} />
                        <span>{col.label}</span>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SPOTLIGHT_ROWS.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--outline-variant)]">
                    <td className="p-2.5">
                      <span className="inline-flex items-center gap-2 font-medium text-[var(--on-surface)]">
                        <span className="inline-block h-3.5 w-3.5 rounded-sm border border-[var(--outline)]" style={{ background: row.swatch }} />
                        <span>{row.label}</span>
                      </span>
                    </td>
                    {SPOTLIGHT_COLUMNS.map((col) => {
                      const key = `${row.id}_${col.id}`;
                      const cur = (matrixAnswers[key] as '?' | OpticalColorName) || '?';
                      const expected = solveSurfaceAppearance(row.label, getFilterChannels(col.id));
                      const isOk = cur === expected;
                      const dotColor = cur === '?' ? 'transparent' : colorNameToCssVar(cur);
                      return (
                        <td key={key} className="p-2">
                          <button
                            type="button"
                            onClick={() => {
                              const idx = CYCLE_COLORS.indexOf(cur);
                              const next = CYCLE_COLORS[(idx + 1) % CYCLE_COLORS.length];
                              onUpdateMatrix(key, next);
                              setCheckedMatrix(false);
                            }}
                            className={`font-mono-label flex min-h-[42px] w-full items-center justify-between gap-2 rounded border px-3 py-1.5 text-xs uppercase transition-colors ${
                              checkedMatrix
                                ? isOk
                                  ? 'border-[var(--positive)] bg-[rgba(82,209,156,0.14)] text-[var(--positive)]'
                                  : 'border-[var(--error)] bg-[rgba(242,116,116,0.14)] text-[var(--error)]'
                                : 'border-[var(--outline)] bg-[var(--background)] text-[var(--on-surface)] hover:border-[var(--primary)]'
                            }`}
                          >
                            <span>{cur === '?' ? 'Select' : cur}</span>
                            <span
                              className="inline-block h-3 w-3 rounded-sm border border-[var(--outline)]"
                              style={{ background: dotColor }}
                            />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {checkedMatrix && (
            <div className="mt-4 rounded border border-[var(--outline-variant)] bg-[var(--background)] p-3 text-sm text-[var(--on-surface)]">
              <strong>Spotlight Score: {matrixScore} / {matrixTotal}.</strong> Secondary surfaces reflect two primary colours (Yellow = R+G, Cyan = G+B, Magenta = R+B). A Yellow costume under Red light reflects the Red component and looks Red!
            </div>
          )}
        </div>
      )}

      {/* 2. REFRACTION SPEED & NORMAL 8-CASE PREDICTOR */}
      {activeChallenge === 'density' && (
        <div className="rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container)] p-5 md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-mono-label text-xs uppercase tracking-wider text-[var(--tertiary)]">
                Challenge 02 · Medium Density &amp; Normal Drill
              </div>
              <h3 className="font-headline text-2xl font-medium text-[var(--on-surface)]">
                Predict Speed &amp; Ray Direction (8 Boundary Cases)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setCheckedDensity(true);
                if (roomConnected) onShareScore(densityScore, 'Speed & Normal Drill');
              }}
              className="font-mono-label min-h-[44px] rounded border border-[var(--primary)] bg-[var(--primary)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--on-primary)]"
            >
              Check Predictions
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {DENSITY_DRILLS.map((d) => {
              const saved = densityAnswers[d.id] || { speed: '', bend: '' };
              const isOk = saved.speed === d.speed && saved.bend === d.bend;
              return (
                <div
                  key={d.id}
                  className={`grid gap-3 rounded border bg-[var(--background)] p-4 ${
                    checkedDensity
                      ? isOk
                        ? 'border-[var(--positive)]'
                        : 'border-[var(--error)]'
                      : 'border-[var(--outline-variant)]'
                  }`}
                >
                  <div>
                    <div className="font-mono-label text-xs uppercase text-[var(--tertiary)]">{d.note}</div>
                    <h4 className="mt-0.5 font-semibold text-[var(--on-surface)]">{d.title}</h4>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor={`spd-${d.id}`} className="font-mono-label text-xs uppercase text-[var(--on-surface-variant)]">
                      Wave Speed
                    </label>
                    <select
                      id={`spd-${d.id}`}
                      value={saved.speed}
                      onChange={(e) => {
                        onUpdateDensity(d.id, 'speed', e.target.value);
                        setCheckedDensity(false);
                      }}
                      className="min-h-[42px] rounded border border-[var(--outline)] bg-[var(--surface-container-low)] px-2.5 text-sm text-[var(--on-surface)]"
                    >
                      <option value="">Choose speed…</option>
                      <option value="slows">Slows down</option>
                      <option value="speeds">Speeds up</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor={`bnd-${d.id}`} className="font-mono-label text-xs uppercase text-[var(--on-surface-variant)]">
                      Direction vs Normal
                    </label>
                    <select
                      id={`bnd-${d.id}`}
                      value={saved.bend}
                      onChange={(e) => {
                        onUpdateDensity(d.id, 'bend', e.target.value);
                        setCheckedDensity(false);
                      }}
                      className="min-h-[42px] rounded border border-[var(--outline)] bg-[var(--surface-container-low)] px-2.5 text-sm text-[var(--on-surface)]"
                    >
                      <option value="">Choose direction…</option>
                      <option value="towards">Bends towards normal</option>
                      <option value="away">Bends away from normal</option>
                      <option value="straight">Passes straight through</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          {checkedDensity && (
            <div className="mt-4 rounded border border-[var(--outline-variant)] bg-[var(--background)] p-3 text-sm text-[var(--on-surface)]">
              <strong>Ray Predictions Correct: {densityScore} / {DENSITY_DRILLS.length}.</strong> Note cases 4 &amp; 8: at 0° to the normal, light still changes speed across mediums, even though it passes straight through!
            </div>
          )}
        </div>
      )}

      {/* 3. RAY PATH SVG INSPECTOR */}
      {activeChallenge === 'ray-path' && (
        <div className="rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container)] p-5 md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-mono-label text-xs uppercase tracking-wider text-[var(--tertiary)]">
                Challenge 03 · Visual Ray Tracing
              </div>
              <h3 className="font-headline text-2xl font-medium text-[var(--on-surface)]">
                Ray Path Diagram Inspector
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setCheckedRayPath(true);
                if (roomConnected) onShareScore(rayPathScore, 'Ray Path Inspector');
              }}
              className="font-mono-label min-h-[44px] rounded border border-[var(--primary)] bg-[var(--primary)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--on-primary)]"
            >
              Verify Ray Paths
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {RAY_PATH_PUZZLES.map((p) => {
              const preset = BOUNDARY_PRESETS[p.preset];
              const theta1 = (p.incAngle * Math.PI) / 180;
              const cx = 160;
              const cy = 90;
              const len = 76;
              const ix = cx - len * Math.sin(theta1);
              const iy = cy - len * Math.cos(theta1);
              const chosen = rayPathAnswers[p.id];
              const isOk = chosen === p.correctPath;

              return (
                <div
                  key={p.id}
                  className={`flex flex-col gap-3 rounded border bg-[var(--background)] p-4 ${
                    checkedRayPath
                      ? isOk
                        ? 'border-[var(--positive)]'
                        : 'border-[var(--error)]'
                      : 'border-[var(--outline-variant)]'
                  }`}
                >
                  <h4 className="font-semibold text-[var(--on-surface)]">{p.title}</h4>
                  <svg viewBox="0 0 320 180" className="w-full rounded border border-[var(--outline-variant)]" role="img" aria-label={p.title}>
                    <rect x="0" y="0" width="320" height="90" fill={preset.fill1} />
                    <rect x="0" y="90" width="320" height="90" fill={preset.fill2} />
                    <line x1="0" y1="90" x2="320" y2="90" stroke="var(--outline)" strokeWidth="1.5" />
                    <line x1={cx} y1="8" x2={cx} y2="172" stroke="var(--on-surface-variant)" strokeDasharray="4 4" strokeWidth="1.2" />
                    <line x1={ix} y1={iy} x2={cx} y2={cy} stroke="var(--primary)" strokeWidth="3" />
                    <text x="10" y="18" fill="var(--on-surface)" fontSize="9" fontFamily="JetBrains Mono, monospace">{preset.short1}</text>
                    <text x="10" y="170" fill="var(--on-surface)" fontSize="9" fontFamily="JetBrains Mono, monospace">{preset.short2}</text>

                    {p.paths.map((opt) => {
                      const ang = (opt.outAngle * Math.PI) / 180;
                      const px = cx + len * Math.sin(ang);
                      const py = opt.isReflection ? cy - len * Math.cos(ang) : cy + len * Math.cos(ang);
                      const active = chosen === opt.key;
                      return (
                        <g key={opt.key}>
                          <line
                            x1={cx}
                            y1={cy}
                            x2={px}
                            y2={py}
                            stroke={active ? 'var(--positive)' : 'var(--tertiary)'}
                            strokeWidth={active ? '3' : '1.5'}
                            strokeDasharray={active ? undefined : '4 3'}
                            opacity={active ? 1 : 0.75}
                          />
                          <text
                            x={px + 4}
                            y={opt.isReflection ? py + 10 : py - 2}
                            fill={active ? 'var(--positive)' : 'var(--on-surface)'}
                            fontSize="11"
                            fontWeight="700"
                            fontFamily="JetBrains Mono, monospace"
                          >
                            {opt.key}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  <p className="text-xs text-[var(--on-surface-variant)]">{p.prompt}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {p.paths.map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => {
                          onUpdateRayPath(p.id, opt.key);
                          setCheckedRayPath(false);
                        }}
                        className={`font-mono-label min-h-[40px] rounded border px-2 py-1 text-left text-xs ${
                          chosen === opt.key
                            ? 'border-[var(--primary)] bg-[var(--primary-container)] text-[var(--primary)]'
                            : 'border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--on-surface)]'
                        }`}
                      >
                        <strong>{opt.key}:</strong> {opt.outAngle}° {opt.isReflection ? '(TIR)' : ''}
                      </button>
                    ))}
                  </div>
                  {checkedRayPath && (
                    <div className="text-xs text-[var(--on-surface-variant)]">
                      <strong className={isOk ? 'text-[var(--positive)]' : 'text-[var(--error)]'}>
                        {isOk ? 'Correct!' : `Answer: ${p.correctPath}.`}
                      </strong>{' '}
                      {p.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. DOUBLE OPTICAL FILTER STACK CHALLENGE */}
      {activeChallenge === 'double-filter' && (
        <div className="rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container)] p-5 md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-mono-label text-xs uppercase tracking-wider text-[var(--tertiary)]">
                Challenge 04 · Stacked Transmission Lab
              </div>
              <h3 className="font-headline text-2xl font-medium text-[var(--on-surface)]">
                Double Optical Filter Predictor
              </h3>
              <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
                White light passes sequentially through Filter 1 and Filter 2. Predict the final colour emerging on the screen.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCheckedStacked(true);
                if (roomConnected) onShareScore(stackedScore, 'Double-Filter Stack');
              }}
              className="font-mono-label min-h-[44px] rounded border border-[var(--primary)] bg-[var(--primary)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--on-primary)]"
            >
              Check Filter Stacks
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {STACKED_FILTER_PUZZLES.map((sf) => {
              const saved = stackedAnswers[sf.id] || '';
              const isOk = saved === sf.expected;
              return (
                <div
                  key={sf.id}
                  className={`grid gap-3 rounded border bg-[var(--background)] p-4 ${
                    checkedStacked
                      ? isOk
                        ? 'border-[var(--positive)]'
                        : 'border-[var(--error)]'
                      : 'border-[var(--outline-variant)]'
                  }`}
                >
                  <div className="font-medium text-[var(--on-surface)]">{sf.label}</div>
                  <div className="flex items-center gap-2 text-xs font-mono-label">
                    <span className="rounded border border-[var(--outline)] px-2 py-1 text-[var(--on-surface)]">White (R+G+B)</span>
                    <span>→</span>
                    <span className="rounded border border-[var(--outline)] px-2 py-1 text-[var(--on-surface)]">{sf.f1.toUpperCase()}</span>
                    <span>→</span>
                    <span className="rounded border border-[var(--outline)] px-2 py-1 text-[var(--on-surface)]">{sf.f2.toUpperCase()}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor={`sf-${sf.id}`} className="font-mono-label text-xs uppercase text-[var(--on-surface-variant)]">
                      Emerging Light
                    </label>
                    <select
                      id={`sf-${sf.id}`}
                      value={saved}
                      onChange={(e) => {
                        onUpdateStacked(sf.id, e.target.value);
                        setCheckedStacked(false);
                      }}
                      className="min-h-[42px] rounded border border-[var(--outline)] bg-[var(--surface-container-low)] px-2.5 text-sm text-[var(--on-surface)]"
                    >
                      <option value="">Choose emerging colour…</option>
                      {(['Red', 'Green', 'Blue', 'Yellow', 'Cyan', 'Magenta', 'Black'] as OpticalColorName[]).map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  {checkedStacked && (
                    <div className="text-xs text-[var(--on-surface-variant)]">
                      <strong className={isOk ? 'text-[var(--positive)]' : 'text-[var(--error)]'}>
                        {isOk ? 'Correct!' : `Answer: ${sf.expected}.`}
                      </strong>{' '}
                      {sf.hint}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. SPECTRUM & WAVELENGTH RANKER */}
      {activeChallenge === 'spectrum-rank' && (
        <div className="rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container)] p-5 md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-mono-label text-xs uppercase tracking-wider text-[var(--tertiary)]">
                Challenge 05 · Dispersion Order
              </div>
              <h3 className="font-headline text-2xl font-medium text-[var(--on-surface)]">
                Order the Visible Spectrum (Longest Wavelength / Least Bent → Slowest / Most Bent)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setCheckedSpectrum(true);
                if (roomConnected) onShareScore(spectrumScore, 'Spectrum Ranker');
              }}
              className="font-mono-label min-h-[44px] rounded border border-[var(--primary)] bg-[var(--primary)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--on-primary)]"
            >
              Check Spectrum Order
            </button>
          </div>

          <div className="grid gap-2">
            {spectrumOrder.map((colorName, idx) => {
              const isOk = colorName === EXPECTED_SPECTRUM_ORDER[idx];
              return (
                <div
                  key={colorName}
                  className={`flex items-center justify-between gap-3 rounded border bg-[var(--background)] px-4 py-2.5 ${
                    checkedSpectrum
                      ? isOk
                        ? 'border-[var(--positive)]'
                        : 'border-[var(--error)]'
                      : 'border-[var(--outline-variant)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono-label text-xs text-[var(--on-surface-variant)]">#{idx + 1}</span>
                    <span
                      className="inline-block h-4 w-4 rounded-sm border border-[var(--outline)]"
                      style={{ background: `var(--spec-${colorName.toLowerCase()})` }}
                    />
                    <span className="font-semibold text-[var(--on-surface)]">{colorName}</span>
                    <span className="text-xs text-[var(--on-surface-variant)]">
                      {idx === 0 ? '(Longest wavelength, bends least)' : idx === 6 ? '(Slowest in prism, bends most)' : ''}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveSpectrumColor(idx, -1)}
                      aria-label={`Move ${colorName} up`}
                      className="font-mono-label min-h-[38px] rounded border border-[var(--outline)] px-3 py-1 text-xs uppercase text-[var(--on-surface)] disabled:opacity-35"
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      disabled={idx === spectrumOrder.length - 1}
                      onClick={() => moveSpectrumColor(idx, 1)}
                      aria-label={`Move ${colorName} down`}
                      className="font-mono-label min-h-[38px] rounded border border-[var(--outline)] px-3 py-1 text-xs uppercase text-[var(--on-surface)] disabled:opacity-35"
                    >
                      Down
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {checkedSpectrum && (
            <div className="mt-4 rounded border border-[var(--outline-variant)] bg-[var(--background)] p-3 text-sm text-[var(--on-surface)]">
              <strong>Positions Correct: {spectrumScore} / 7.</strong> Correct order: Red → Orange → Yellow → Green → Blue → Indigo → Violet.
            </div>
          )}
        </div>
      )}

      {/* 6. REAL-WORLD PHENOMENON MATCHER */}
      {activeChallenge === 'phenomena' && (
        <div className="rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container)] p-5 md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-mono-label text-xs uppercase tracking-wider text-[var(--tertiary)]">
                Challenge 06 · Real-World Explanations
              </div>
              <h3 className="font-headline text-2xl font-medium text-[var(--on-surface)]">
                Match Everyday Phenomena to Optical Physics
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setCheckedPhenomena(true);
                if (roomConnected) onShareScore(phenomenaScore, 'Phenomena Match');
              }}
              className="font-mono-label min-h-[44px] rounded border border-[var(--primary)] bg-[var(--primary)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--on-primary)]"
            >
              Check Matches
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {PHENOMENON_ITEMS.map((item) => {
              const saved = phenomenaAnswers[item.id] || '';
              const isOk = saved === item.correctMechanism;
              return (
                <div
                  key={item.id}
                  className={`grid gap-2.5 rounded border bg-[var(--background)] p-4 ${
                    checkedPhenomena
                      ? isOk
                        ? 'border-[var(--positive)]'
                        : 'border-[var(--error)]'
                      : 'border-[var(--outline-variant)]'
                  }`}
                >
                  <div className="font-semibold text-[var(--on-surface)]">{item.phenomenon}</div>
                  <select
                    aria-label={`Explanation for ${item.phenomenon}`}
                    value={saved}
                    onChange={(e) => {
                      onUpdatePhenomena(item.id, e.target.value);
                      setCheckedPhenomena(false);
                    }}
                    className="min-h-[44px] rounded border border-[var(--outline)] bg-[var(--surface-container-low)] px-3 py-2 text-sm text-[var(--on-surface)]"
                  >
                    <option value="">Select scientific mechanism…</option>
                    {PHENOMENON_MECHANISMS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>

          {checkedPhenomena && (
            <div className="mt-4 rounded border border-[var(--outline-variant)] bg-[var(--background)] p-3 text-sm text-[var(--on-surface)]">
              <strong>Matches Correct: {phenomenaScore} / {PHENOMENON_ITEMS.length}.</strong>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
