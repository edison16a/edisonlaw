import { describe, expect, it } from 'vitest';
import { LOOP_NAMES, SOUNDS } from '../config';
import { SPRITE_REGIONS, SPRITE_URL } from '../sprite';

describe('generated sprite map', () => {
  const regions = Object.entries(SPRITE_REGIONS).sort(([, a], [, b]) => a.start - b.start);

  it('keeps every one-shot short and every loop 6 to 10 seconds', () => {
    for (const [name, { duration, loop }] of regions) {
      if (loop) expect(duration, name).toBeGreaterThanOrEqual(6000);
      if (loop) expect(duration, name).toBeLessThanOrEqual(10000);
      else expect(duration, name).toBeLessThan(560);
    }
  });

  it('marks exactly the loops as looping', () => {
    const looping = regions.filter(([, region]) => region.loop).map(([name]) => name);
    expect(looping.sort()).toEqual([...LOOP_NAMES].sort());
    for (const name of Object.keys(SOUNDS)) expect(SPRITE_REGIONS[name as keyof typeof SOUNDS].loop).toBe(false);
  });

  it('never lets two regions overlap', () => {
    for (let i = 1; i < regions.length; i++) {
      const [, previous] = regions[i - 1];
      expect(regions[i][1].start).toBeGreaterThan(previous.start + previous.duration);
    }
  });

  it('versions the file by its content', () => {
    expect(SPRITE_URL).toMatch(/^\/audio\/sprite\.mp3\?v=[0-9a-f]{10}$/);
  });
});
