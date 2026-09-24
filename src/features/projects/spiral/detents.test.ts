import { describe, expect, it } from 'vitest';
import { detentCrossed, isCardDetent } from './detents';

describe('detentCrossed', () => {
  it('returns null while staying between two lines', () => {
    expect(detentCrossed(0.3, 0.45, 4)).toBeNull();
    expect(detentCrossed(2.01, 2.24, 4)).toBeNull();
  });

  it('finds the line crossed going forward and backward', () => {
    expect(detentCrossed(0.9, 1.1, 4)).toBe(4);
    expect(detentCrossed(1.1, 0.9, 4)).toBe(4);
    expect(detentCrossed(0.2, 0.3, 4)).toBe(1);
  });

  it('reports the line nearest the new position after a big jump', () => {
    expect(detentCrossed(0.1, 0.9, 4)).toBe(3);
    expect(detentCrossed(0.9, 0.1, 4)).toBe(1);
  });

  it('marks card boundaries, including negative ones', () => {
    expect(isCardDetent(8, 4)).toBe(true);
    expect(isCardDetent(9, 4)).toBe(false);
    expect(isCardDetent(-4, 4)).toBe(true);
  });
});
