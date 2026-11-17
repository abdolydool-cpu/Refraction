import React from 'react';
import type { QuestionDiagram } from '../data/curriculum';
import { BOUNDARY_PRESETS, computeRefraction } from '../utils/optics';

interface QuizDiagramProps {
  diagram: QuestionDiagram;
}

export const QuizDiagram: React.FC<QuizDiagramProps> = ({ diagram }) => {
  if (diagram.kind === 'boundary') {
    const preset = BOUNDARY_PRESETS[diagram.preset];
    const res = computeRefraction(preset.n1, preset.n2, diagram.angle);
    const theta1 = (diagram.angle * Math.PI) / 180;
    const cx = 180;
    const cy = 90;
    const len = 76;
    const ix = cx - len * Math.sin(theta1);
    const iy = cy - len * Math.cos(theta1);
    const rx = cx + len * Math.sin(theta1);
    const ry = cy - len * Math.cos(theta1);
    const theta2 = res.refractedDeg !== null ? (res.refractedDeg * Math.PI) / 180 : 0;
    const tx = cx + len * Math.sin(theta2);
    const ty = cy + len * Math.cos(theta2);

    return (
      <div className="rounded border border-[var(--outline-variant)] bg-[var(--background)] p-2">
        <svg viewBox="0 0 360 180" className="mx-auto block max-h-44 w-full" role="img" aria-label={`Ray diagram ${preset.short1} to ${preset.short2}`}>
          <rect x="0" y="0" width="360" height="90" fill={preset.fill1} />
          <rect x="0" y="90" width="360" height="90" fill={preset.fill2} />
          <line x1="0" y1="90" x2="360" y2="90" stroke="var(--outline)" strokeWidth="1.5" />
          <line x1={cx} y1="10" x2={cx} y2="170" stroke="var(--on-surface-variant)" strokeDasharray="4 4" strokeWidth="1.2" />
          <line x1={ix} y1={iy} x2={cx} y2={cy} stroke="var(--primary)" strokeWidth="2.5" />
          {res.isTotalInternalReflection ? (
            <line x1={cx} y1={cy} x2={rx} y2={ry} stroke="var(--tertiary)" strokeWidth="2.5" />
          ) : (
            <line x1={cx} y1={cy} x2={tx} y2={ty} stroke="var(--tertiary)" strokeWidth="2.5" />
          )}
          <text x="12" y="20" fill="var(--on-surface)" fontSize="10" fontFamily="JetBrains Mono, monospace">
            {preset.name1}
          </text>
          <text x="12" y="168" fill="var(--on-surface)" fontSize="10" fontFamily="JetBrains Mono, monospace">
            {preset.name2}
          </text>
          <text x={cx + 8} y="20" fill="var(--on-surface-variant)" fontSize="9" fontFamily="JetBrains Mono, monospace">
            Normal (90°)
          </text>
          <text x={ix - 4} y={iy + 14} fill="var(--primary)" fontSize="10" fontFamily="JetBrains Mono, monospace">
            θᵢ = {diagram.angle}°
          </text>
        </svg>
      </div>
    );
  }

  if (diagram.kind === 'prism') {
    const rays = [
      { key: 'red', yMid: 85, yOut: 45, col: 'var(--spec-red)', label: 'Red' },
      { key: 'orange', yMid: 88, yOut: 58, col: 'var(--spec-orange)', label: 'Orange' },
      { key: 'yellow', yMid: 91, yOut: 71, col: 'var(--spec-yellow)', label: 'Yellow' },
      { key: 'green', yMid: 94, yOut: 84, col: 'var(--spec-green)', label: 'Green' },
      { key: 'blue', yMid: 97, yOut: 97, col: 'var(--spec-blue)', label: 'Blue' },
      { key: 'indigo', yMid: 100, yOut: 110, col: 'var(--spec-indigo)', label: 'Indigo' },
      { key: 'violet', yMid: 103, yOut: 123, col: 'var(--spec-violet)', label: 'Violet' },
    ];
    const showAll = diagram.highlight !== 'red' && diagram.highlight !== 'violet';
    return (
      <div className="rounded border border-[var(--outline-variant)] bg-[var(--background)] p-2">
        <svg viewBox="0 0 360 160" className="mx-auto block max-h-40 w-full" role="img" aria-label="Prism dispersion diagram">
          <line
            x1="20"
            y1="95"
            x2="132"
            y2="78"
            stroke={diagram.highlight === 'red' ? 'var(--spec-red)' : 'var(--spec-white)'}
            strokeWidth="3.5"
          />
          <polygon points="105,135 170,25 235,135" fill="var(--medium-glass)" stroke="var(--medium-glass-stroke)" strokeWidth="1.5" />
          {rays
            .filter((r) => showAll || r.key === diagram.highlight)
            .map((r) => {
              const ex = 205 + (r.yMid - 85) * 0.4;
              return (
                <g key={r.key}>
                  <line x1="132" y1="78" x2={ex} y2={r.yMid} stroke={r.col} strokeWidth="2.2" />
                  <line x1={ex} y1={r.yMid} x2="310" y2={r.yOut} stroke={r.col} strokeWidth="2.5" />
                  <text x="316" y={r.yOut + 3} fill="var(--on-surface)" fontSize="9" fontFamily="JetBrains Mono, monospace">
                    {r.label}
                  </text>
                </g>
              );
            })}
        </svg>
      </div>
    );
  }

  if (diagram.kind === 'filter-stack') {
    const colorCss = (f: string) => (f === 'none' ? 'var(--medium-glass)' : `var(--spec-${f})`);
    return (
      <div className="rounded border border-[var(--outline-variant)] bg-[var(--background)] p-2">
        <svg viewBox="0 0 360 130" className="mx-auto block max-h-36 w-full" role="img" aria-label={`Stacked optical filters ${diagram.f1} and ${diagram.f2}`}>
          <rect x="15" y="45" width="44" height="40" rx="3" fill="var(--surface-container-high)" stroke="var(--outline)" />
          <text x="37" y="69" textAnchor="middle" fill="var(--on-surface)" fontSize="9" fontFamily="JetBrains Mono, monospace">
            WHITE
          </text>
          <line x1="59" y1="53" x2="128" y2="53" stroke="var(--spec-red)" strokeWidth="2.5" />
          <line x1="59" y1="65" x2="128" y2="65" stroke="var(--spec-green)" strokeWidth="2.5" />
          <line x1="59" y1="77" x2="128" y2="77" stroke="var(--spec-blue)" strokeWidth="2.5" />

          <rect x="130" y="25" width="16" height="80" rx="2" fill={colorCss(diagram.f1)} opacity="0.7" stroke="var(--on-surface)" />
          <text x="138" y="16" textAnchor="middle" fill="var(--on-surface)" fontSize="9" fontFamily="JetBrains Mono, monospace">
            {diagram.f1.toUpperCase()}
          </text>

          <line x1="146" y1="65" x2="220" y2="65" stroke="var(--on-surface-variant)" strokeDasharray="3 3" strokeWidth="1.5" />

          <rect x="220" y="25" width="16" height="80" rx="2" fill={colorCss(diagram.f2)} opacity="0.7" stroke="var(--on-surface)" />
          <text x="228" y="16" textAnchor="middle" fill="var(--on-surface)" fontSize="9" fontFamily="JetBrains Mono, monospace">
            {diagram.f2.toUpperCase()}
          </text>

          <text x="292" y="69" textAnchor="middle" fill="var(--primary)" fontSize="11" fontFamily="JetBrains Mono, monospace">
            ? Screen
          </text>
        </svg>
      </div>
    );
  }

  // Lens diagram
  const isConvex = diagram.lensKind === 'convex';
  return (
    <div className="rounded border border-[var(--outline-variant)] bg-[var(--background)] p-2">
      <svg viewBox="0 0 360 140" className="mx-auto block max-h-36 w-full" role="img" aria-label={`${diagram.lensKind} lens diagram`}>
        <line x1="15" y1="70" x2="345" y2="70" stroke="var(--on-surface-variant)" strokeDasharray="4 4" strokeWidth="1" />
        {isConvex ? (
          <path d="M 165 20 Q 195 70 165 120 Q 135 70 165 20 Z" fill="var(--medium-glass)" stroke="var(--medium-glass-stroke)" strokeWidth="1.5" />
        ) : (
          <path d="M 148 20 Q 165 70 148 120 L 182 120 Q 165 70 182 20 Z" fill="var(--medium-glass)" stroke="var(--medium-glass-stroke)" strokeWidth="1.5" />
        )}
        {[35, 52, 88, 105].map((y) => {
          const endY = isConvex ? 70 + ((70 - y) / 95) * -70 : y + (y - 70) * 0.9;
          return (
            <g key={y}>
              <line x1="25" y1={y} x2="165" y2={y} stroke="var(--primary)" strokeWidth="2" />
              <line x1="165" y1={y} x2="325" y2={isConvex ? (y < 70 ? 70 + (70 - y) * 0.65 : 70 - (y - 70) * 0.65) : endY} stroke="var(--tertiary)" strokeWidth="2" />
            </g>
          );
        })}
        {isConvex && <circle cx="262" cy="70" r="4" fill="var(--primary)" />}
        <text x="165" y="14" textAnchor="middle" fill="var(--on-surface)" fontSize="9" fontFamily="JetBrains Mono, monospace">
          {isConvex ? 'CONVEX (CONVERGING)' : 'CONCAVE (DIVERGING)'}
        </text>
      </svg>
    </div>
  );
};
