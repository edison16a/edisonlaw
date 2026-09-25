import { describe, expect, it } from 'vitest';
import { SOUNDS } from '../config';
import { SPRITE_REGIONS, SPRITE_URL } from '../sprite';

describe('generated sprite map', () => {
  const regions = Object.entries(SPRITE_REGIONS).sort(([, a], [, b]) => a.start - b.start);

  it('keeps every sound short', () => {
    for (const [name, { duration }] of regions) expect(duration, name).toBeLessThan(560);
  });

  it('holds exactly the one-shots the engine knows, and no ambient loops', () => {
    expect(regions.map(([name]) => name).sort()).toEqual(Object.keys(SOUNDS).sort());
    expect(Object.keys(SPRITE_REGIONS)).not.toContain('desk');
    expect(Object.keys(SPRITE_REGIONS)).not.toContain('room');
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
