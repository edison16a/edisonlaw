import { damp, smoothstep } from '@/lib/math';
import type { SpiralMotion } from '../state/spiralMotion';
import { stepSpring } from './spring';

/** Seconds the damped index takes to catch up with its target. Enough to feel weighty. */
const SMOOTH_TIME = 0.26;
/** Tighter while dragging, so the cards stay under the pointer. */
const DRAG_SMOOTH_TIME = 0.1;
/** Short and calm for visitors who prefer reduced motion. */
const CALM_SMOOTH_TIME = 0.05;

/** Closer than this to a card, and slower than the speed below, the spiral counts as resting. */
const REST_DISTANCE = 0.012;
const REST_SPEED = 0.12;

/** Travel from the intro pose, in cards, over which the scene slides aside for the panel. */
const ENGAGE_FROM = 0.05;
const ENGAGE_TO = 0.42;
/** Travel from the intro pose, in cards, after which the intro is over for the visit. */
const INTRO_EXIT = 0.45;
/** Travel from the intro pose, in cards, within which the intro caption still shows. */
const INTRO_CAPTION = 0.25;

/**
 * Advances the spiral by one frame toward its target. Updates the damped
 * index, how settled it is, how far it has moved aside for the panel and the
 * entrance. Mutates `motion` so nothing is allocated.
 */
export function stepMotion(motion: SpiralMotion, delta: number, reducedMotion: boolean) {
  const smoothTime = reducedMotion ? CALM_SMOOTH_TIME : motion.dragging ? DRAG_SMOOTH_TIME : SMOOTH_TIME;
  stepSpring(motion, motion.target, smoothTime, delta);

  const nearest = Math.round(motion.value);
  const resting =
    Math.abs(motion.value - nearest) < REST_DISTANCE &&
    Math.abs(motion.target - nearest) < REST_DISTANCE &&
    Math.abs(motion.velocity) < REST_SPEED &&
    !motion.dragging;
  motion.settle = damp(motion.settle, resting ? 1 : 0, resting ? 5 : 12, delta);

  // Centred like a poster for the intro, then aside for the panel for good.
  const fromIntro = motion.introAt === null ? Infinity : Math.abs(motion.value - motion.introAt);
  if (fromIntro >= INTRO_EXIT) motion.introAt = null;
  motion.engaged = motion.introAt === null ? 1 : smoothstep(ENGAGE_FROM, ENGAGE_TO, fromIntro);

  motion.reveal = reducedMotion ? 1 : damp(motion.reveal, 1, 2.4, delta);
  return motion;
}

/** True while the spiral still waits in its opening pose, before it leaves for a card. */
export function isInIntro(motion: SpiralMotion) {
  return motion.introAt !== null && Math.abs(motion.value - motion.introAt) < INTRO_CAPTION;
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
    !motion.dragging &&
    Math.abs(motion.target - motion.value) < STILL / 10 &&
    Math.abs(motion.velocity) < STILL &&
    (motion.settle < STILL || motion.settle > 1 - STILL) &&
    motion.reveal > 1 - STILL
  );
}
