import { peak, seamRatio, toDb } from '../dsp/analysis';
import { toSamples, type Signal } from '../dsp/signal';
import type { Placed, Region } from '../sprite';

/** Longest decoder delay searched for, in samples. */
const MAX_LAG = 3000;
/** How much of a loop is used to find its delay. */
const LOOP_PROBE = 0.5;

export interface SoundCheck {
  name: string;
  /** Measured decoder delay in samples. */
  delay: number;
  /** Source against decoded audio, once aligned and level matched. Higher is cleaner. */
  snrDb: number;
  /** Level change through the encoder and decoder. */
  gainDb: number;
  peakDb: number;
  /** One-shots: share of the sound's energy that falls inside its region. */
  captured?: number;
  /** Loops: jump across the seam of the decoded region, compared with an average step. */
  seam?: number;
}

/** Lag at which the decoded audio lines up best with the source. */
function bestLag(source: Signal, decoded: Signal, start: number) {
  let best = 0;
  let bestScore = -Infinity;
  for (let lag = 0; lag <= MAX_LAG; lag++) {
    let score = 0;
    for (let i = 0; i < source.length; i++) score += source[i] * (decoded[start + i + lag] ?? 0);
    if (score > bestScore) [best, bestScore] = [lag, score];
  }
  return best;
}

function energy(signal: Signal, from: number, to: number) {
  let sum = 0;
  for (let i = Math.max(0, from); i < Math.min(signal.length, to); i++) sum += signal[i] * signal[i];
  return sum;
}

const regionSlice = (decoded: Signal, region: Region) =>
  decoded.slice(toSamples(region.start / 1000), toSamples((region.start + region.duration) / 1000));

export function checkSound({ recipe, audio, start }: Placed, region: Region, decoded: Signal): SoundCheck {
  const probe = recipe.kind === 'loop' ? audio.slice(0, toSamples(LOOP_PROBE)) : audio;
  const delay = bestLag(probe, decoded, start);

  // Match levels first, so the SNR measures coding noise and not the encoder's small gain change.
  const aligned = decoded.subarray(start + delay, start + delay + audio.length);
  let cross = 0;
  let power = 0;
  for (let i = 0; i < audio.length; i++) [cross, power] = [cross + audio[i] * aligned[i], power + aligned[i] * aligned[i]];
  const scale = power > 0 ? cross / power : 1;
  let error = 0;
  for (let i = 0; i < audio.length; i++) error += (audio[i] - aligned[i] * scale) ** 2;
  const snrDb = 10 * Math.log10(energy(audio, 0, audio.length) / Math.max(error, 1e-20));
  const clip = regionSlice(decoded, region);
  const check: SoundCheck = { name: recipe.name, delay, snrDb, gainDb: toDb(1 / scale), peakDb: toDb(peak(clip)) };

  if (recipe.kind === 'loop') return { ...check, seam: seamRatio(clip) };
  const from = start + delay;
  const margin = toSamples(0.1);
  const regionStart = toSamples(region.start / 1000);
  const regionEnd = regionStart + toSamples(region.duration / 1000);
  return { ...check, captured: energy(decoded, regionStart, regionEnd) / energy(decoded, from - margin, from + audio.length + margin) };
}
