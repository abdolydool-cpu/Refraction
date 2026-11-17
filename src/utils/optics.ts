import type { BoundaryPresetId, FilterChoice } from '../shared/protocol';

export interface MediumPreset {
  id: BoundaryPresetId;
  n1: number;
  n2: number;
  name1: string;
  name2: string;
  short1: string;
  short2: string;
  fill1: string;
  fill2: string;
}

export const BOUNDARY_PRESETS: Record<BoundaryPresetId, MediumPreset> = {
  'air-glass': {
    id: 'air-glass',
    n1: 1.0,
    n2: 1.5,
    name1: 'AIR (n = 1.00)',
    name2: 'GLASS (n = 1.50)',
    short1: 'Air',
    short2: 'Glass',
    fill1: 'var(--medium-air)',
    fill2: 'var(--medium-glass)',
  },
  'glass-air': {
    id: 'glass-air',
    n1: 1.5,
    n2: 1.0,
    name1: 'GLASS (n = 1.50)',
    name2: 'AIR (n = 1.00)',
    short1: 'Glass',
    short2: 'Air',
    fill1: 'var(--medium-glass)',
    fill2: 'var(--medium-air)',
  },
  'air-water': {
    id: 'air-water',
    n1: 1.0,
    n2: 1.33,
    name1: 'AIR (n = 1.00)',
    name2: 'WATER (n = 1.33)',
    short1: 'Air',
    short2: 'Water',
    fill1: 'var(--medium-air)',
    fill2: 'var(--medium-water)',
  },
  'water-air': {
    id: 'water-air',
    n1: 1.33,
    n2: 1.0,
    name1: 'WATER (n = 1.33)',
    name2: 'AIR (n = 1.00)',
    short1: 'Water',
    short2: 'Air',
    fill1: 'var(--medium-water)',
    fill2: 'var(--medium-air)',
  },
  'water-glass': {
    id: 'water-glass',
    n1: 1.33,
    n2: 1.5,
    name1: 'WATER (n = 1.33)',
    name2: 'GLASS (n = 1.50)',
    short1: 'Water',
    short2: 'Glass',
    fill1: 'var(--medium-water)',
    fill2: 'var(--medium-glass)',
  },
  'glass-diamond': {
    id: 'glass-diamond',
    n1: 1.5,
    n2: 2.42,
    name1: 'GLASS (n = 1.50)',
    name2: 'DIAMOND (n = 2.42)',
    short1: 'Glass',
    short2: 'Diamond',
    fill1: 'var(--medium-glass)',
    fill2: 'var(--medium-diamond)',
  },
};

export interface RefractionResult {
  incidentDeg: number;
  refractedDeg: number | null;
  isTotalInternalReflection: boolean;
  criticalAngleDeg: number | null;
  speedChange: 'slows' | 'speeds' | 'unchanged';
  bendDirection: 'towards' | 'away' | 'straight' | 'tir';
}

export function computeRefraction(n1: number, n2: number, incidentDeg: number): RefractionResult {
  const clampedInc = Math.max(0, Math.min(89, incidentDeg));
  const theta1 = (clampedInc * Math.PI) / 180;
  const criticalAngleDeg = n1 > n2 ? (Math.asin(n2 / n1) * 180) / Math.PI : null;
  const speedChange = n2 > n1 ? 'slows' : n2 < n1 ? 'speeds' : 'unchanged';

  if (clampedInc === 0) {
    return {
      incidentDeg: 0,
      refractedDeg: 0,
      isTotalInternalReflection: false,
      criticalAngleDeg,
      speedChange,
      bendDirection: 'straight',
    };
  }

  const sinTheta2 = (n1 / n2) * Math.sin(theta1);
  if (sinTheta2 >= 1) {
    return {
      incidentDeg: clampedInc,
      refractedDeg: null,
      isTotalInternalReflection: true,
      criticalAngleDeg,
      speedChange,
      bendDirection: 'tir',
    };
  }

  const refractedDeg = (Math.asin(sinTheta2) * 180) / Math.PI;
  const bendDirection = n2 > n1 ? 'towards' : n2 < n1 ? 'away' : 'straight';

  return {
    incidentDeg: clampedInc,
    refractedDeg,
    isTotalInternalReflection: false,
    criticalAngleDeg,
    speedChange,
    bendDirection,
  };
}

export interface RgbChannels {
  r: boolean;
  g: boolean;
  b: boolean;
}

export type OpticalColorName =
  | 'White'
  | 'Red'
  | 'Green'
  | 'Blue'
  | 'Yellow'
  | 'Cyan'
  | 'Magenta'
  | 'Black';

export function channelsToColorName(c: RgbChannels): OpticalColorName {
  if (c.r && c.g && c.b) return 'White';
  if (c.r && c.g && !c.b) return 'Yellow';
  if (!c.r && c.g && c.b) return 'Cyan';
  if (c.r && !c.g && c.b) return 'Magenta';
  if (c.r && !c.g && !c.b) return 'Red';
  if (!c.r && c.g && !c.b) return 'Green';
  if (!c.r && !c.g && c.b) return 'Blue';
  return 'Black';
}

export function getFilterChannels(filter: FilterChoice): RgbChannels {
  switch (filter) {
    case 'none':
      return { r: true, g: true, b: true };
    case 'red':
      return { r: true, g: false, b: false };
    case 'green':
      return { r: false, g: true, b: false };
    case 'blue':
      return { r: false, g: false, b: true };
    case 'yellow':
      return { r: true, g: true, b: false };
    case 'cyan':
      return { r: false, g: true, b: true };
    case 'magenta':
      return { r: true, g: false, b: true };
  }
}

export function solveStackedFilters(filter1: FilterChoice, filter2: FilterChoice): RgbChannels {
  const c1 = getFilterChannels(filter1);
  const c2 = getFilterChannels(filter2);
  return {
    r: c1.r && c2.r,
    g: c1.g && c2.g,
    b: c1.b && c2.b,
  };
}

export function getSurfaceReflectance(surfaceColor: OpticalColorName): RgbChannels {
  switch (surfaceColor) {
    case 'White':
      return { r: true, g: true, b: true };
    case 'Red':
      return { r: true, g: false, b: false };
    case 'Green':
      return { r: false, g: true, b: false };
    case 'Blue':
      return { r: false, g: false, b: true };
    case 'Yellow':
      return { r: true, g: true, b: false };
    case 'Cyan':
      return { r: false, g: true, b: true };
    case 'Magenta':
      return { r: true, g: false, b: true };
    case 'Black':
      return { r: false, g: false, b: false };
  }
}

export function solveSurfaceAppearance(
  surfaceColor: OpticalColorName,
  incomingLight: RgbChannels
): OpticalColorName {
  const refl = getSurfaceReflectance(surfaceColor);
  return channelsToColorName({
    r: incomingLight.r && refl.r,
    g: incomingLight.g && refl.g,
    b: incomingLight.b && refl.b,
  });
}

export function colorNameToCssVar(color: OpticalColorName): string {
  switch (color) {
    case 'White':
      return 'var(--spec-white)';
    case 'Red':
      return 'var(--spec-red)';
    case 'Green':
      return 'var(--spec-green)';
    case 'Blue':
      return 'var(--spec-blue)';
    case 'Yellow':
      return 'var(--spec-yellow)';
    case 'Cyan':
      return 'var(--spec-cyan)';
    case 'Magenta':
      return 'var(--spec-magenta)';
    case 'Black':
      return 'var(--spec-black)';
  }
}
