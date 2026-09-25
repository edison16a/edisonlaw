/** Build settings for the audio sprite. */

/** Output paths, relative to the repository root. */
export const SPRITE_FILE = 'public/audio/sprite.mp3';
export const SPRITE_MODULE = 'src/features/sound/sprite.ts';
/** Public URL the page loads the sprite from. */
export const SPRITE_PATH = '/audio/sprite.mp3';

/** MP3 bitrate in kbps. Mono at 112 keeps soft transients clean at a small size. */
export const BITRATE = 112;

/** Silence before the first sound, and between neighbours, in seconds. */
export const LEAD_IN = 0.1;
export const GAP = 0.2;

/**
 * MP3 decoders put this many samples of delay before the first real one: LAME's 576 sample
 * encoder delay plus the 529 sample delay of the decoder filter bank.
 * Checked against Chromium's decoder by scripts/sounds/check.ts.
 */
export const DECODER_DELAY = 1105;

/**
 * One-shot regions open this early and close this late, in seconds. A decoder that
 * trims its own delay (and so runs up to 12 ms early) still never clips an attack.
 */
export const REGION_LEAD = 0.013;
export const REGION_TAIL = 0.02;

/** Longest a sprite sound may be, in seconds. */
export const MAX_ONE_SHOT = 0.5;
