import { MAX_ONE_SHOT } from './config';
import { fadeEdges } from './dsp/envelopes';
import { normalisePeak, softLimit } from './dsp/dynamics';
import { onePoleHighpass } from './dsp/filters';
import { toSeconds, type Signal } from './dsp/signal';
import type { Recipe } from './recipes/types';

/** Nothing leaves the build louder than this. */
export const CEILING_DB = -1;

/**
 * Renders a recipe and gives it the same finishing chain as every other sound:
 * DC removed, edges faded to silence, level set, then a soft limit.
 */
export function master(recipe: Recipe): Signal {
  const audio = recipe.render();
  if (toSeconds(audio.length) > MAX_ONE_SHOT) throw new Error(`${recipe.name} is longer than ${MAX_ONE_SHOT} s`);
  onePoleHighpass(audio, 18);
  fadeEdges(audio, 0.0003, 0.004);
  normalisePeak(audio, recipe.peakDb);
  return softLimit(audio, CEILING_DB);
}
