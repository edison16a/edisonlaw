import { describe, expect, it } from 'vitest';
import { detentCrossed, isCardDetent, nearestCard, snapTarget } from './detents';

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
  it('never snaps outside the deck', () => {
    expect(snapTarget(-0.2, 0, 12)).toBeNull();
    expect(snapTarget(11.3, 11, 12)).toBeNull();
  });

  it('settles back when barely moved from the locked card', () => {
    expect(snapTarget(3.05, 3, 12)).toBe(3);
    expect(snapTarget(2.96, 3, 12)).toBe(3);
  });

  it('commits to the neighbour once past the threshold', () => {
    expect(snapTarget(3.1, 3, 12)).toBe(4);
    expect(snapTarget(2.9, 3, 12)).toBe(2);
  });

  it('uses the nearest card once travel passes the halfway point', () => {
    expect(snapTarget(4.09, 3, 12)).toBe(4);
    expect(snapTarget(5.7, 3, 12)).toBe(6);
    expect(snapTarget(5.4, null, 12)).toBe(5);
  });

  it('stays inside the deck at both ends', () => {
    expect(snapTarget(0.1, 0, 12)).toBe(1);
    expect(snapTarget(10.95, 11, 12)).toBe(11);
    expect(nearestCard(13, 12)).toBe(11);
  });
});
