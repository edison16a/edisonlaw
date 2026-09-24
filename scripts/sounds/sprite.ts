import { DECODER_DELAY, GAP, LEAD_IN, LOOP_PAD, REGION_LEAD, REGION_TAIL } from './config';
import { padLoop } from './dsp/loop';
import { SAMPLE_RATE, concat, silence, toSamples, type Signal } from './dsp/signal';
import type { Recipe } from './recipes/types';

export interface Placed {
  recipe: Recipe;
  audio: Signal;
  /** First sample of the sound itself in the sprite (for loops, the start of the lap). */
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
  loop: boolean;
}

/** Lays every sound end to end with silent gaps. Loops carry a wraparound pad on each side. */
export function layoutSprite(sounds: { recipe: Recipe; audio: Signal }[]): SpriteLayout {
  const parts: Signal[] = [silence(LEAD_IN)];
  const placed: Placed[] = [];
  let cursor = parts[0].length;

  for (const { recipe, audio } of sounds) {
    const isLoop = recipe.kind === 'loop';
    const body = isLoop ? padLoop(audio, LOOP_PAD) : audio;
    placed.push({ recipe, audio, start: cursor + (isLoop ? toSamples(LOOP_PAD) : 0) });
    parts.push(body, silence(GAP));
    cursor += body.length + toSamples(GAP);
  }
  return { buffer: concat(...parts), placed };
}

const toMs = (samples: number) => (samples / SAMPLE_RATE) * 1000;

/**
 * Where each sound sits once decoded, shifted by the decoder delay. One-shots get a little
 * slack on both sides; loops are exact, their padding absorbs any small misalignment.
 */
export function regionOf({ recipe, audio, start }: Placed): Region {
  const decodedStart = toMs(start + DECODER_DELAY);
  if (recipe.kind === 'loop') return { start: decodedStart, duration: toMs(audio.length), loop: true };
  const lead = REGION_LEAD * 1000;
  return { start: decodedStart - lead, duration: toMs(audio.length) + lead + REGION_TAIL * 1000, loop: false };
}
