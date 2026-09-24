import { describe, expect, it } from 'vitest';
import { endOf, notch, swipe } from './__tests__/wheelStreams';
import { createWheelGesture } from './wheelGesture';
import { IDLE_GAP, type WheelSample } from './wheelStrokes';

/** Feeds the samples, asking `capturable` at each one, and sums up what the spiral did. */
function play(samples: WheelSample[], capturable: (sample: WheelSample, index: number) => boolean) {
  const gesture = createWheelGesture();
  const reads = samples.map((sample, index) => gesture.read(sample, () => capturable(sample, index)));
  return {
    captured: reads.filter((read) => read.capture).length,
    passed: reads.filter((read) => !read.capture).length,
    steps: reads.map((read) => read.step).filter((step) => step !== 0),
  };
}

describe('createWheelGesture', () => {
  it('takes every event of a stroke over the spiral, and steps once', () => {
    const samples = swipe();
    expect(play(samples, () => true)).toEqual({ captured: samples.length, passed: 0, steps: [1] });
  });

  it('leaves the wheel to the page where the spiral may not take it', () => {
    const samples = [...swipe(), notch(2000, 100)];
    expect(play(samples, () => false)).toEqual({ captured: 0, passed: samples.length, steps: [] });
  });

  it('keeps a page scroll with the page until the wheel goes idle, even once it reaches the spiral', () => {
    // The page glides up to the top, and the stage arrives under the pointer halfway through the tail.
    const scroll = swipe({ peak: -80 });
    const halfway = Math.floor(scroll.length / 2);
    const later = swipe({ at: endOf(scroll) + IDLE_GAP + 50, peak: -40 });
    const result = play([...scroll, ...later], (_, index) => index >= halfway);
    expect(result.steps).toEqual([-1]);
    expect(result.passed).toBe(scroll.length);
  });

  it('keeps a page scroll with the page through a fresh swipe during its tail', () => {
    const first = swipe({ peak: 60 });
    const cut = first.findIndex((sample) => sample.time >= 400);
    const second = swipe({ at: first[cut].time + 16, peak: 60 });
    const result = play([...first.slice(0, cut + 1), ...second], (_, index) => index > cut);
    expect(result).toEqual({ captured: 0, passed: cut + 1 + second.length, steps: [] });
  });

  it('keeps a spiral stroke to its end when the pointer drifts onto the panel', () => {
    const samples = swipe();
    const result = play(samples, (_, index) => index === 0);
    expect(result).toEqual({ captured: samples.length, passed: 0, steps: [1] });
  });

  it('hands the next stroke to the page once the pointer is over the panel', () => {
    const first = swipe({ peak: 50 });
    const cut = first.findIndex((sample) => sample.time >= 450);
    const second = swipe({ at: first[cut].time + 16, peak: 50 });
    const result = play([...first.slice(0, cut + 1), ...second], (_, index) => index <= cut);
    // The first event or two of the new swipe still read as the old tail, until it speeds up.
    expect(result.steps).toEqual([1]);
    expect(result.passed).toBeGreaterThanOrEqual(second.length - 2);
  });

  it('asks again with every notch, so each one goes where the pointer is', () => {
    const samples = [notch(0, 100), notch(300, 100), notch(600, 100), notch(900, 100)];
    const result = play(samples, (_, index) => index !== 2);
    expect(result).toEqual({ captured: 3, passed: 1, steps: [1, 1, 1] });
  });

  it('gives the spiral a new gesture after the page has gone idle', () => {
    const samples = [notch(0, 100), notch(40, 100), notch(40 + IDLE_GAP, 100)];
    const result = play(samples, (_, index) => index === 2);
    expect(result).toEqual({ captured: 1, passed: 2, steps: [1] });
  });
});
