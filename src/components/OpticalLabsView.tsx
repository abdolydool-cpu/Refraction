import React from 'react';
import type {
  BoundaryPresetId,
  ColorLabMode,
  FilterChoice,
  LensKind,
  PrismBeamType,
  RefLabMode,
  SyncedLabState,
} from '../shared/protocol';
import {
  BOUNDARY_PRESETS,
  channelsToColorName,
  colorNameToCssVar,
  computeRefraction,
  solveStackedFilters,
  solveSurfaceAppearance,
  type OpticalColorName,
} from '../utils/optics';

interface OpticalLabsViewProps {
  lab: SyncedLabState;
  onChangeLab: (patch: Partial<SyncedLabState>) => void;
}

const PRESET_LIST: { id: BoundaryPresetId; label: string }[] = [
  { id: 'air-glass', label: 'Air → Glass' },
  { id: 'glass-air', label: 'Glass → Air' },
  { id: 'air-water', label: 'Air → Water' },
  { id: 'water-air', label: 'Water → Air' },
  { id: 'water-glass', label: 'Water → Glass' },
  { id: 'glass-diamond', label: 'Glass → Diamond' },
];

const FILTER_OPTIONS: { id: FilterChoice; label: string }[] = [
  { id: 'none', label: 'Clear Glass' },
  { id: 'red', label: 'Red' },
  { id: 'green', label: 'Green' },
  { id: 'blue', label: 'Blue' },
  { id: 'yellow', label: 'Yellow' },
  { id: 'cyan', label: 'Cyan' },
  { id: 'magenta', label: 'Magenta' },
];

export const OpticalLabsView: React.FC<OpticalLabsViewProps> = ({ lab, onChangeLab }) => {
  const preset = BOUNDARY_PRESETS[lab.boundaryPreset] || BOUNDARY_PRESETS['air-glass'];
  const refRes = computeRefraction(preset.n1, preset.n2, lab.incAngle);

  // Geometric coordinates for Boundary SVG
  const cx = 300;
  const cy = 180;
  const len = 152;
  const theta1 = (lab.incAngle * Math.PI) / 180;
  const ix = cx - len * Math.sin(theta1);
  const iy = cy - len * Math.cos(theta1);
  const rx = cx + len * Math.sin(theta1);
  const ry = cy - len * Math.cos(theta1);
  const theta2 = refRes.refractedDeg !== null ? (refRes.refractedDeg * Math.PI) / 180 : Math.PI / 2;
  const tx = refRes.isTotalInternalReflection ? rx : cx + len * Math.sin(theta2);
  const ty = refRes.isTotalInternalReflection ? ry : cy + len * Math.cos(theta2);

  // Dynamic ray label positions (never overlap normal or clip off SVG)
  const incLabelX = Math.max(24, Math.min(240, ix + (cx - ix) * 0.35 - 48));
  const incLabelY = Math.max(46, Math.min(155, iy + (cy - iy) * 0.35));
  const refLabelX = refRes.isTotalInternalReflection
    ? Math.min(480, rx - 40)
    : Math.max(310, Math.min(480, cx + (tx - cx) * 0.55 + 12));
  const refLabelY = refRes.isTotalInternalReflection
    ? Math.max(54, ry + 20)
    : Math.max(205, Math.min(325, cy + (ty - cy) * 0.55));

  // Arcs
  const arcR = 46;
  const incArcPath =
    lab.incAngle > 2
      ? `M ${cx} ${cy - arcR} A ${arcR} ${arcR} 0 0 0 ${(cx - arcR * Math.sin(theta1)).toFixed(1)} ${(cy - arcR * Math.cos(theta1)).toFixed(1)}`
      : '';
  const refArcPath =
    !refRes.isTotalInternalReflection && (refRes.refractedDeg ?? 0) > 2
      ? `M ${cx} ${cy + arcR} A ${arcR} ${arcR} 0 0 0 ${(cx + arcR * Math.sin(theta2)).toFixed(1)} ${(cy + arcR * Math.cos(theta2)).toFixed(1)}`
      : '';

  // Wavefront ticks
  const incWavefronts: { x1: number; y1: number; x2: number; y2: number }[] = [];
  const refWavefronts: { x1: number; y1: number; x2: number; y2: number }[] = [];
  if (lab.showWavefronts) {
    for (let d = 32; d <= 128; d += 24) {
      const wx = cx - d * Math.sin(theta1);
      const wy = cy - d * Math.cos(theta1);
      const px = Math.cos(theta1) * 16;
      const py = -Math.sin(theta1) * 16;
      incWavefronts.push({ x1: wx - px, y1: wy - py, x2: wx + px, y2: wy + py });
    }
    if (!refRes.isTotalInternalReflection) {
      const step2 = Math.max(12, 24 * (preset.n1 / preset.n2));
      for (let d = step2; d <= 128; d += step2) {
        const wx = cx + d * Math.sin(theta2);
        const wy = cy + d * Math.cos(theta2);
        const px = Math.cos(theta2) * 16;
        const py = -Math.sin(theta2) * 16;
        refWavefronts.push({ x1: wx - px, y1: wy - py, x2: wx + px, y2: wy + py });
      }
    }
  }

  // Dynamic lens curvature (shorter focal length -> stronger curve / thicker lens)
  const lensCurveOffset = Math.round(78 - ((lab.lensFocal - 100) / 150) * 44);
  const focalX = 270 + lab.lensFocal;
  const virtualFocalX = 270 - lab.lensFocal;

  // Prism rays
  const prismSpectrum = [
    { key: 'red', name: 'Red', col: 'var(--spec-red)', yMid: 158, yOut: 92 },
    { key: 'orange', name: 'Orange', col: 'var(--spec-orange)', yMid: 163, yOut: 116 },
    { key: 'yellow', name: 'Yellow', col: 'var(--spec-yellow)', yMid: 168, yOut: 140 },
    { key: 'green', name: 'Green', col: 'var(--spec-green)', yMid: 173, yOut: 164 },
    { key: 'blue', name: 'Blue', col: 'var(--spec-blue)', yMid: 178, yOut: 188 },
    { key: 'indigo', name: 'Indigo', col: 'var(--spec-indigo)', yMid: 183, yOut: 212 },
    { key: 'violet', name: 'Violet', col: 'var(--spec-violet)', yMid: 188, yOut: 236 },
  ];

  // Stacked optical filter + gnome solver
  const midChannels = solveStackedFilters(lab.filter1, 'none');
  const outChannels = solveStackedFilters(lab.filter1, lab.filter2);
  const transmittedName = channelsToColorName(outChannels);
  const gnomeParts: { part: string; base: OpticalColorName }[] = [
    { part: 'Red Hat', base: 'Red' },
    { part: 'White Beard', base: 'White' },
    { part: 'Green Jacket', base: 'Green' },
    { part: 'Blue Jeans', base: 'Blue' },
    { part: 'Black Shoes', base: 'Black' },
  ];
  const gnomeSolved = gnomeParts.map((gp) => ({
    ...gp,
    observed: solveSurfaceAppearance(gp.base, outChannels),
  }));

  const rgbResult = channelsToColorName({ r: lab.rgbR, g: lab.rgbG, b: lab.rgbB });

  return (
    <main className="grid gap-6">
      {/* LAB 01: REFRACTION & LENSES */}
      <section className="rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container)] p-5 md:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-mono-label text-xs uppercase tracking-wider text-[var(--tertiary)]">
              Lab 01 · Geometric Optics
            </div>
            <h2 className="font-headline text-2xl font-medium text-[var(--on-surface)]">
              Refraction Ray Bench &amp; Lens Simulator
            </h2>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Refraction lab mode">
            {(['boundary', 'lens'] as RefLabMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onChangeLab({ refLabMode: m })}
                className={`font-mono-label min-h-[44px] whitespace-nowrap rounded border px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
                  lab.refLabMode === m
                    ? 'border-[var(--primary)] bg-[var(--primary-container)] text-[var(--primary)]'
                    : 'border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
                }`}
              >
                {m === 'boundary' ? 'Medium Boundary' : 'Convex & Concave Lenses'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.35fr_1fr]">
          {/* Left: SVG Stage */}
          <div className="rounded border border-[var(--outline-variant)] bg-[var(--background)] p-3">
            <svg
              viewBox="0 0 600 360"
              className="block h-auto w-full rounded bg-[var(--background)]"
              role="img"
              aria-label={
                lab.refLabMode === 'boundary'
                  ? `Refraction ray diagram from ${preset.short1} to ${preset.short2} at ${lab.incAngle} degrees`
                  : `${lab.lensKind} lens focal diagram at ${lab.lensFocal} millimetres`
              }
            >
              {lab.refLabMode === 'boundary' ? (
                <>
                  <rect x="0" y="0" width="600" height="180" fill={preset.fill1} />
                  <rect x="0" y="180" width="600" height="180" fill={preset.fill2} />
                  <line x1="0" y1="180" x2="600" y2="180" stroke="var(--outline)" strokeWidth="1.5" />
                  <line x1="300" y1="20" x2="300" y2="340" stroke="var(--on-surface-variant)" strokeWidth="1.5" strokeDasharray="6 5" />
                  <rect x="300" y="168" width="12" height="12" fill="none" stroke="var(--on-surface-variant)" strokeWidth="1" />

                  {incArcPath && <path d={incArcPath} fill="none" stroke="var(--primary)" strokeWidth="1.5" opacity="0.9" />}
                  {refArcPath && <path d={refArcPath} fill="none" stroke="var(--tertiary)" strokeWidth="1.5" opacity="0.9" />}

                  <g opacity="0.45">
                    {incWavefronts.map((w, idx) => (
                      <line key={`iwf-${idx}`} x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2} stroke="var(--primary)" strokeWidth="1.5" />
                    ))}
                    {refWavefronts.map((w, idx) => (
                      <line key={`rwf-${idx}`} x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2} stroke="var(--tertiary)" strokeWidth="1.5" />
                    ))}
                  </g>

                  {/* Incident Ray */}
                  <line x1={ix} y1={iy} x2={cx} y2={cy} stroke="var(--primary)" strokeWidth="3.2" strokeLinecap="round" />
                  <polygon
                    points="-6,-5 6,0 -6,5"
                    fill="var(--primary)"
                    transform={`translate(${((ix + cx) / 2).toFixed(1)},${((iy + cy) / 2).toFixed(1)}) rotate(${((Math.atan2(cy - iy, cx - ix) * 180) / Math.PI).toFixed(1)})`}
                  />

                  {/* Partial / Total Reflection */}
                  <line
                    x1={cx}
                    y1={cy}
                    x2={rx}
                    y2={ry}
                    stroke={refRes.isTotalInternalReflection ? 'var(--tertiary)' : 'var(--primary)'}
                    strokeWidth={refRes.isTotalInternalReflection ? '3.2' : '1.2'}
                    strokeDasharray={refRes.isTotalInternalReflection ? undefined : '4 4'}
                    opacity={refRes.isTotalInternalReflection ? 1 : 0.35}
                  />

                  {/* Refracted Ray */}
                  {!refRes.isTotalInternalReflection && (
                    <>
                      <line x1={cx} y1={cy} x2={tx} y2={ty} stroke="var(--tertiary)" strokeWidth="3.2" strokeLinecap="round" />
                      <polygon
                        points="-6,-5 6,0 -6,5"
                        fill="var(--tertiary)"
                        transform={`translate(${((cx + tx) / 2).toFixed(1)},${((cy + ty) / 2).toFixed(1)}) rotate(${((Math.atan2(ty - cy, tx - cx) * 180) / Math.PI).toFixed(1)})`}
                      />
                    </>
                  )}

                  <text x="18" y="26" fill="var(--on-surface)" fontSize="11" fontWeight="600" fontFamily="JetBrains Mono, monospace">
                    MEDIUM 1: {preset.name1}
                  </text>
                  <text x="18" y="344" fill="var(--on-surface)" fontSize="11" fontWeight="600" fontFamily="JetBrains Mono, monospace">
                    MEDIUM 2: {preset.name2}
                  </text>
                  <text x="308" y="32" fill="var(--on-surface-variant)" fontSize="11" fontFamily="JetBrains Mono, monospace">
                    NORMAL (90°)
                  </text>
                  <text x={incLabelX} y={incLabelY} fill="var(--primary)" fontSize="11" fontWeight="600" fontFamily="JetBrains Mono, monospace">
                    Incident ({lab.incAngle}°)
                  </text>
                  <text
                    x={refLabelX}
                    y={refLabelY}
                    fill="var(--tertiary)"
                    fontSize="11"
                    fontWeight="600"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {refRes.isTotalInternalReflection
                      ? `Reflected (TIR ${lab.incAngle}°)`
                      : `Refracted (${refRes.refractedDeg?.toFixed(1)}°)`}
                  </text>
                </>
              ) : (
                <>
                  <rect x="0" y="0" width="600" height="360" fill="var(--medium-air)" />
                  <line x1="20" y1="180" x2="580" y2="180" stroke="var(--on-surface-variant)" strokeWidth="1" strokeDasharray="6 5" />

                  {lab.lensKind === 'convex' ? (
                    <path
                      d={`M 270 50 Q ${270 + lensCurveOffset} 180 270 310 Q ${270 - lensCurveOffset} 180 270 50 Z`}
                      fill="var(--medium-glass)"
                      stroke="var(--medium-glass-stroke)"
                      strokeWidth="2"
                    />
                  ) : (
                    <path
                      d={`M ${270 - Math.round(lensCurveOffset * 0.45)} 50 Q 270 180 ${270 - Math.round(lensCurveOffset * 0.45)} 310 L ${270 + Math.round(lensCurveOffset * 0.45)} 310 Q 270 180 ${270 + Math.round(lensCurveOffset * 0.45)} 50 Z`}
                      fill="var(--medium-glass)"
                      stroke="var(--medium-glass-stroke)"
                      strokeWidth="2"
                    />
                  )}

                  {[85, 130, 180, 230, 275].map((y) => {
                    const endX = 570;
                    if (lab.lensKind === 'convex') {
                      const slope = (180 - y) / (focalX - 270);
                      const endY = y + slope * (endX - 270);
                      return (
                        <g key={y}>
                          <line x1="25" y1={y} x2="270" y2={y} stroke="var(--primary)" strokeWidth="2.5" />
                          <line x1="270" y1={y} x2={endX} y2={endY.toFixed(1)} stroke="var(--tertiary)" strokeWidth="2.5" />
                        </g>
                      );
                    }
                    // Concave: diverges from virtual focal point behind lens
                    const slope = (y - 180) / (270 - virtualFocalX);
                    const endY = y + slope * (endX - 270);
                    return (
                      <g key={y}>
                        <line x1="25" y1={y} x2="270" y2={y} stroke="var(--primary)" strokeWidth="2.5" />
                        <line x1={virtualFocalX} y1="180" x2="270" y2={y} stroke="var(--tertiary)" strokeWidth="1" strokeDasharray="4 4" opacity="0.55" />
                        <line x1="270" y1={y} x2={endX} y2={endY.toFixed(1)} stroke="var(--tertiary)" strokeWidth="2.5" />
                      </g>
                    );
                  })}

                  <circle cx={lab.lensKind === 'convex' ? focalX : virtualFocalX} cy="180" r="5" fill="var(--primary)" />
                  <text
                    x={lab.lensKind === 'convex' ? focalX : virtualFocalX}
                    y="204"
                    textAnchor="middle"
                    fill="var(--on-surface)"
                    fontSize="11"
                    fontWeight="600"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {lab.lensKind === 'convex' ? `Focal Point F (${lab.lensFocal} mm)` : `Virtual Focus F (-${lab.lensFocal} mm)`}
                  </text>
                  <text x="270" y="34" textAnchor="middle" fill="var(--on-surface)" fontSize="11" fontWeight="600" fontFamily="JetBrains Mono, monospace">
                    {lab.lensKind === 'convex' ? 'CONVEX (CONVERGING) LENS' : 'CONCAVE (DIVERGING) LENS'}
                  </text>
                </>
              )}
            </svg>
          </div>

          {/* Right: Controls & Readouts */}
          <div className="grid gap-4">
            {lab.refLabMode === 'boundary' ? (
              <>
                <div>
                  <span className="font-mono-label mb-2 block text-xs uppercase tracking-wider text-[var(--on-surface-variant)]">
                    Medium Boundary Preset
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_LIST.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onChangeLab({ boundaryPreset: p.id })}
                        className={`font-mono-label min-h-[40px] whitespace-nowrap rounded border px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${
                          lab.boundaryPreset === p.id
                            ? 'border-[var(--primary)] bg-[var(--primary-container)] text-[var(--primary)]'
                            : 'border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-baseline justify-between">
                    <label
                      htmlFor="slider-incidence"
                      className="font-mono-label text-xs uppercase tracking-wider text-[var(--on-surface-variant)]"
                    >
                      Angle of Incidence (θᵢ)
                    </label>
                    <span className="font-mono-label text-sm font-semibold text-[var(--primary)]" data-testid="readout-inc-angle">
                      {lab.incAngle}°
                    </span>
                  </div>
                  <input
                    id="slider-incidence"
                    type="range"
                    min={0}
                    max={80}
                    value={lab.incAngle}
                    onChange={(e) => onChangeLab({ incAngle: Number(e.target.value) })}
                    className="h-7 w-full cursor-pointer"
                  />
                </div>

                <label className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 text-sm text-[var(--on-surface)]">
                  <input
                    type="checkbox"
                    checked={lab.showWavefronts}
                    onChange={(e) => onChangeLab({ showWavefronts: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <span>Show wavefronts (car-in-mud analogy)</span>
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded border border-[var(--outline-variant)] bg-[var(--background)] p-3">
                    <div className="font-mono-label text-xs uppercase text-[var(--tertiary)]">Angle of Incidence</div>
                    <div className="font-mono-label mt-1 text-base font-semibold text-[var(--on-surface)]">
                      {lab.incAngle.toFixed(1)}°
                    </div>
                  </div>
                  <div className="rounded border border-[var(--outline-variant)] bg-[var(--background)] p-3">
                    <div className="font-mono-label text-xs uppercase text-[var(--tertiary)]">Angle of Refraction</div>
                    <div className="font-mono-label mt-1 text-base font-semibold text-[var(--on-surface)]" data-testid="tel-refracted">
                      {refRes.isTotalInternalReflection ? 'TIR (Reflected)' : `${refRes.refractedDeg?.toFixed(1)}°`}
                    </div>
                  </div>
                  <div className="rounded border border-[var(--outline-variant)] bg-[var(--background)] p-3">
                    <div className="font-mono-label text-xs uppercase text-[var(--tertiary)]">Wave Speed</div>
                    <div className="font-mono-label mt-1 text-base font-semibold text-[var(--on-surface)]" data-testid="tel-speed">
                      {refRes.speedChange === 'slows' ? 'Slows down' : refRes.speedChange === 'speeds' ? 'Speeds up' : 'Unchanged'}
                    </div>
                  </div>
                  <div className="rounded border border-[var(--outline-variant)] bg-[var(--background)] p-3">
                    <div className="font-mono-label text-xs uppercase text-[var(--tertiary)]">Direction vs Normal</div>
                    <div className="font-mono-label mt-1 text-base font-semibold text-[var(--on-surface)]" data-testid="tel-bend">
                      {refRes.bendDirection === 'towards'
                        ? 'Towards Normal'
                        : refRes.bendDirection === 'away'
                        ? 'Away from Normal'
                        : refRes.bendDirection === 'tir'
                        ? 'Total Internal Refl.'
                        : 'Straight through'}
                    </div>
                  </div>
                </div>

                <div className="rounded border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-3 text-sm text-[var(--on-surface)]">
                  {lab.incAngle === 0 ? (
                    <>At <strong>0° to the normal</strong> (90° to the boundary), the light ray passes straight through without bending, even though its speed changes.</>
                  ) : refRes.isTotalInternalReflection ? (
                    <>
                      Above the critical angle ({refRes.criticalAngleDeg?.toFixed(1)}°) inside {preset.short1.toLowerCase()}, light undergoes <strong>Total Internal Reflection</strong> — the principle behind optical fibres and diamond sparkle.
                    </>
                  ) : refRes.speedChange === 'slows' ? (
                    <>
                      Entering denser {preset.short2.toLowerCase()} (n = {preset.n2.toFixed(2)}) slows light down and bends it <strong>towards the normal</strong> ({lab.incAngle}° → {refRes.refractedDeg?.toFixed(1)}°).
                    </>
                  ) : (
                    <>
                      Entering less dense {preset.short2.toLowerCase()} (n = {preset.n2.toFixed(2)}) speeds light up and bends it <strong>away from the normal</strong> ({lab.incAngle}° → {refRes.refractedDeg?.toFixed(1)}°).
                      {refRes.criticalAngleDeg && ` Critical angle: ${refRes.criticalAngleDeg.toFixed(1)}°.`}
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="font-mono-label mb-2 block text-xs uppercase tracking-wider text-[var(--on-surface-variant)]">
                    Lens Shape
                  </span>
                  <div className="flex gap-2">
                    {(['convex', 'concave'] as LensKind[]).map((lk) => (
                      <button
                        key={lk}
                        type="button"
                        onClick={() => onChangeLab({ lensKind: lk })}
                        className={`font-mono-label min-h-[44px] flex-1 whitespace-nowrap rounded border px-3 py-2 text-xs uppercase tracking-wider ${
                          lab.lensKind === lk
                            ? 'border-[var(--primary)] bg-[var(--primary-container)] text-[var(--primary)]'
                            : 'border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--on-surface-variant)]'
                        }`}
                      >
                        {lk === 'convex' ? 'Convex (Converging)' : 'Concave (Diverging)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-baseline justify-between">
                    <label
                      htmlFor="slider-lens-focal"
                      className="font-mono-label text-xs uppercase tracking-wider text-[var(--on-surface-variant)]"
                    >
                      Focal Length (Shorter = Thicker / More Curved)
                    </label>
                    <span className="font-mono-label text-sm font-semibold text-[var(--primary)]">
                      f = {lab.lensFocal} mm
                    </span>
                  </div>
                  <input
                    id="slider-lens-focal"
                    type="range"
                    min={100}
                    max={250}
                    value={lab.lensFocal}
                    onChange={(e) => onChangeLab({ lensFocal: Number(e.target.value) })}
                    className="h-7 w-full cursor-pointer"
                  />
                </div>

                <div className="rounded border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-3 text-sm text-[var(--on-surface)]">
                  {lab.lensKind === 'convex' ? (
                    <>
                      <strong>Convex (Converging) Lens:</strong> Thicker in the middle. Parallel rays refract inwards twice to meet at Focal Point F. More curved lenses have a shorter focal length.
                    </>
                  ) : (
                    <>
                      <strong>Concave (Diverging) Lens:</strong> Thinner in the middle. Spreads parallel rays outwards as if coming from a virtual focus F behind the lens — used to correct short-sightedness.
                    </>
                  )}
                </div>

                <div className="rounded border border-[var(--outline-variant)] bg-[var(--background)] p-3 text-sm">
                  <div className="font-mono-label mb-1.5 text-xs uppercase tracking-wider text-[var(--tertiary)]">
                    Curriculum Lens Uses
                  </div>
                  <ul className="list-disc space-y-1 pl-5 text-[var(--on-surface-variant)]">
                    <li><strong className="text-[var(--on-surface)]">Magnifying glass:</strong> enlarges close specimens</li>
                    <li><strong className="text-[var(--on-surface)]">Camera lens:</strong> focuses crisp images onto the sensor</li>
                    <li><strong className="text-[var(--on-surface)]">Human eye &amp; glasses:</strong> focuses light onto the retina</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* LAB 02: PRISM DISPERSION, RGB MIXING & DOUBLE FILTERS */}
      <section className="rounded-md border border-[var(--outline-variant)] bg-[var(--surface-container)] p-5 md:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-mono-label text-xs uppercase tracking-wider text-[var(--tertiary)]">
              Lab 02 · Dispersion, RGB &amp; Selective Transmission
            </div>
            <h2 className="font-headline text-2xl font-medium text-[var(--on-surface)]">
              Prism, RGB Mixer &amp; Double-Filter Bench
            </h2>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Colour lab mode">
            {([
              { id: 'prism', label: '1. Prism Dispersion' },
              { id: 'rgb', label: '2. RGB Light Mixing' },
              { id: 'filter', label: '3. Optical Filters & Gnome' },
            ] as { id: ColorLabMode; label: string }[]).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onChangeLab({ colorLabMode: m.id })}
                className={`font-mono-label min-h-[44px] whitespace-nowrap rounded border px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
                  lab.colorLabMode === m.id
                    ? 'border-[var(--primary)] bg-[var(--primary-container)] text-[var(--primary)]'
                    : 'border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-lab 1: Prism */}
        {lab.colorLabMode === 'prism' && (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.35fr_1fr]">
            <div className="rounded border border-[var(--outline-variant)] bg-[var(--background)] p-3">
              <svg viewBox="0 0 600 320" className="block h-auto w-full rounded bg-[var(--background)]" role="img" aria-label="Triangular prism dispersion">
                <line
                  x1="25"
                  y1="175"
                  x2="225"
                  y2="145"
                  stroke={lab.prismBeam === 'white' ? 'var(--spec-white)' : `var(--spec-${lab.prismBeam})`}
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <polygon points="180,255 295,60 410,255" fill="var(--medium-glass)" stroke="var(--medium-glass-stroke)" strokeWidth="2" />
                {prismSpectrum
                  .filter((c) => lab.prismBeam === 'white' || lab.prismBeam === c.key)
                  .map((c) => {
                    const exitX = 354 + (c.yMid - 158) * 0.45;
                    return (
                      <g key={c.key}>
                        <line x1="225" y1="145" x2={exitX.toFixed(1)} y2={c.yMid} stroke={c.col} strokeWidth={lab.prismBeam === 'white' ? 3 : 5} opacity="0.9" />
                        <line x1={exitX.toFixed(1)} y1={c.yMid} x2="518" y2={c.yOut} stroke={c.col} strokeWidth={lab.prismBeam === 'white' ? 4 : 6} strokeLinecap="round" />
                        <text x="540" y={c.yOut + 4} fill="var(--on-surface)" fontSize="11" fontWeight="600" fontFamily="JetBrains Mono, monospace">
                          {c.name}
                        </text>
                      </g>
                    );
                  })}
                <rect x="518" y="45" width="14" height="230" fill="var(--surface-container-high)" stroke="var(--outline)" rx="2" />
                <text x="525" y="34" textAnchor="middle" fill="var(--on-surface-variant)" fontSize="11" fontFamily="JetBrains Mono, monospace">
                  SCREEN
                </text>
                <text x="112" y="135" fill="var(--on-surface)" fontSize="11" fontWeight="600" fontFamily="JetBrains Mono, monospace">
                  {lab.prismBeam === 'white' ? 'White Light' : `${lab.prismBeam.toUpperCase()} Light`}
                </text>
                <text x="295" y="278" textAnchor="middle" fill="var(--on-surface-variant)" fontSize="11" fontFamily="JetBrains Mono, monospace">
                  GLASS TRIANGULAR PRISM
                </text>
              </svg>
            </div>

            <div className="grid gap-4">
              <div>
                <span className="font-mono-label mb-2 block text-xs uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Select Source Beam
                </span>
                <div className="flex flex-wrap gap-2">
                  {(['white', 'red', 'green', 'violet'] as PrismBeamType[]).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => onChangeLab({ prismBeam: b })}
                      className={`font-mono-label min-h-[42px] whitespace-nowrap rounded border px-3 py-1.5 text-xs uppercase tracking-wider ${
                        lab.prismBeam === b
                          ? 'border-[var(--primary)] bg-[var(--primary-container)] text-[var(--primary)]'
                          : 'border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--on-surface-variant)]'
                      }`}
                    >
                      {b === 'white' ? 'White Light' : `${b} Only`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded border border-[var(--outline-variant)] bg-[var(--background)] p-3">
                  <div className="font-mono-label text-xs uppercase text-[var(--tertiary)]">Longest Wavelength</div>
                  <div className="font-mono-label mt-1 text-sm font-semibold text-[var(--spec-red)]">Red (bends least)</div>
                </div>
                <div className="rounded border border-[var(--outline-variant)] bg-[var(--background)] p-3">
                  <div className="font-mono-label text-xs uppercase text-[var(--tertiary)]">Slowest in Prism</div>
                  <div className="font-mono-label mt-1 text-sm font-semibold text-[var(--spec-violet)]">Violet (bends most)</div>
                </div>
              </div>

              <div className="rounded border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-3 text-sm text-[var(--on-surface)]">
                {lab.prismBeam === 'white'
                  ? 'Dispersion: White light mixes 7 colours (ROYGBIV). Violet slows down most in glass and refracts more sharply than red, fanning out the visible spectrum.'
                  : lab.prismBeam === 'red'
                  ? 'Monochromatic Red Light: Longest visible wavelength, bends the least, and does not split into further colours.'
                  : lab.prismBeam === 'violet'
                  ? 'Monochromatic Violet Light: Shortest visible wavelength, travels slowest in glass, and refracts the most.'
                  : 'Monochromatic Green Light: Sits at the centre of the visible spectrum and refracts at a single angle.'}
              </div>
            </div>
          </div>
        )}

        {/* Sub-lab 2: RGB Additive Mixer */}
        {lab.colorLabMode === 'rgb' && (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.35fr_1fr]">
            <div className="rounded border border-[var(--outline-variant)] bg-[var(--background)] p-3">
              <svg viewBox="0 0 600 320" className="block h-auto w-full rounded bg-[var(--spec-black)]" role="img" aria-label="Additive RGB overlap">
                <rect x="0" y="0" width="600" height="320" fill="var(--spec-black)" />
                <g style={{ isolation: 'isolate' }}>
                  <circle cx="255" cy="130" r="88" fill="var(--spec-red)" opacity={lab.rgbR ? 0.95 : 0.08} style={{ mixBlendMode: 'screen' }} />
                  <circle cx="345" cy="130" r="88" fill="var(--spec-green)" opacity={lab.rgbG ? 0.95 : 0.08} style={{ mixBlendMode: 'screen' }} />
                  <circle cx="300" cy="205" r="88" fill="var(--spec-blue)" opacity={lab.rgbB ? 0.95 : 0.08} style={{ mixBlendMode: 'screen' }} />
                </g>
                <text x="200" y="95" textAnchor="middle" fill="var(--on-surface)" fontSize="11" fontWeight="600" fontFamily="JetBrains Mono, monospace">RED</text>
                <text x="400" y="95" textAnchor="middle" fill="var(--on-surface)" fontSize="11" fontWeight="600" fontFamily="JetBrains Mono, monospace">GREEN</text>
                <text x="300" y="275" textAnchor="middle" fill="var(--on-surface)" fontSize="11" fontWeight="600" fontFamily="JetBrains Mono, monospace">BLUE</text>
                <text x="300" y="108" textAnchor="middle" fill="var(--on-surface)" fontSize="11" fontWeight="600" opacity={lab.rgbR && lab.rgbG ? 1 : 0.15} fontFamily="JetBrains Mono, monospace">Yellow</text>
                <text x="235" y="190" textAnchor="middle" fill="var(--on-surface)" fontSize="11" fontWeight="600" opacity={lab.rgbR && lab.rgbB ? 1 : 0.15} fontFamily="JetBrains Mono, monospace">Magenta</text>
                <text x="365" y="190" textAnchor="middle" fill="var(--on-surface)" fontSize="11" fontWeight="600" opacity={lab.rgbG && lab.rgbB ? 1 : 0.15} fontFamily="JetBrains Mono, monospace">Cyan</text>
                <text x="300" y="160" textAnchor="middle" fill="var(--on-surface)" fontSize="11" fontWeight="600" opacity={lab.rgbR && lab.rgbG && lab.rgbB ? 1 : 0.15} fontFamily="JetBrains Mono, monospace">White</text>
              </svg>
            </div>

            <div className="grid gap-4">
              <div>
                <span className="font-mono-label mb-2 block text-xs uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Toggle Primary Light Beams (Cone Cells)
                </span>
                <div className="flex flex-wrap gap-4">
                  <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 text-sm">
                    <input type="checkbox" checked={lab.rgbR} onChange={(e) => onChangeLab({ rgbR: e.target.checked })} className="h-4 w-4" />
                    <span>Red Light</span>
                  </label>
                  <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 text-sm">
                    <input type="checkbox" checked={lab.rgbG} onChange={(e) => onChangeLab({ rgbG: e.target.checked })} className="h-4 w-4" />
                    <span>Green Light</span>
                  </label>
                  <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 text-sm">
                    <input type="checkbox" checked={lab.rgbB} onChange={(e) => onChangeLab({ rgbB: e.target.checked })} className="h-4 w-4" />
                    <span>Blue Light</span>
                  </label>
                </div>
              </div>

              <div className="rounded border border-[var(--outline-variant)] bg-[var(--background)] p-3">
                <div className="font-mono-label text-xs uppercase text-[var(--tertiary)]">Centre Overlap Result</div>
                <div className="font-mono-label mt-1 text-base font-semibold text-[var(--on-surface)]" data-testid="rgb-result">
                  {rgbResult}
                </div>
              </div>

              <div className="rounded border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-3 text-sm text-[var(--on-surface)]">
                <strong>Light (RGB) vs. Paint (RYB):</strong> Digital screens and spotlights mix Red, Green, and Blue light matching the 3 types of cone cells in the retina. Combining two creates Yellow (R+G), Cyan (G+B), and Magenta (R+B).
              </div>
            </div>
          </div>
        )}

        {/* Sub-lab 3: Single or Stacked Double Optical Filters & Gnome */}
        {lab.colorLabMode === 'filter' && (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.35fr_1fr]">
            <div className="rounded border border-[var(--outline-variant)] bg-[var(--background)] p-3">
              <svg viewBox="0 0 600 330" className="block h-auto w-full rounded bg-[var(--background)]" role="img" aria-label="Optical filters and garden gnome appearance">
                <rect x="18" y="135" width="54" height="44" rx="4" fill="var(--surface-container-high)" stroke="var(--outline)" />
                <text x="45" y="161" textAnchor="middle" fill="var(--on-surface)" fontSize="11" fontWeight="600" fontFamily="JetBrains Mono, monospace">
                  TORCH
                </text>

                {/* White light RGB rays entering Filter 1 */}
                <line x1="72" y1="142" x2="178" y2="115" stroke="var(--spec-red)" strokeWidth="4" />
                <line x1="72" y1="157" x2="178" y2="157" stroke="var(--spec-green)" strokeWidth="4" />
                <line x1="72" y1="172" x2="178" y2="199" stroke="var(--spec-blue)" strokeWidth="4" />

                {/* Filter 1 */}
                <rect
                  x="178"
                  y="65"
                  width="20"
                  height="190"
                  rx="3"
                  fill={lab.filter1 === 'none' ? 'var(--medium-glass)' : `var(--spec-${lab.filter1})`}
                  opacity="0.65"
                  stroke="var(--on-surface)"
                  strokeWidth="1.5"
                />
                <text x="188" y="52" textAnchor="middle" fill="var(--on-surface)" fontSize="10" fontWeight="600" fontFamily="JetBrains Mono, monospace">
                  F1: {lab.filter1.toUpperCase()}
                </text>

                {/* Rays between Filter 1 and Filter 2 */}
                {midChannels.r && <line x1="198" y1="115" x2="296" y2="115" stroke="var(--spec-red)" strokeWidth="4" />}
                {midChannels.g && <line x1="198" y1="157" x2="296" y2="157" stroke="var(--spec-green)" strokeWidth="4" />}
                {midChannels.b && <line x1="198" y1="199" x2="296" y2="199" stroke="var(--spec-blue)" strokeWidth="4" />}

                {/* Filter 2 */}
                <rect
                  x="296"
                  y="65"
                  width="20"
                  height="190"
                  rx="3"
                  fill={lab.filter2 === 'none' ? 'var(--medium-glass)' : `var(--spec-${lab.filter2})`}
                  opacity="0.65"
                  stroke="var(--on-surface)"
                  strokeWidth="1.5"
                />
                <text x="306" y="52" textAnchor="middle" fill="var(--on-surface)" fontSize="10" fontWeight="600" fontFamily="JetBrains Mono, monospace">
                  F2: {lab.filter2 === 'none' ? 'CLEAR' : lab.filter2.toUpperCase()}
                </text>

                {/* Transmitted rays hitting Gnome */}
                {outChannels.r && <line x1="316" y1="115" x2="465" y2="105" stroke="var(--spec-red)" strokeWidth="4" />}
                {outChannels.g && <line x1="316" y1="157" x2="465" y2="165" stroke="var(--spec-green)" strokeWidth="4" />}
                {outChannels.b && <line x1="316" y1="199" x2="465" y2="235" stroke="var(--spec-blue)" strokeWidth="4" />}

                {/* Garden Gnome */}
                <g transform="translate(455, 50)">
                  <polygon points="45,10 15,78 75,78" fill={colorNameToCssVar(gnomeSolved[0].observed)} stroke="var(--outline)" strokeWidth="1.5" />
                  <circle cx="45" cy="96" r="22" fill="var(--on-primary-container)" stroke="var(--outline)" strokeWidth="1" />
                  <polygon points="22,98 68,98 45,146" fill={colorNameToCssVar(gnomeSolved[1].observed)} stroke="var(--outline)" strokeWidth="1.5" />
                  <rect x="18" y="132" width="54" height="58" rx="6" fill={colorNameToCssVar(gnomeSolved[2].observed)} stroke="var(--outline)" strokeWidth="1.5" />
                  <rect x="22" y="190" width="20" height="45" fill={colorNameToCssVar(gnomeSolved[3].observed)} stroke="var(--outline)" strokeWidth="1.5" />
                  <rect x="48" y="190" width="20" height="45" fill={colorNameToCssVar(gnomeSolved[3].observed)} stroke="var(--outline)" strokeWidth="1.5" />
                  <rect x="15" y="235" width="28" height="14" rx="4" fill={colorNameToCssVar(gnomeSolved[4].observed)} stroke="var(--outline)" strokeWidth="1.5" />
                  <rect x="47" y="235" width="28" height="14" rx="4" fill={colorNameToCssVar(gnomeSolved[4].observed)} stroke="var(--outline)" strokeWidth="1.5" />
                </g>

                <text x="500" y="315" textAnchor="middle" fill="var(--on-surface)" fontSize="11" fontWeight="600" fontFamily="JetBrains Mono, monospace">
                  Light Reaching Gnome: {transmittedName}
                </text>
              </svg>
            </div>

            <div className="grid gap-4">
              <div>
                <span className="font-mono-label mb-1.5 block text-xs uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Filter 1 (Primary or Secondary)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {FILTER_OPTIONS.map((f) => (
                    <button
                      key={`f1-${f.id}`}
                      type="button"
                      onClick={() => onChangeLab({ filter1: f.id })}
                      className={`font-mono-label min-h-[38px] whitespace-nowrap rounded border px-2.5 py-1 text-xs uppercase ${
                        lab.filter1 === f.id
                          ? 'border-[var(--primary)] bg-[var(--primary-container)] text-[var(--primary)]'
                          : 'border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--on-surface-variant)]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-mono-label mb-1.5 block text-xs uppercase tracking-wider text-[var(--on-surface-variant)]">
                  Filter 2 (Stack a Second Filter)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {FILTER_OPTIONS.map((f) => (
                    <button
                      key={`f2-${f.id}`}
                      type="button"
                      onClick={() => onChangeLab({ filter2: f.id })}
                      className={`font-mono-label min-h-[38px] whitespace-nowrap rounded border px-2.5 py-1 text-xs uppercase ${
                        lab.filter2 === f.id
                          ? 'border-[var(--tertiary)] bg-[rgba(124,196,232,0.14)] text-[var(--tertiary)]'
                          : 'border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--on-surface-variant)]'
                      }`}
                    >
                      {f.id === 'none' ? 'No 2nd Filter' : f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded border border-[var(--outline-variant)] bg-[var(--background)] p-3 text-sm">
                <div className="font-mono-label mb-2 text-xs uppercase tracking-wider text-[var(--tertiary)]">
                  Part-by-Part Appearance ({transmittedName} Light)
                </div>
                <div className="space-y-1">
                  {gnomeSolved.map((g) => (
                    <div key={g.part} className="flex items-center justify-between">
                      <span className="text-[var(--on-surface-variant)]">{g.part}:</span>
                      <span className="font-mono-label font-semibold text-[var(--on-surface)]">{g.observed}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};
