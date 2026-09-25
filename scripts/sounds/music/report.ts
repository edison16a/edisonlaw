import { peak, rms, seamRatio, toDb } from '../dsp/analysis';
import { spectrum } from '../dsp/fft';
import { loudestDbA } from '../dsp/loudness';
import { slice, toSeconds, type Signal } from '../dsp/signal';
import type { Stereo } from './mixdown';
import { BAR } from './theory';

/** Bands the spectrum is summed into, low edge to high edge in Hz, named as a mix engineer would. */
export const BANDS: [name: string, from: number, to: number][] = [
  ['sub', 20, 60],
  ['bass', 60, 250],
  ['low mid', 250, 1000],
  ['mid', 1000, 4000],
  ['high', 4000, 10000],
  ['air', 10000, 20000],
];

/** Power in each band, in dB relative to the whole signal, so the balance reads at a glance. */
export function bandBalance(signal: Signal) {
  const { frequencies, levels } = spectrum(signal);
  const power = BANDS.map(([, from, to]) =>
    frequencies.reduce((sum, frequency, i) => (frequency >= from && frequency < to ? sum + Math.pow(10, levels[i] / 10) : sum), 0),
  );
  const total = power.reduce((sum, value) => sum + value, 0);
  return BANDS.map(([name], i) => ({ name, db: 10 * Math.log10(power[i] / total + 1e-20) }));
}

const db = (value: number) => `${value.toFixed(1)} dB`;

/** Levels, seam, balance and the arc of the sections, for the build log. */
export function printMusicReport(lap: Stereo, bytes: number) {
  const seconds = toSeconds(lap[0].length);
  console.log(`music ${seconds.toFixed(2)} s, ${(bytes / 1024).toFixed(0)} KB`);
  lap.forEach((signal, side) => {
    const ear = side ? 'right' : 'left';
    console.log(`  ${ear.padEnd(6)} peak ${db(toDb(peak(signal)))}  rms ${db(toDb(rms(signal)))}  loudest ${loudestDbA(signal).toFixed(1)} dBA  seam ${seamRatio(signal).toFixed(2)}x a step`);
  });
  const mono = Float32Array.from(lap[0], (value, i) => (value + lap[1][i]) / 2);
  console.log(`  balance ${bandBalance(mono).map(({ name, db: level }) => `${name} ${level.toFixed(1)}`).join(', ')}`);
  const sections = Array.from({ length: Math.round(seconds / (BAR * 8)) }, (_, i) => toDb(rms(slice(mono, i * BAR * 8, (i + 1) * BAR * 8))));
  console.log(`  sections ${sections.map(db).join(', ')}`);
}
