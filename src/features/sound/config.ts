import type { SoundName } from './types';

export interface OneShotSettings {
  /** Base level, multiplied by the caller's volume. */
  volume: number;
  /** Repeats closer together than this are dropped, in ms. */
  throttle: number;
  /** How many copies of this sound may ring at once. */
  voices: number;
  /** Random pitch spread for this sound, when it wants less than PITCH_JITTER. */
  jitter?: number;
}

/** The final mix. The sprite is already balanced by ear, so these are gentle trims. */
export const SOUNDS: Record<SoundName, OneShotSettings> = {
  hover: { volume: 0.8, throttle: 90, voices: 2 },
  tab: { volume: 0.8, throttle: 80, voices: 2 },
  toggle: { volume: 0.9, throttle: 80, voices: 2 },
  dot: { volume: 0.6, throttle: 50, voices: 3 },
  blip: { volume: 0.8, throttle: 120, voices: 2 },
  move: { volume: 0.8, throttle: 40, voices: 4, jitter: 0.012 },
};

/**
 * Background music level. The track is mastered to -20 dBFS RMS, so this puts it
 * near -41 dBFS, a soft bed. Even its loudest moments land 8 to 13 dB under the
 * clicks, as scripts/sounds/check.ts measures them.
 */
export const MUSIC_VOLUME = 0.09;

/** The music swells in this slowly when sound turns on or the tab comes back. */
export const MUSIC_FADE_IN_MS = 2000;
/** And fades out this slowly when sound turns off. */
export const MUSIC_FADE_OUT_MS = 1200;
/** Leaving the tab only takes a quick fade before the music pauses. */
export const MUSIC_HIDE_FADE_MS = 250;

/** Everything goes through this master level. */
export const MASTER_VOLUME = 0.8;

/** Most one-shots ringing at once, across all sounds. */
export const MAX_VOICES = 8;

/** Random pitch spread on every one-shot: 0.04 is plus or minus 4 percent. */
export const PITCH_JITTER = 0.04;

/** Playback rates that still sound natural. */
export const RATE_RANGE = [0.5, 2] as const;

/** Sound starts off. The visitor opts in. */
export const DEFAULT_ENABLED = false;

export const STORAGE_KEY = 'edisonlaw:sound';

/** If the sprite arrives later than this after switching on, the confirming click is skipped. */
export const TOGGLE_FEEDBACK_MS = 1500;
