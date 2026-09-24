import { describe, expect, it } from 'vitest';
import { cardBend, cardBlur, cardBow, cardBrightness, cardStreak } from './appearance';

describe('cardBlur', () => {
  it('keeps the slot sharp and blurs with distance on both sides', () => {
    expect(cardBlur(0, 0)).toBe(0);
    expect(cardBlur(2, 0)).toBeGreaterThan(cardBlur(1, 0));
    expect(cardBlur(-2, 0)).toBeCloseTo(cardBlur(2, 0), 6);
    expect(cardBlur(6, 1)).toBeLessThanOrEqual(1);
  });

  it('pushes the rest of the scene back once a card settles, but not the card itself', () => {
    expect(cardBlur(0, 1)).toBe(0);
    expect(cardBlur(1, 1)).toBeGreaterThan(cardBlur(1, 0));
  });
});

describe('cardBrightness', () => {
  it('is full in the slot and dims the others further when settled', () => {
    expect(cardBrightness(0, 1)).toBe(1);
    expect(cardBrightness(2, 0)).toBeLessThan(1);
    expect(cardBrightness(2, 1)).toBeLessThan(cardBrightness(2, 0));
  });
});

describe('motion curves', () => {
  it('streaks and bows in the direction of travel, and not at rest', () => {
    expect(cardStreak(0)).toBe(0);
    expect(cardStreak(4)).toBeGreaterThan(0);
    expect(cardStreak(-4)).toBeLessThan(0);
    expect(Math.abs(cardStreak(40))).toBeCloseTo(0.09, 6);
    expect(cardBow(0)).toBe(0);
    expect(Math.sign(cardBow(-3))).toBe(-1);
  });

  it('bends more with speed and relaxes flat in focus', () => {
    expect(cardBend(0, 0)).toBe(1);
    expect(cardBend(6, 0)).toBeGreaterThan(1);
    expect(cardBend(0, 1)).toBeLessThan(0.3);
  });
});
