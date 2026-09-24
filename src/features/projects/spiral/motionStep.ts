import { damp, smoothstep } from '@/lib/math';
import type { SpiralMotion } from '../state/spiralMotion';
import { stepSpring } from './spring';
import { firstIndex, isInsideDeck } from './track';

/** Seconds the damped index takes to catch up with the scroll. Enough to feel weighty. */
const SMOOTH_TIME = 0.2;

/** Closer than this to a card, and slower than the speed below, the spiral counts as resting. */
const REST_DISTANCE = 0.012;
const REST_SPEED = 0.12;

/**
 * Advances the spiral by one frame toward `target`, the index the scroll asks
 * for. Updates the damped index, how settled it is, how far it has moved aside
 * for the panel and the entrance. Mutates `motion` so nothing is allocated.
 */
export function stepMotion(motion: SpiralMotion, target: number, count: number, delta: number, reducedMotion: boolean) {
  motion.target = target;
  stepSpring(motion, target, reducedMotion ? 0.04 : SMOOTH_TIME, delta);

  const nearest = Math.round(motion.value);
  const resting =
    isInsideDeck(nearest, count) &&
    Math.abs(motion.value - nearest) < REST_DISTANCE &&
    Math.abs(target - nearest) < REST_DISTANCE &&
    Math.abs(motion.velocity) < REST_SPEED &&
    !motion.dragging;
  motion.settle = damp(motion.settle, resting ? 1 : 0, resting ? 5 : 12, delta);

  // Centred like a poster for the intro, then aside for the panel until the stage scrolls away.
  motion.engaged = smoothstep(firstIndex() + 0.05, -0.08, motion.value);

  motion.reveal = reducedMotion ? 1 : damp(motion.reveal, 1, 2.4, delta);
  return motion;
}
