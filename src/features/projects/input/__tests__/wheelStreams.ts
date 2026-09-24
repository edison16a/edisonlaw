import type { WheelSample } from '../wheelStrokes';

/**
 * Made up wheel event streams for the wheel tests: mouse wheel notches and
 * trackpad swipes with their momentum tails.
 */

/** One mouse wheel notch. `mode` 1 reports lines, like Firefox does. */
export const notch = (time: number, dy: number, mode = 0): WheelSample => ({ dx: 0, dy, mode, time });

export interface SwipeOptions {
  /** Start time in milliseconds. */
  at?: number;
  /** Biggest travel in one frame, in pixels. Negative goes back. */
  peak?: number;
  axis?: 'x' | 'y';
  /** Milliseconds between events. */
  frame?: number;
  /** Share of the travel kept from one frame to the next as the momentum dies down. */
  decay?: number;
}

/**
 * A trackpad swipe: the finger speeds up over a few frames, lifts, and the
 * momentum glides down to nothing over about a second.
 */
export function swipe({ at = 0, peak = 40, axis = 'y', frame = 16, decay = 0.92 }: SwipeOptions = {}): WheelSample[] {
  const samples: WheelSample[] = [];
  const rise = [0.08, 0.3, 0.65, 0.9, 1];
  let travel = peak;
  for (let index = 0; Math.abs(travel) >= 0.4 || index < rise.length; index++) {
    const value = index < rise.length ? peak * rise[index] : (travel *= decay);
    samples.push({ dx: axis === 'x' ? value : 0, dy: axis === 'y' ? value : 0, mode: 0, time: at + index * frame });
  }
  return samples;
}

/** Time of the last event in a stream. */
export const endOf = (samples: WheelSample[]) => samples[samples.length - 1].time;
