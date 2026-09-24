import { describe, expect, it } from 'vitest';
import { detentCrossed } from './detents';

describe('detentCrossed', () => {
  it('returns null while the same card holds the slot', () => {
    expect(detentCrossed(0.1, 0.45)).toBeNull();
    expect(detentCrossed(2.01, 1.6)).toBeNull();
  });

  it('finds the card that takes over, halfway between two, going either way', () => {
    expect(detentCrossed(0.4, 0.6)).toBe(1);
    expect(detentCrossed(1.6, 1.4)).toBe(1);
    expect(detentCrossed(-0.4, -0.6)).toBe(-1);
  });

  it('crosses exactly once on a turn of one card', () => {
    let crossings = 0;
    for (let value = 3; value < 4; value += 0.01) {
      if (detentCrossed(value, value + 0.01) !== null) crossings++;
    }
    expect(crossings).toBe(1);
  });
});
