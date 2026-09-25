import { describe, expect, it } from 'vitest';
import { fromDb, mean, peak, rms, seamRatio } from '../analysis';
import { softLimit } from '../dynamics';
import { highpass, lowpass } from '../filters';
import { crossfadeLoop, mixCircular, padLoop, processLoop } from '../loop';
import { whiteNoise } from '../noise';
import { saw, sine } from '../oscillators';
import { createRandom } from '../random';
import { reverb } from '../reverb';
import { slice, toSamples } from '../signal';

describe('createRandom', () => {
  it('repeats the same sequence for the same seed', () => {
    const a = createRandom(7);
    const b = createRandom(7);
    expect(Array.from({ length: 5 }, a)).toEqual(Array.from({ length: 5 }, b));
  });
});

describe('lowpass', () => {
  it('passes low tones and removes high ones', () => {
    const low = lowpass(sine(0.2, 200), 1000);
    const high = lowpass(sine(0.2, 8000), 1000);
    expect(rms(slice(low, 0.05))).toBeGreaterThan(0.65);
    expect(rms(slice(high, 0.05))).toBeLessThan(0.02);
  });
});

describe('softLimit', () => {
  it('never passes the ceiling and leaves quiet samples alone', () => {
    const signal = Float32Array.from([0.1, -0.2, 0.9, -1.5, 3]);
    softLimit(signal, -1);
    expect(peak(signal)).toBeLessThanOrEqual(fromDb(-1));
    expect(signal[0]).toBeCloseTo(0.1);
    expect(signal[1]).toBeCloseTo(-0.2);
  });
});

describe('reverb', () => {
  it('rings after the input and dies away', () => {
    const click = new Float32Array(toSamples(0.01));
    click[0] = 1;
    const wet = reverb(click, { decay: 0.5 });
    expect(rms(slice(wet, 0.05, 0.1))).toBeGreaterThan(rms(slice(wet, 0.4, 0.45)) * 10);
  });
});

describe('loops', () => {
  it('crossfades noise into a lap with no seam', () => {
    const noise = lowpass(whiteNoise(1.2, createRandom(3)), 500);
    const loop = crossfadeLoop(noise, 1, 0.1);
    expect(loop.length).toBe(toSamples(1));
    expect(seamRatio(loop)).toBeLessThan(4);
  });

  it('wraps sounds that run past the end back to the start', () => {
    const loop = new Float32Array(10);
    mixCircular(loop, Float32Array.from([1, 2, 3]), 8 / 44100);
    expect(Array.from(loop)).toEqual([3, 0, 0, 0, 0, 0, 0, 0, 1, 2]);
  });

  it('keeps a filtered loop continuous across the seam', () => {
    const loop = crossfadeLoop(whiteNoise(1.2, createRandom(5)), 1, 0.1);
    const filtered = processLoop(loop, (signal) => lowpass(signal, 300));
    expect(seamRatio(filtered)).toBeLessThan(4);
  });

  it('pads a loop so any lap length window inside is the same loop', () => {
    const loop = Float32Array.from({ length: toSamples(0.1) }, (_, i) => Math.sin(i / 9));
    const padded = padLoop(loop, 0.01);
    const shift = toSamples(0.004);
    const window = padded.slice(shift, shift + loop.length);
    const rotated = Float32Array.from(loop, (_, i) => loop[(i + loop.length - toSamples(0.01) + shift) % loop.length]);
    expect(Array.from(window)).toEqual(Array.from(rotated));
  });
});

describe('saw', () => {
  it('ramps between -1 and 1 with no offset', () => {
    const wave = saw(0.5, 220);
    expect(Math.abs(mean(wave))).toBeLessThan(0.01);
    expect(peak(wave)).toBeLessThan(1.2);
    expect(rms(wave)).toBeCloseTo(1 / Math.sqrt(3), 1);
  });
});

describe('highpass', () => {
  it('removes low tones and passes high ones', () => {
    expect(rms(slice(highpass(sine(0.2, 40), 1000), 0.05))).toBeLessThan(0.01);
    expect(rms(slice(highpass(sine(0.2, 8000), 1000), 0.05))).toBeGreaterThan(0.65);
  });
});
