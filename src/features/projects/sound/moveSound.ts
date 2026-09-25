import { sound } from '@/features/sound';

/**
 * Closest two move sounds may fall, in milliseconds. A faster run is played
 * out at this pace instead, so no project passes without its sound.
 */
export const MIN_SPACING = 55;
/** A sound at least this long after the last one plays at full volume. */
export const CALM_GAP = 400;
/** Volume of a sound right on the heels of the last one. Quick runs stay gentle but never get lost. */
export const SOFTEST = 0.7;
/**
 * The next project sounds once the view is within this many projects of it,
 * or past it: as the view sets off toward it from the project before. A
 * press from rest sounds at once, and a run keeps pace with the projects as
 * they pass.
 */
const REACH = 1.001;

/** Volume for a sound `gap` milliseconds after the last: softer the quicker they come. */
export function runVolume(gap: number) {
  if (gap >= CALM_GAP) return 1;
  const calm = Math.max(0, gap - MIN_SPACING) / (CALM_GAP - MIN_SPACING);
  return SOFTEST + (1 - SOFTEST) * calm;
}

/**
 * The one sound of the Projects section: once for every project the focus
 * moves to, however it moves. Feed it where the view is and which project it
 * heads for, as often as they change. Pure apart from `play`, so it is unit
 * tested.
 */
export function createMoveSound(play: (volume: number) => void) {
  /** The last project that sounded, or null until the first reading. */
  let sounded: number | null = null;
  let goal = 0;
  let lastSound = -Infinity;

  return {
    /** The view is at `position` (a continuous project index) and heads for `heading`, at time `now`. */
    track(position: number, heading: number, now: number) {
      goal = Math.round(heading);
      // Where the view opens is not a move.
      if (sounded === null) sounded = Math.round(position);
      if (sounded === goal || now - lastSound < MIN_SPACING) return;
      const direction = Math.sign(goal - sounded);
      const next = sounded + direction;
      // Too far ahead of the view to sound yet. A view already past it catches up at the spacing.
      if ((next - position) * direction > REACH) return;
      play(runVolume(now - lastSound));
      sounded = next;
      lastSound = now;
    },
    /** True while some project the view heads for has not sounded yet, so the caller keeps calling. */
    pending() {
      return sounded !== null && sounded !== goal;
    },
  };
}

/** A move sound that plays through the site audio. Each view that moves between projects owns one. */
export function createProjectMoveSound() {
  return createMoveSound((volume) => sound.play('move', { volume }));
}
