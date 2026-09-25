import { beforeEach, describe, expect, it } from 'vitest';
import { WHEEL_LEAD } from '../spiral/loop';
import { spiralMotion } from '../state/spiralMotion';
import { coalesce, notch, swipe } from './__tests__/wheelStreams';
import { stepSpiral } from './steering';
import { createWheelGesture } from './wheelGesture';
import type { WheelSample } from './wheelSample';

/**
 * Replays the browser wheel proof, event for event, as a busy test machine
 * delivered it at 1440 by 900. Each stroke arrives with the spiral as far
 * along as it was then, often still turning from the stroke before.
 */
interface Stroke {
  samples: WheelSample[];
  /** Where the spiral was when the stroke arrived. */
  value: number;
  /** False where the spiral may not take the wheel: over the panel, or with the stage scrolled away. */
  over?: boolean;
}

const doubleSwipe = (at: number) => [...swipe({ at, peak: 50 }).slice(0, 28), ...swipe({ at: at + 28 * 16, peak: 50 })];
const glideUp = (at: number) => [...swipe({ at, peak: -120 }), ...swipe({ at: at + 74 * 16, peak: -120 })];

const run: Stroke[] = [
  { samples: [notch(67796, 100)], value: 0 },
  { samples: [notch(85340, 100)], value: 0.56 },
  { samples: [notch(97651, 100)], value: 1.449 },
  { samples: [notch(158767, -100)], value: 2.999 },
  { samples: swipe({ at: 190884, peak: 45 }), value: 2.18 },
  { samples: doubleSwipe(234231), value: 2.987 },
  { samples: swipe({ at: 257048, peak: 40, axis: 'x' }), value: 4.564 },
  { samples: swipe({ at: 297505, peak: -40, axis: 'x' }), value: 5.984 },
  { samples: [notch(329027, 300)], value: 5, over: false },
  { samples: [notch(371323, 200)], value: 5, over: false },
  { samples: glideUp(419821), value: 5, over: false },
  { samples: swipe({ at: 454115, peak: 45 }), value: 5 },
];
/** The card the spiral heads for after each stroke. */
const targets = [1, 2, 3, 2, 3, 5, 6, 5, 5, 5, 5, 6];

/** Plays the strokes through the gesture and the steering, and returns the target after each one. */
function play(strokes: Stroke[]) {
  const gesture = createWheelGesture();
  return strokes.map(({ samples, value, over = true }) => {
    spiralMotion.value = value;
    for (const sample of samples) {
      const read = gesture.read(sample, () => over);
      if (read.capture && read.step !== 0) stepSpiral(read.step, WHEEL_LEAD);
    }
    return spiralMotion.target;
  });
}

describe('the wheel proof, replayed', () => {
  beforeEach(() => {
    spiralMotion.target = 0;
    spiralMotion.value = 0;
  });

  it('turns one project per stroke and two for a fresh swipe during a tail', () => {
    expect(play(run)).toEqual(targets);
  });

  it('turns the same when a busy page merges the swipes into fewer, bigger events', () => {
    for (const frames of [2, 3, 4]) {
      spiralMotion.target = 0;
      const merged = run.map((stroke) => ({ ...stroke, samples: coalesce(stroke.samples, frames) }));
      expect(play(merged)).toEqual(targets);
    }
  });

  it('turns the same when a stall hands over the start of every swipe as one event', () => {
    spiralMotion.target = 0;
    const stalled = run.map((stroke) => ({ ...stroke, samples: coalesce(stroke.samples, 2, 6) }));
    expect(play(stalled)).toEqual(targets);
  });
});
