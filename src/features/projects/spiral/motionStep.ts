import { damp } from '@/lib/math';
import type { SpiralMotion } from '../state/spiralMotion';
import { stepSpring } from './spring';

/** Seconds the index takes to catch up with its target. Long enough to feel weighty. */
const SMOOTH_TIME = 0.32;
/** Fastest the spiral turns, in cards per second, so a queue of presses spins steadily instead of racing. */
const MAX_SPEED = 5;
/**
 * A click on a far card may go faster, so that it covers the distance at
 * about this many seconds' worth of cruising and a long jump never drags.
 */
const LONG_JUMP_TIME = 0.8;
/** Short and calm for visitors who prefer reduced motion. */
const CALM_SMOOTH_TIME = 0.06;
/** Held by the mouse, the spiral keeps this close behind it, with no speed limit. */
const HELD_SMOOTH_TIME = 0.05;

/**
 * Closer than this to its card, and slower than the speed below, the spiral
 * counts as landing, and the card starts to come forward while it glides the
 * last hair into place.
 */
const REST_DISTANCE = 0.03;
const REST_SPEED = 0.3;

/**
 * Advances the spiral by one frame toward its target. Updates the index, how
 * settled it is and the entrance. Mutates `motion` so nothing is allocated.
 */
export function stepMotion(motion: SpiralMotion, delta: number, reducedMotion: boolean) {
  const smoothTime = motion.held ? HELD_SMOOTH_TIME : reducedMotion ? CALM_SMOOTH_TIME : SMOOTH_TIME;
  const maxSpeed = Math.max(MAX_SPEED, Math.abs(motion.target - motion.value) / LONG_JUMP_TIME);
  stepSpring(motion, motion.target, smoothTime, delta, reducedMotion || motion.held ? Infinity : maxSpeed);

  const nearest = Math.round(motion.value);
  const resting =
    Math.abs(motion.value - nearest) < REST_DISTANCE &&
    Math.abs(motion.target - nearest) < REST_DISTANCE &&
    Math.abs(motion.velocity) < REST_SPEED;
  // The card comes forward gently and steps back quickly, so a move gets going at once.
  motion.settle = damp(motion.settle, resting ? 1 : 0, resting ? 5 : 12, delta);

  motion.reveal = reducedMotion ? 1 : damp(motion.reveal, 1, 2.4, delta);
  return motion;
}

/** Closer than this, a value counts as having reached where it is heading. */
const STILL = 0.001;

/**
 * True once another frame would change nothing: the spiral has caught up with
 * its target, settled one way or the other and finished its entrance. The
 * canvas stops drawing until something wakes it.
 */
export function isAtRest(motion: SpiralMotion) {
  return (
    Math.abs(motion.target - motion.value) < STILL / 10 &&
    Math.abs(motion.velocity) < STILL &&
    (motion.settle < STILL || motion.settle > 1 - STILL) &&
    motion.reveal > 1 - STILL
  );
}
