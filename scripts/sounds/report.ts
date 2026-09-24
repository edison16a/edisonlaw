import { mean, peak, rms, seamRatio, tailLevel, toDb } from './dsp/analysis';
import { loudestDbA } from './dsp/loudness';
import { toSeconds } from './dsp/signal';
import type { SpriteLayout } from './sprite';

const COLUMNS = ['sound', 'length', 'peak', 'rms', 'loudness', 'dc'];
const cell = (text: string, index: number) => (index === 0 ? text.padEnd(8) : text.padStart(11));
const db = (value: number) => `${value.toFixed(1)} dB`;

/**
 * Prints length, levels and edge health for every sound, then the sprite totals.
 * Loudness is the loudest 46 ms, A weighted, which is the fairest way to compare them by ear.
 */
export function printReport({ buffer, placed }: SpriteLayout, bytes: number) {
  console.log(`${COLUMNS.map(cell).join('')}  edges`);
  for (const { recipe, audio } of placed) {
    // One-shots should start and end in silence; loops should be as smooth across the seam as anywhere else.
    const edges =
      recipe.kind === 'loop'
        ? `seam ${seamRatio(audio).toFixed(2)}x a step`
        : `first ${audio[0].toFixed(3)}, tail ${toDb(tailLevel(audio)).toFixed(0)} dB`;
    const values = [
      recipe.name,
      `${(toSeconds(audio.length) * 1000).toFixed(0)} ms`,
      db(toDb(peak(audio))),
      db(toDb(rms(audio))),
      `${loudestDbA(audio).toFixed(1)} dBA`,
      mean(audio).toExponential(0),
    ];
    console.log(`${values.map(cell).join('')}  ${edges}`);
  }
  console.log(`\nsprite ${toSeconds(buffer.length).toFixed(2)} s, ${(bytes / 1024).toFixed(0)} KB`);
}
