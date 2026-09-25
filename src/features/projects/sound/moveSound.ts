import { sound } from '@/features/sound';

/**
 * Moves closer together than this, in milliseconds, belong to one gesture: a
 * quick wheel spin, a key held down while the spiral turns at full speed, or
 * the phone strip scrolling past a few projects. Only the first of them
 * sounds, so a spin never machine guns.
 */
export const GESTURE_GAP = 250;
/** A sound this soon after the last one, in milliseconds, plays softer, so quick steps stay gentle. */
export const SOFTER_WITHIN = 600;
/** Volume of a sound that comes soon after the last one. */
export const SOFTER = 0.6;

/**
 * The rule for the one sound of the Projects section. Call the returned
 * function with the time each time the focused project changes, however it
 * moved. Pure apart from `play`, so it is unit tested.
 */
export function createMoveSound(play: (volume: number) => void) {
  let lastMove = -Infinity;
  let lastSound = -Infinity;
  return (now: number) => {
    const quiet = now - lastMove;
    lastMove = now;
    if (quiet < GESTURE_GAP) return;
    play(now - lastSound < SOFTER_WITHIN ? SOFTER : 1);
    lastSound = now;
  };
}

const moveSound = createMoveSound((volume) => sound.play('move', { volume }));

/** Plays the soft move sound: the spiral heads for another project, or the phone strip lands on one. */
export function soundMove() {
  moveSound(performance.now());
}
