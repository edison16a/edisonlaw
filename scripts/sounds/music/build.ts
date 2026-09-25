import { fromDb, rms } from '../dsp/analysis';
import { removeDc, softLimit } from '../dsp/dynamics';
import { gain } from '../dsp/signal';
import { CEILING_DB } from '../master';
import { mixdown, warm, type Stereo } from './mixdown';
import { writeScore } from './score';

/**
 * Average level of the finished lap, in dBFS RMS across both ears. The page
 * then plays it far below this, well under the sound effects.
 */
export const MUSIC_RMS_DB = -20;

/** Renders and masters one seamless stereo lap of the background music. Fully deterministic. */
export function buildMusic(): Stereo {
  const lap = warm(mixdown(writeScore()));
  lap.forEach((signal) => removeDc(signal));
  const level = Math.sqrt((rms(lap[0]) ** 2 + rms(lap[1]) ** 2) / 2);
  // Both ears get the same gain, so the stereo image stays as mixed. The limiter is per sample, so the seam stays whole.
  return lap.map((signal) => softLimit(gain(signal, fromDb(MUSIC_RMS_DB) / level), CEILING_DB)) as Stereo;
}
