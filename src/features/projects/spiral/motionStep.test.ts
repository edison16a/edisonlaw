import { describe, expect, it } from 'vitest';
import type { SpiralMotion } from '../state/spiralMotion';
import { INTRO_INDEX } from './loop';
import { isAtRest, isInIntro, stepMotion } from './motionStep';

const create = (value: number, introAt: number | null = null): SpiralMotion => ({
  target: value,
  value,
  velocity: 0,
  dragging: false,
  settle: 0,
  engaged: 0,
  reveal: 0,
  hoverSlot: null,
  introAt,
});

const run = (motion: SpiralMotion, target: number, seconds: number, reducedMotion = false) => {
  motion.target = target;
  for (let frame = 0; frame < seconds * 60; frame++) stepMotion(motion, 1 / 60, reducedMotion);
  return motion;
};

describe('stepMotion', () => {
  it('eases the index to the target and settles on a card', () => {
    const motion = run(create(2.6), 3, 2);
    expect(motion.value).toBeCloseTo(3, 3);
    expect(motion.settle).toBeGreaterThan(0.95);
  });

  it('settles on cards past either end of the list', () => {
    expect(run(create(-3.3), -4, 2).settle).toBeGreaterThan(0.95);
    expect(run(create(40.2), 41, 2).settle).toBeGreaterThan(0.95);
  });

  it('never settles between cards', () => {
    expect(run(create(3.4), 3.4, 2).settle).toBeLessThan(0.01);
    expect(run(create(INTRO_INDEX, INTRO_INDEX), INTRO_INDEX, 2).settle).toBeLessThan(0.01);
  });

  it('lets go of a settled card as soon as it moves', () => {
    const motion = run(create(3), 3, 2);
    run(motion, 3.6, 0.25);
    expect(motion.settle).toBeLessThan(0.2);
  });

  it('eases a big jump over several frames, and faster for reduced motion', () => {
    const weighty = run(create(0), 3, 0.2);
    const calm = run(create(0), 3, 0.2, true);
    expect(weighty.value).toBeGreaterThan(0.5);
    expect(weighty.value).toBeLessThan(2.8);
    expect(calm.value).toBeGreaterThan(weighty.value);
  });

  it('brings the cards in once and keeps them there', () => {
    const motion = run(create(0), 0, 3);
    expect(motion.reveal).toBeGreaterThan(0.99);
  });
});

describe('the intro', () => {
  it('stays centred in the opening pose', () => {
    const motion = run(create(INTRO_INDEX, INTRO_INDEX), INTRO_INDEX, 1);
    expect(motion.engaged).toBe(0);
    expect(isInIntro(motion)).toBe(true);
  });

  it('slides aside for the panel on the way to a card, in either direction', () => {
    const forward = run(create(INTRO_INDEX, INTRO_INDEX), 0, 2);
    expect(forward.engaged).toBe(1);
    expect(forward.introAt).toBeNull();
    const back = run(create(INTRO_INDEX, INTRO_INDEX), -1, 2);
    expect(back.engaged).toBe(1);
    expect(isInIntro(back)).toBe(false);
  });

  it('never comes back once over, even halfway between two cards', () => {
    const motion = run(create(INTRO_INDEX, INTRO_INDEX), 0, 2);
    run(motion, INTRO_INDEX, 2);
    expect(motion.engaged).toBe(1);
    expect(isInIntro(motion)).toBe(false);
  });
});

describe('isAtRest', () => {
  it('rests once the spiral has settled on a card and the entrance is done', () => {
    expect(isAtRest(run(create(3), 3, 5))).toBe(true);
  });

  it('rests in the intro too, where nothing settles', () => {
    expect(isAtRest(run(create(INTRO_INDEX, INTRO_INDEX), INTRO_INDEX, 5))).toBe(true);
  });

  it('keeps drawing while the spiral travels, settles or rises in', () => {
    expect(isAtRest(run(create(2), 3, 0.1))).toBe(false);
    expect(isAtRest(run(create(3), 3, 0.05))).toBe(false);
  });

  it('keeps drawing while the stage is being dragged', () => {
    const motion = run(create(3), 3, 5);
    motion.dragging = true;
    expect(isAtRest(motion)).toBe(false);
  });
});
