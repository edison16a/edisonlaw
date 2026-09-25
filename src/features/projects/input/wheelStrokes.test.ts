import { describe, expect, it } from 'vitest';
import { coalesce, endOf, notch, swipe } from './__tests__/wheelStreams';
import type { WheelSample } from './wheelSample';
import { createWheelStrokes, IDLE_GAP } from './wheelStrokes';

/** Feeds the samples in order and returns every step they asked for, in order. */
function stepsFor(samples: WheelSample[]) {
  const strokes = createWheelStrokes();
  return samples.map((sample) => strokes.read(sample).step).filter((step) => step !== 0);
}

describe('createWheelStrokes', () => {
  it('turns one step per mouse wheel notch', () => {
    expect(stepsFor([notch(0, 100), notch(400, 100), notch(800, 100)])).toEqual([1, 1, 1]);
    expect(stepsFor([notch(0, -100), notch(400, -100)])).toEqual([-1, -1]);
  });

  it('counts every notch of a spin, however quick', () => {
    for (const gap of [8, 16, 20, 24, 40, 120]) {
      const spin = [0, 1, 2, 3, 4].map((index) => notch(index * gap, 100));
      expect(stepsFor(spin)).toEqual([1, 1, 1, 1, 1]);
    }
  });

  it('counts each of a few notches merged into one event once a second event has shown the notch size', () => {
    const steps = (samples: WheelSample[]) => {
      const strokes = createWheelStrokes();
      return samples.map((sample) => strokes.read(sample).step);
    };
    expect(steps([notch(0, 100), notch(24, 100), notch(40, 300), notch(56, -200)])).toEqual([1, 1, 3, -2]);
    // Until then, a trackpad could have begun the stroke, so a merged event counts once.
    expect(steps([notch(0, 100), notch(40, 300), notch(56, -200)])).toEqual([1, 1, -2]);
  });

  it('turns back at once when the wheel turns back', () => {
    expect(stepsFor([notch(0, 100), notch(10, -100)])).toEqual([1, -1]);
  });

  it('reads wheels that report lines or pages as one notch per event', () => {
    expect(stepsFor([notch(0, 3, 1), notch(30, 3, 1), notch(60, -3, 1)])).toEqual([1, 1, -1]);
    expect(stepsFor([notch(0, 1, 2)])).toEqual([1]);
  });

  it('turns once for a whole trackpad swipe, momentum tail included', () => {
    const samples = swipe();
    expect(endOf(samples)).toBeGreaterThan(800);
    expect(stepsFor(samples)).toEqual([1]);
    expect(stepsFor(swipe({ peak: -60 }))).toEqual([-1]);
  });

  it('turns as soon as the swipe starts, not when it ends', () => {
    const strokes = createWheelStrokes();
    const reads = swipe().map((sample) => strokes.read(sample));
    expect(reads.findIndex((read) => read.step !== 0)).toBeLessThanOrEqual(2);
  });

  it('turns once for a slow swipe and a fast one alike', () => {
    expect(stepsFor(swipe({ peak: 8 }))).toEqual([1]);
    expect(stepsFor(swipe({ peak: 120, decay: 0.95 }))).toEqual([1]);
  });

  it('turns once for a fast swipe that a busy page hands over as a few big events', () => {
    // Two, three or four frames to an event: a page held back to 30, 20 or 15 frames a second.
    for (const frames of [2, 3, 4]) {
      expect(stepsFor(coalesce(swipe({ peak: 45 }), frames))).toEqual([1]);
      expect(stepsFor(coalesce(swipe({ peak: -120, decay: 0.95 }), frames))).toEqual([-1]);
    }
    // A flick that starts big, with an event every 33 milliseconds.
    const flick = [50, 110, 88, 60, 38, 21, 10, 5, 2, 1].map((dy, index) => notch(index * 33, dy));
    expect(stepsFor(flick)).toEqual([1]);
  });

  it('still counts the notches after a first event that merged a few', () => {
    expect(stepsFor([notch(0, 200), notch(60, 100), notch(120, 100)])).toEqual([1, 1, 1]);
  });

  it('turns again for a second swipe after the first has stopped', () => {
    const first = swipe();
    const second = swipe({ at: endOf(first) + IDLE_GAP + 20 });
    expect(stepsFor([...first, ...second])).toEqual([1, 1]);
  });

  it('turns again for a fresh swipe while the last one is still gliding', () => {
    const first = swipe({ peak: 50 });
    const cut = first.findIndex((sample) => sample.time >= 450);
    const second = swipe({ at: first[cut].time + 16, peak: 50 });
    expect(stepsFor([...first.slice(0, cut + 1), ...second])).toEqual([1, 1]);
  });

  it('catches a fresh swipe that starts right as the last tail runs out', () => {
    const first = swipe();
    const second = swipe({ at: endOf(first) + 30 });
    expect(stepsFor([...first, ...second])).toEqual([1, 1]);
  });

  it('turns again for a fresh swipe after one a stalled page began with a big event', () => {
    // A stall hands over the start of a swipe as one event the size of a notch. The rest arrives
    // two frames to an event, too small and too far apart to be notches, and so does the next swipe.
    for (const peak of [15, 20]) {
      const first = coalesce(swipe({ peak }), 2, 6);
      const cut = first.findIndex((sample) => sample.time >= 300);
      const again = coalesce(swipe({ at: first[cut].time + 32, peak }), 2);
      const back = coalesce(swipe({ at: first[cut].time + 32, peak: -peak }), 2);
      expect(stepsFor([...first.slice(0, cut + 1), ...again])).toEqual([1, 1]);
      expect(stepsFor([...first.slice(0, cut + 1), ...back])).toEqual([1, -1]);
    }
  });

  it('turns once for a fast swipe that a stalled page begins with an event the size of a notch', () => {
    // Two frames arrive as one event of 40 pixels or more, and a longer stall then merges more.
    // A trackpad's later event can come close to a whole number of the first, but not exactly.
    expect(stepsFor([notch(5016, 40.09), notch(5080, 363.97)])).toEqual([1]);
    expect(stepsFor([notch(48, -117.3), notch(80, -117.1)])).toEqual([-1]);
    for (const stall of [
      [2, 4, 2],
      [3, 4, 2],
      [2, 3, 2],
      [3, 2, 2],
    ]) {
      for (let peak = 40; peak <= 130; peak += 0.5) {
        for (const decay of [0.9, 0.92, 0.94]) {
          expect(stepsFor(coalesce(swipe({ peak, decay }), 2, ...stall))).toEqual([1]);
          expect(stepsFor(coalesce(swipe({ peak: -peak, decay }), 2, ...stall))).toEqual([-1]);
        }
      }
    }
  });

  it('turns for a swipe that starts a moment after a notch', () => {
    for (const gap of [30, 100, 150]) {
      expect(stepsFor([notch(0, 100), ...swipe({ at: gap, peak: 30 })])).toEqual([1, 1]);
      expect(stepsFor([notch(0, 100), ...swipe({ at: gap, peak: -30 })])).toEqual([1, -1]);
    }
  });

  it('turns back at once when a swipe reverses during the tail', () => {
    const first = swipe({ peak: 50 });
    const cut = first.findIndex((sample) => sample.time >= 300);
    const back = swipe({ at: first[cut].time + 16, peak: -50 });
    expect(stepsFor([...first.slice(0, cut + 1), ...back])).toEqual([1, -1]);
  });

  it('reads sideways swipes: to the left goes on and to the right goes back', () => {
    expect(stepsFor(swipe({ axis: 'x', peak: 40 }))).toEqual([1]);
    expect(stepsFor(swipe({ axis: 'x', peak: -40 }))).toEqual([-1]);
  });

  it('follows the main axis of a diagonal swipe and turns once', () => {
    const samples = swipe({ peak: 40 }).map((sample) => ({ ...sample, dx: -sample.dy * 0.6 }));
    expect(stepsFor(samples)).toEqual([1]);
  });

  it('ignores a brush of the trackpad too small to mean anything', () => {
    expect(stepsFor([notch(0, 1), notch(16, 1.5), notch(32, 1)])).toEqual([]);
  });

  it('ignores uneven timing in a tail', () => {
    // Events 8 and 24 milliseconds apart, each with the travel of its own gap.
    const uneven = swipe({ peak: 40 }).map((sample, index) => {
      const late = index % 2 === 1 && index > 5;
      return late ? { ...sample, time: sample.time + 8, dy: sample.dy * 1.5 } : sample;
    });
    expect(stepsFor(uneven)).toEqual([1]);
    // Timestamps a few milliseconds off with the travel unchanged.
    const jittery = swipe({ peak: 40 }).map((sample, index) => ({ ...sample, time: sample.time + (index % 2 ? 3 : -3) }));
    expect(stepsFor(jittery)).toEqual([1]);
  });

  it('ignores events a busy page merged in a tail', () => {
    // From the ninth frame on, every two frames arrive as one event with the travel of both.
    const samples = swipe({ peak: 40 });
    const merged = samples.flatMap((sample, index) => {
      if (index < 8) return [sample];
      if (index % 2 === 1) return [];
      return [{ ...sample, time: sample.time + 16, dy: sample.dy + (samples[index + 1]?.dy ?? 0) }];
    });
    expect(stepsFor(merged)).toEqual([1]);
  });

  it('keeps small events after a notch with that notch', () => {
    expect(stepsFor([notch(0, 100), notch(16, 6), notch(32, 3)])).toEqual([1]);
  });

  it('says when an event comes after the wheel went idle and when it starts a stroke', () => {
    const strokes = createWheelStrokes();
    const first = strokes.read(notch(0, 2));
    expect(first).toEqual({ idle: true, begins: true, step: 0 });
    expect(strokes.read(notch(16, 4))).toEqual({ idle: false, begins: false, step: 1 });
    expect(strokes.read(notch(16 + IDLE_GAP, 0))).toEqual({ idle: true, begins: false, step: 0 });
  });
});
