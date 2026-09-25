import { DECODER_DELAY, GAP, LEAD_IN, REGION_LEAD, REGION_TAIL } from './config';
import { SAMPLE_RATE, concat, silence, toSamples, type Signal } from './dsp/signal';
import type { Recipe } from './recipes/types';

export interface Placed {
  recipe: Recipe;
  audio: Signal;
  /** First sample of the sound itself in the sprite. */
  start: number;
}

export interface SpriteLayout {
  buffer: Signal;
  placed: Placed[];
}

/** Region the player uses, in milliseconds of decoded audio. */
export interface Region {
  start: number;
  duration: number;
}

/** Lays every sound end to end with silent gaps. */
export function layoutSprite(sounds: { recipe: Recipe; audio: Signal }[]): SpriteLayout {
  const parts: Signal[] = [silence(LEAD_IN)];
  const placed: Placed[] = [];
  let cursor = parts[0].length;

  for (const { recipe, audio } of sounds) {
    placed.push({ recipe, audio, start: cursor });
    parts.push(audio, silence(GAP));
    cursor += audio.length + toSamples(GAP);
  }
  return { buffer: concat(...parts), placed };
}

export const toMs = (samples: number) => (samples / SAMPLE_RATE) * 1000;

/**
 * Where each sound sits once decoded, shifted by the decoder delay, with a
 * little slack on both sides.
 */
export function regionOf({ audio, start }: Placed): Region {
  const lead = REGION_LEAD * 1000;
  return { start: toMs(start + DECODER_DELAY) - lead, duration: toMs(audio.length) + lead + REGION_TAIL * 1000 };
}
