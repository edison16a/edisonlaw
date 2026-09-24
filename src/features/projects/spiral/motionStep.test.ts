import { describe, expect, it } from 'vitest';
import type { SpiralMotion } from '../state/spiralMotion';
import { stepMotion } from './motionStep';

const create = (value: number): SpiralMotion => ({
  target: value,
  value,
  velocity: 0,
  dragging: false,
  settle: 0,
  engaged: 0,
  reveal: 0,
  hoverSlot: null,
});

const run = (motion: SpiralMotion, target: number, seconds: number) => {
  for (let frame = 0; frame < seconds * 60; frame++) stepMotion(motion, target, 12, 1 / 60, false);
  return motion;
};

describe('stepMotion', () => {
  it('eases the index to the target and settles on a card', () => {
    const motion = run(create(2.6), 3, 2);
    expect(motion.value).toBeCloseTo(3, 3);
    expect(motion.settle).toBeGreaterThan(0.95);
  });

  it('never settles between cards or before the first one', () => {
    expect(run(create(3.4), 3.4, 2).settle).toBeLessThan(0.01);
    expect(run(create(-0.5), -0.5, 2).settle).toBeLessThan(0.01);
  });

  it('lets go of a settled card as soon as it moves', () => {
    const motion = run(create(3), 3, 2);
    run(motion, 3.6, 0.25);
    expect(motion.settle).toBeLessThan(0.2);
  });

  it('centres the spiral for the intro and keeps it aside from the first card to the last', () => {
    expect(run(create(-0.5), -0.5, 0.1).engaged).toBe(0);
    expect(run(create(5), 5, 0.1).engaged).toBe(1);
    expect(run(create(11), 11, 0.1).engaged).toBe(1);
  });

  it('brings the cards in once and keeps them there', () => {
    const motion = run(create(0), 0, 3);
    expect(motion.reveal).toBeGreaterThan(0.99);
  });
});
