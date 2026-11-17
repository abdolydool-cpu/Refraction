import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeRefraction,
  solveStackedFilters,
  solveSurfaceAppearance,
  channelsToColorName,
  getFilterChannels,
} from './optics';

test('computeRefraction bends towards normal when entering denser medium (Air -> Glass)', () => {
  const res = computeRefraction(1.0, 1.5, 45);
  assert.equal(res.isTotalInternalReflection, false);
  assert.equal(res.speedChange, 'slows');
  assert.equal(res.bendDirection, 'towards');
  assert.ok(res.refractedDeg !== null && res.refractedDeg > 27 && res.refractedDeg < 29);
});

test('computeRefraction bends away from normal when entering less dense medium (Glass -> Air)', () => {
  const res = computeRefraction(1.5, 1.0, 30);
  assert.equal(res.isTotalInternalReflection, false);
  assert.equal(res.speedChange, 'speeds');
  assert.equal(res.bendDirection, 'away');
  assert.ok(res.refractedDeg !== null && res.refractedDeg > 48 && res.refractedDeg < 49);
});

test('computeRefraction goes straight through at 0 degrees to the normal', () => {
  const res = computeRefraction(1.0, 1.5, 0);
  assert.equal(res.refractedDeg, 0);
  assert.equal(res.bendDirection, 'straight');
  assert.equal(res.isTotalInternalReflection, false);
});

test('computeRefraction detects Total Internal Reflection above critical angle (Glass -> Air at 50 deg)', () => {
  const res = computeRefraction(1.5, 1.0, 50);
  assert.equal(res.isTotalInternalReflection, true);
  assert.equal(res.refractedDeg, null);
  assert.equal(res.bendDirection, 'tir');
  assert.ok(res.criticalAngleDeg !== null && res.criticalAngleDeg > 41 && res.criticalAngleDeg < 42.5);
});

test('solveStackedFilters matches optical transmission physics', () => {
  assert.equal(channelsToColorName(solveStackedFilters('red', 'blue')), 'Black');
  assert.equal(channelsToColorName(solveStackedFilters('magenta', 'blue')), 'Blue');
  assert.equal(channelsToColorName(solveStackedFilters('yellow', 'cyan')), 'Green');
  assert.equal(channelsToColorName(solveStackedFilters('cyan', 'magenta')), 'Blue');
});

test('solveSurfaceAppearance matches garden gnome & stage costume rules', () => {
  const greenFilter = getFilterChannels('green');
  assert.equal(solveSurfaceAppearance('Green', greenFilter), 'Green');
  assert.equal(solveSurfaceAppearance('White', greenFilter), 'Green');
  assert.equal(solveSurfaceAppearance('Red', greenFilter), 'Black');
  assert.equal(solveSurfaceAppearance('Blue', greenFilter), 'Black');

  const yellowSpotlight = getFilterChannels('yellow');
  assert.equal(solveSurfaceAppearance('Cyan', yellowSpotlight), 'Green');
  assert.equal(solveSurfaceAppearance('Magenta', yellowSpotlight), 'Red');
  assert.equal(solveSurfaceAppearance('Blue', yellowSpotlight), 'Black');
});
