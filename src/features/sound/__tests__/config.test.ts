import { describe, expect, it } from 'vitest';
import { MUSIC_VOLUME, PITCH_JITTER, SOUNDS } from '../config';
import { jitterRate } from '../jitter';

describe('the move sound', () => {
  it('keeps its pitch within about one percent, less than any other sound varies', () => {
    const spread = SOUNDS.move.jitter ?? PITCH_JITTER;
    expect(spread).toBeLessThan(PITCH_JITTER);
    expect(jitterRate(1, spread, () => 0)).toBeGreaterThan(0.985);
    expect(jitterRate(1, spread, () => 0.999999)).toBeLessThan(1.015);
  });

  it('plays no louder than the site sounds it sits among', () => {
    expect(SOUNDS.move.volume).toBeLessThanOrEqual(SOUNDS.tab.volume);
  });
});

describe('the background music', () => {
  it('sits at least 12 dB under the level of every effect', () => {
    for (const [name, { volume }] of Object.entries(SOUNDS)) expect(20 * Math.log10(MUSIC_VOLUME / volume), name).toBeLessThanOrEqual(-12);
  });
});
