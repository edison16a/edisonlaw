import { describe, expect, it } from 'vitest';
import { cardBend, cardBow, cardBrightness } from './appearance';

describe('cardBrightness', () => {
  it('is full in the slot and dims the others a little when settled', () => {
    expect(cardBrightness(0, 1)).toBe(1);
    expect(cardBrightness(2, 0)).toBeLessThan(1);
    expect(cardBrightness(2, 1)).toBeLessThan(cardBrightness(2, 0));
  });

  it('keeps every card clearly visible', () => {
    for (const offset of [-6, -2.5, -1, 1, 3, 8]) {
      expect(cardBrightness(offset, 1)).toBeGreaterThan(0.7);
      expect(cardBrightness(offset, 0)).toBeGreaterThan(0.85);
    }
  });
});

describe('motion curves', () => {
  it('bows the way the cards travel, and not at rest', () => {
    // A growing index carries the cards toward their own left, which is negative x.
    expect(cardBow(0, 0)).toBeCloseTo(0, 9);
    expect(Math.sign(cardBow(3, 0))).toBe(-1);
    expect(Math.sign(cardBow(-3, 0))).toBe(1);
    expect(cardBow(40, 0)).toBeCloseTo(cardBow(10, 0), 6);
  });

  it('bends more with speed', () => {
    expect(cardBend(0, 0)).toBe(1);
    expect(cardBend(6, 0)).toBeGreaterThan(1);
  });

  it('eases a card from curved to perfectly flat as it settles in focus', () => {
    expect(cardBend(0, 1)).toBe(0);
    expect(cardBow(0.2, 1)).toBeCloseTo(0, 9);
    const steps = [0, 0.25, 0.5, 0.75, 1].map((focus) => cardBend(0, focus));
    steps.slice(1).forEach((bend, index) => expect(bend).toBeLessThan(steps[index]));
  });
});
