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
  it('bows in the direction of travel, and not at rest', () => {
    expect(cardBow(0)).toBe(0);
    expect(Math.sign(cardBow(-3))).toBe(-1);
    expect(cardBow(40)).toBeCloseTo(cardBow(10), 6);
  });

  it('bends more with speed and relaxes flat in focus', () => {
    expect(cardBend(0, 0)).toBe(1);
    expect(cardBend(6, 0)).toBeGreaterThan(1);
    expect(cardBend(0, 1)).toBeLessThan(0.3);
  });
});
