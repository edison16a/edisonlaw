import { LOOP_RANGE, MAX_ONE_SHOT } from './config';
import { fadeEdges } from './dsp/envelopes';
import { normalisePeak, normaliseRms, removeDc, softLimit } from './dsp/dynamics';
import { onePoleHighpass } from './dsp/filters';
import { toSamples, toSeconds, type Signal } from './dsp/signal';
import type { Recipe } from './recipes/types';

/** Nothing leaves the build louder than this. */
const CEILING_DB = -1;

/**
 * Renders a recipe and gives it the same finishing chain as every other sound:
 * DC removed, edges faded to silence (one-shots), level set, then a soft limit.
 */
export function master(recipe: Recipe): Signal {
  const audio = recipe.render();

  if (recipe.kind === 'oneShot') {
    if (toSeconds(audio.length) > MAX_ONE_SHOT) throw new Error(`${recipe.name} is longer than ${MAX_ONE_SHOT} s`);
    onePoleHighpass(audio, 18);
    fadeEdges(audio, 0.0003, 0.004);
    normalisePeak(audio, recipe.peakDb);
    return softLimit(audio, CEILING_DB);
  }

  const [min, max] = LOOP_RANGE;
  if (audio.length !== toSamples(recipe.seconds)) throw new Error(`${recipe.name} must render exactly one lap`);
  if (recipe.seconds < min || recipe.seconds > max) throw new Error(`${recipe.name} must loop every ${min} to ${max} s`);
  // Mean removal and a per sample limiter both keep the loop seamless.
  removeDc(audio);
  normaliseRms(audio, recipe.rmsDb);
  return softLimit(audio, CEILING_DB);
}
