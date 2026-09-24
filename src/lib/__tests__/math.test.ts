import { describe, expect, it } from 'vitest';
import { clamp, damp, hashString, lerp, mapRange, seededRandom, smoothstep, wrap } from '../math';

describe('clamp and lerp', () => {
  it('clamps to the range', () => {
    expect(clamp(-1)).toBe(0);
    expect(clamp(2)).toBe(1);
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('interpolates linearly', () => {
    expect(lerp(0, 10, 0.25)).toBe(2.5);
    expect(lerp(4, 4, 0.9)).toBe(4);
  });
});

describe('mapRange', () => {
  it('maps and clamps into the output range', () => {
    expect(mapRange(5, 0, 10, 100, 200)).toBe(150);
    expect(mapRange(20, 0, 10, 100, 200)).toBe(200);
    expect(mapRange(-5, 0, 10, 100, 200)).toBe(100);
  });

  it('returns the output start for an empty input range', () => {
    expect(mapRange(3, 1, 1, 7, 9)).toBe(7);
  });
});

describe('smoothstep', () => {
  it('eases between the edges', () => {
    expect(smoothstep(0, 1, 0)).toBe(0);
    expect(smoothstep(0, 1, 0.5)).toBe(0.5);
    expect(smoothstep(0, 1, 1)).toBe(1);
  });
});

describe('damp', () => {
  it('moves toward the target without overshooting', () => {
    const next = damp(0, 10, 5, 1 / 60);
    expect(next).toBeGreaterThan(0);
    expect(next).toBeLessThan(10);
  });

  it('does not depend on the frame rate', () => {
    const oneStep = damp(0, 1, 6, 0.1);
    const twoSteps = damp(damp(0, 1, 6, 0.05), 1, 6, 0.05);
    expect(twoSteps).toBeCloseTo(oneStep, 10);
  });
});

describe('wrap', () => {
  it('wraps values into the range', () => {
    expect(wrap(370, 0, 360)).toBe(10);
    expect(wrap(-10, 0, 360)).toBe(350);
    expect(wrap(5, 0, 360)).toBe(5);
  });
});

describe('seeded randomness', () => {
  it('repeats the same sequence for the same seed', () => {
    const a = seededRandom(42);
    const b = seededRandom(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('stays inside [0, 1)', () => {
    const random = seededRandom(7);
    for (let i = 0; i < 1000; i++) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('hashes strings stably and spreads them out', () => {
    expect(hashString('backbond')).toBe(hashString('backbond'));
    expect(hashString('backbond')).not.toBe(hashString('autolab'));
  });
});
