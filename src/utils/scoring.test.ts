import test from 'node:test';
import assert from 'node:assert/strict';
import { computeMasteryPct, normalizeRoomCode, formatTimerSeconds, shuffleArray } from './scoring';
import { FLASHCARDS, QUIZ_BANK, MOCK_AFL_PAPERS } from '../data/curriculum';

test('curriculum dataset has expanded 40 flashcards and 60 unique questions', () => {
  assert.equal(FLASHCARDS.length, 40);
  assert.equal(QUIZ_BANK.length, 60);

  const uniqueQIds = new Set(QUIZ_BANK.map((q) => q.id));
  assert.equal(uniqueQIds.size, 60);

  for (const q of QUIZ_BANK) {
    assert.ok(q.ans >= 0 && q.ans < q.opts.length, `Invalid ans index for ${q.id}`);
    assert.ok(q.exp.length > 10, `Missing explanation for ${q.id}`);
  }
});

test('Mock AFL Papers A and B are non-overlapping 25-question exams', () => {
  const paperA = MOCK_AFL_PAPERS.find((p) => p.id === 'paper-a');
  const paperB = MOCK_AFL_PAPERS.find((p) => p.id === 'paper-b');
  assert.ok(paperA && paperB);
  assert.equal(paperA.questionIds.length, 25);
  assert.equal(paperB.questionIds.length, 25);

  const setA = new Set(paperA.questionIds);
  for (const id of paperB.questionIds) {
    assert.equal(setA.has(id), false, `Paper B overlaps Paper A on ${id}`);
  }
});

test('scoring helpers compute percentages, room codes, timers, and lossless shuffles', () => {
  assert.equal(computeMasteryPct(0, 0), 0);
  assert.equal(computeMasteryPct(18, 20), 90);
  assert.equal(normalizeRoomCode('7'), '07');
  assert.equal(normalizeRoomCode('abc'), '42');
  assert.equal(normalizeRoomCode('94'), '94');
  assert.equal(formatTimerSeconds(125), '02:05');

  const items = [1, 2, 3, 4, 5];
  const shuffled = shuffleArray(items, () => 0.25);
  assert.equal(shuffled.length, 5);
  assert.deepEqual([...shuffled].sort((a, b) => a - b), items);
});
