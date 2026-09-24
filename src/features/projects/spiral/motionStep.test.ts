import { describe, expect, it } from 'vitest';
import type { SpiralMotion } from '../state/spiralMotion';
import { isAtRest, stepMotion } from './motionStep';

const create = (value: number): SpiralMotion => ({
  target: value,
  value,
  velocity: 0,
  settle: 0,
  reveal: 0,
});

const run = (motion: SpiralMotion, target: number, seconds: number, reducedMotion = false) => {
  motion.target = target;
  for (let frame = 0; frame < seconds * 60; frame++) stepMotion(motion, 1 / 60, reducedMotion);
  return motion;
};

describe('stepMotion', () => {
  it('eases to the next card and comes to rest on it', () => {
    const motion = run(create(3), 4, 2);
    expect(motion.value).toBeCloseTo(4, 3);
    expect(motion.settle).toBeGreaterThan(0.95);
  });

  it('settles on cards past either end of the list', () => {
    expect(run(create(-3), -4, 2).settle).toBeGreaterThan(0.95);
    expect(run(create(40), 41, 2).settle).toBeGreaterThan(0.95);
  });

  it('takes its time over one card, so the move reads as weighty', () => {
    const motion = run(create(0), 1, 0.25);
    expect(motion.value).toBeGreaterThan(0.2);
    expect(motion.value).toBeLessThan(0.85);
  });

  it('lets go of the resting card as soon as a move starts', () => {
    const motion = run(create(3), 3, 2);
    run(motion, 4, 0.25);
    expect(motion.settle).toBeLessThan(0.2);
  });

  it('never settles between cards', () => {
    expect(run(create(3.4), 3.4, 2).settle).toBeLessThan(0.01);
  });

  it('spins through a queue of cards at a steady pace', () => {
    const motion = create(0);
    motion.target = 3;
    let fastest = 0;
    for (let frame = 0; frame < 120; frame++) {
      stepMotion(motion, 1 / 60, false);
      fastest = Math.max(fastest, motion.velocity);
    }
    expect(fastest).toBeLessThanOrEqual(5.01);
    expect(motion.value).toBeCloseTo(3, 2);
  });

  it('crosses a long jump to a clicked card briskly and lands on it without overshooting', () => {
    const motion = create(0);
    motion.target = 8;
    let furthest = 0;
    let frames = 0;
    while (Math.abs(motion.value - 8) > 0.2 && frames < 600) {
      stepMotion(motion, 1 / 60, false);
      furthest = Math.max(furthest, motion.value);
      frames++;
    }
    expect(frames / 60).toBeLessThan(1.7);
    run(motion, 8, 2);
    expect(Math.max(furthest, motion.value)).toBeLessThanOrEqual(8);
    expect(motion.settle).toBeGreaterThan(0.95);
  });

  it('turns round smoothly when the target flips mid move', () => {
    const motion = run(create(0), 1, 0.2);
    const turnedAt = motion.value;
    let previous = motion.value;
    let biggestStep = 0;
    motion.target = -1;
    for (let frame = 0; frame < 120; frame++) {
      stepMotion(motion, 1 / 60, false);
      biggestStep = Math.max(biggestStep, Math.abs(motion.value - previous));
      previous = motion.value;
    }
    expect(turnedAt).toBeGreaterThan(0);
    expect(biggestStep).toBeLessThan(0.12);
    expect(motion.value).toBeCloseTo(-1, 2);
  });

  it('moves quickly for reduced motion', () => {
    const weighty = run(create(0), 1, 0.15);
    const calm = run(create(0), 1, 0.15, true);
    expect(calm.value).toBeGreaterThan(0.95);
    expect(weighty.value).toBeLessThan(calm.value);
  });

  it('brings the cards in once and keeps them there', () => {
    const motion = run(create(0), 0, 3);
    expect(motion.reveal).toBeGreaterThan(0.99);
  });
});

describe('isAtRest', () => {
  it('rests once the spiral has settled on a card and the entrance is done', () => {
    expect(isAtRest(run(create(3), 3, 5))).toBe(true);
  });

  it('keeps drawing while the spiral travels, settles or rises in', () => {
    expect(isAtRest(run(create(2), 3, 0.1))).toBe(false);
    expect(isAtRest(run(create(3), 3, 0.05))).toBe(false);
  });
});
