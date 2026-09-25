import { sound } from '@/features/sound';

/**
 * Moves closer together than this, in milliseconds, belong to one gesture: a
 * quick wheel spin, or a key held down while the spiral turns at full speed.
 * Only the first of them sounds, so a spin never machine guns.
 */
export const GESTURE_GAP = 250;
/** A sound this soon after the last one, in milliseconds, plays softer, so quick steps stay gentle. */
export const SOFTER_WITHIN = 600;
/** Volume of a sound that comes soon after the last one. */
export const SOFTER = 0.6;

/**
 * The rule for the one sound of the Projects section. Pure apart from
 * `play`, so it is unit tested.
 */
export function createMoveSound(play: (volume: number) => void) {
  /** A move before this time, in milliseconds, belongs to the last move's gesture. */
  let movedUntil = -Infinity;
  /** So does a move before this time, while the strip still glides on from that gesture. */
  let glideUntil = -Infinity;
  let lastSound = -Infinity;

  return {
    /** The focused project changed at `now`, however it moved. */
    move(now: number) {
      const live = now < Math.max(movedUntil, glideUntil);
      movedUntil = now + GESTURE_GAP;
      glideUntil = movedUntil;
      if (live) return;
      play(now - lastSound < SOFTER_WITHIN ? SOFTER : 1);
      lastSound = now;
    },
    /**
     * Something still moves at `now`. A gesture stays one gesture while it
     * glides on, however slowly it passes the last projects.
     */
    hold(now: number) {
      if (now < glideUntil) glideUntil = now + GESTURE_GAP;
    },
    /**
     * A new touch, tap or swipe begins. What moves from here on is its own
     * doing, not the last gesture gliding on, so only the gap between moves
     * still joins them.
     */
    endGlide() {
      glideUntil = -Infinity;
    },
  };
}

const moveSound = createMoveSound((volume) => sound.play('move', { volume }));

/** Plays the soft move sound: the spiral heads for another project, or the phone strip reaches one. */
export function soundMove() {
  moveSound.move(performance.now());
}

/** Keeps the last move's gesture going, for the phone strip while it scrolls. */
export function holdMove() {
  moveSound.hold(performance.now());
}

/** Stops the phone strip's scrolling from holding the last gesture open, as a new one begins. */
export function endMoveGlide() {
  moveSound.endGlide();
}
