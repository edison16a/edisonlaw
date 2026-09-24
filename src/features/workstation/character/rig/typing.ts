import { lerp } from '@/lib/math';
import { hash01, smootherstep } from './timeline';
import type { Side } from './types';

/** One hand's typing state at a moment in time. */
export interface Keystroke {
  /** Finger pressing now: 0 index to 3 little. */
  finger: number;
  /** 0 to 1, how far that finger is pushed down. */
  press: number;
  /** Where on the keyboard the hand hovers, relative to its home row position, in metres. */
  across: number;
  along: number;
}

export const createKeystroke = (): Keystroke => ({ finger: 0, press: 0, across: 0, along: 0 });

const TYPING = {
  /** Key presses per second for each hand. */
  rate: 3.7,
  /** Share of each beat spent pushing a key down and letting it up. */
  pressShare: 0.34,
  /** Share of beats with no press, which breaks up the rhythm. */
  rest: 0.2,
  reachAcross: 0.036,
  reachAlong: 0.026,
} as const;

function keyOffset(beat: number, seed: number, axis: number, reach: number) {
  return (hash01(beat, seed + axis) * 2 - 1) * reach;
}

/**
 * Fast irregular key presses for one hand. The two hands run half a beat apart and the tempo
 * drifts, so it reads as real typing rather than a metronome. The hand glides toward the next key
 * in the back half of each beat.
 */
export function keystrokeAt(t: number, seed: number, side: Side, out: Keystroke) {
  const handSeed = seed + (side > 0 ? 0 : 977);
  const phase = t * TYPING.rate + 0.5 * Math.sin(t * 0.83 + seed) + 0.25 * Math.sin(t * 2.1) + (side > 0 ? 0 : 0.5);
  const beat = Math.floor(phase);
  const f = phase - beat;

  const pressing = hash01(beat, handSeed) > TYPING.rest && f < TYPING.pressShare;
  out.finger = Math.floor(hash01(beat, handSeed + 1) * 4);
  out.press = pressing ? Math.sin((f / TYPING.pressShare) * Math.PI) ** 1.5 : 0;

  const glide = smootherstep(0.4, 1, f);
  out.across = lerp(
    keyOffset(beat, handSeed, 11, TYPING.reachAcross),
    keyOffset(beat + 1, handSeed, 11, TYPING.reachAcross),
    glide,
  );
  out.along = lerp(
    keyOffset(beat, handSeed, 23, TYPING.reachAlong),
    keyOffset(beat + 1, handSeed, 23, TYPING.reachAlong),
    glide,
  );
  return out;
}
