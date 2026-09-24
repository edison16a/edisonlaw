import { describe, expect, it } from 'vitest';
import {
  firstIndex,
  indexFromScroll,
  isInsideDeck,
  lastIndex,
  rawIndexFromScroll,
  scrollFromIndex,
  TRACK,
  trackSpan,
} from './track';

const metrics = { top: 100, perCard: 500, count: 12 };

describe('track mapping', () => {
  it('opens between two cards and reaches the first project half a card later', () => {
    expect(indexFromScroll(100, metrics)).toBe(-TRACK.intro);
    expect(indexFromScroll(100 + TRACK.intro * 500, metrics)).toBeCloseTo(0, 6);
  });

  it('round trips between scroll and index', () => {
    for (const index of [-0.5, 0, 3.25, 11]) {
      expect(indexFromScroll(scrollFromIndex(index, metrics), metrics)).toBeCloseTo(index, 6);
    }
  });

  it('holds the index inside the track above and below it', () => {
    expect(indexFromScroll(0, metrics)).toBe(firstIndex());
    expect(indexFromScroll(1e6, metrics)).toBe(lastIndex(12));
  });

  it('ends the track on the last project', () => {
    expect(lastIndex(12)).toBe(11);
    expect(indexFromScroll(scrollFromIndex(11, metrics) + 200, metrics)).toBe(11);
  });

  it('keeps counting past both ends when asked for the raw index', () => {
    expect(rawIndexFromScroll(scrollFromIndex(11, metrics) + 250, metrics)).toBeCloseTo(11.5, 6);
    expect(rawIndexFromScroll(0, metrics)).toBeCloseTo(-0.7, 6);
  });

  it('spans every card plus the intro and the outro', () => {
    expect(trackSpan(12)).toBe(11 + TRACK.intro + TRACK.outro);
    expect(trackSpan(1)).toBe(TRACK.intro + TRACK.outro);
  });

  it('survives a track that has not been measured yet', () => {
    expect(indexFromScroll(300, { top: 0, perCard: 0, count: 12 })).toBe(firstIndex());
  });

  it('only snaps between the first and the last project', () => {
    expect(isInsideDeck(-0.1, 12)).toBe(false);
    expect(isInsideDeck(0, 12)).toBe(true);
    expect(isInsideDeck(11, 12)).toBe(true);
    expect(isInsideDeck(11.2, 12)).toBe(false);
  });
});
