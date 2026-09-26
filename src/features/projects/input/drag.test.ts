import { describe, expect, it } from 'vitest';
import { WHEEL_LEAD } from '../spiral/loop';
import { cardSpan, dragTarget, releaseSpeed, releaseTarget } from './drag';

describe('cardSpan', () => {
  it('follows the smaller side of the stage, and never gets too twitchy', () => {
    expect(cardSpan(1440, 820)).toBe(410);
    expect(cardSpan(700, 900)).toBe(224);
    expect(cardSpan(200, 200)).toBe(120);
  });
});

describe('dragTarget', () => {
  it('brings the next card on a drag to the left, like a swipe', () => {
    expect(dragTarget(3, -200, 400)).toBe(3.5);
    expect(dragTarget(3, 800, 400)).toBe(1);
  });
});

describe('releaseSpeed', () => {
  it('reads the last moments of the drag in pixels per millisecond', () => {
    const samples = [
      { x: 0, time: 0 },
      { x: 100, time: 100 },
      { x: 160, time: 150 },
      { x: 240, time: 200 },
    ];
    // Only the last 90 milliseconds count: 80 pixels in 50.
    expect(releaseSpeed(samples, 200)).toBeCloseTo(1.6);
  });

  it('has no speed once the mouse stopped before letting go', () => {
    expect(releaseSpeed([{ x: 0, time: 0 }, { x: 300, time: 50 }], 400)).toBe(0);
    expect(releaseSpeed([{ x: 0, time: 0 }], 0)).toBe(0);
    // Moving fast until 100 milliseconds, then still for 60 before the release.
    const fast = [
      { x: 250, time: 83 },
      { x: 300, time: 100 },
    ];
    expect(releaseSpeed(fast, 160)).toBe(0);
    expect(releaseSpeed(fast, 120)).toBeCloseTo(50 / 17);
  });
});

describe('releaseTarget', () => {
  const span = 400;

  it('settles a slow drag on the nearest card', () => {
    expect(releaseTarget(0, 1.4, 1.4, 0, span)).toBe(1);
    expect(releaseTarget(0, 1.6, 1.6, 0, span)).toBe(2);
    expect(releaseTarget(5, 3.3, 3.3, 0, span)).toBe(3);
  });

  it('moves on one card after a short deliberate pull, and springs back from a nudge', () => {
    expect(releaseTarget(4, 4.2, 4.2, 0, span)).toBe(5);
    expect(releaseTarget(4, 3.8, 3.8, 0, span)).toBe(3);
    expect(releaseTarget(4, 4.04, 4.04, 0, span)).toBe(4);
  });

  it('moves on to the very next card from a drag that set off between two', () => {
    expect(releaseTarget(2.45, 2.33, 2.33, 0, span)).toBe(2);
    expect(releaseTarget(2.55, 2.67, 2.67, 0, span)).toBe(3);
    expect(releaseTarget(2.3, 2.15, 2.15, 0, span)).toBe(2);
    // Almost resting on a card counts as on it, so a short pull still moves on one.
    expect(releaseTarget(3.97, 4.17, 4.17, 0, span)).toBe(5);
  });

  it('carries a flick on a few cards, the way it was thrown', () => {
    // Flung left at 3 pixels per millisecond: 420 pixels more, about one card.
    expect(releaseTarget(0, 1.2, 1.2, -3, span)).toBe(2);
    expect(releaseTarget(0, -1.2, -1.2, 3, span)).toBe(-2);
  });

  it('lets a flick back the other way undo the pull, or go the other way', () => {
    expect(releaseTarget(0, 0.2, 0.2, 0.5, span)).toBe(0);
    expect(releaseTarget(0, 0.2, 0.2, 1.5, span)).toBe(-1);
  });

  it('never runs further ahead of the spiral than a wheel spin can', () => {
    expect(releaseTarget(0, 2, 2, -60, span)).toBe(2 + WHEEL_LEAD);
    expect(releaseTarget(0, -2, -2, 60, span)).toBe(-2 - WHEEL_LEAD);
  });
});
