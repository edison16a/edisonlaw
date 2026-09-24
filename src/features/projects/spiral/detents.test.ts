import { describe, expect, it } from 'vitest';
import { detentCrossed, isCardDetent, snapTarget } from './detents';

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

describe('snapTarget', () => {
  it('settles back when barely moved from the locked card', () => {
    expect(snapTarget(3.05, 3)).toBe(3);
    expect(snapTarget(2.96, 3)).toBe(3);
  });

  it('commits to the neighbour once past the threshold', () => {
    expect(snapTarget(3.1, 3)).toBe(4);
    expect(snapTarget(2.9, 3)).toBe(2);
  });

  it('uses the nearest card once travel passes the halfway point', () => {
    expect(snapTarget(4.09, 3)).toBe(4);
    expect(snapTarget(5.7, 3)).toBe(6);
    expect(snapTarget(5.4, null)).toBe(5);
  });

  it('has no ends, so it settles past the last project and before the first', () => {
    expect(snapTarget(11.3, 11)).toBe(12);
    expect(snapTarget(-0.2, 0)).toBe(-1);
    expect(snapTarget(-7.6, null)).toBe(-8);
    expect(snapTarget(250.2, null)).toBe(250);
  });

  it('leaves the intro for the card in the direction of travel', () => {
    expect(snapTarget(-0.45, null)).toBe(0);
    expect(snapTarget(-0.55, null)).toBe(-1);
  });
});
