import { fft } from './fft';
import { SAMPLE_RATE, type Signal } from './signal';

/** About 46 ms, close to how long the ear integrates a short sound. */
const WINDOW = 2048;
const HOP = 512;

/** IEC 61672 A weighting as a power gain. Quiet sounds are heard roughly like this. */
function aWeightPower(f: number) {
  const f2 = f * f;
  const ra = (12194 ** 2 * f2 * f2) / ((f2 + 20.6 ** 2) * Math.sqrt((f2 + 107.7 ** 2) * (f2 + 737.9 ** 2)) * (f2 + 12194 ** 2));
  return (ra * 1.2589) ** 2;
}

const WEIGHTS = Float64Array.from({ length: WINDOW / 2 }, (_, k) => aWeightPower((k * SAMPLE_RATE) / WINDOW));

/**
 * Level of the loudest 46 ms stretch, A weighted, in dB relative to a full scale sine.
 * A rough stand in for how loud a short sound feels, which peak and RMS both miss:
 * a 60 Hz thump and a 2 kHz click at the same peak are nothing alike to the ear.
 */
export function loudestDbA(signal: Signal) {
  let loudest = 0;
  for (let start = 0; start === 0 || start + WINDOW <= signal.length; start += HOP) {
    const re = new Float64Array(WINDOW);
    const im = new Float64Array(WINDOW);
    for (let i = 0; i < WINDOW && start + i < signal.length; i++) re[i] = signal[start + i];
    fft(re, im);
    let power = 0;
    for (let k = 1; k < WINDOW / 2; k++) power += (re[k] * re[k] + im[k] * im[k]) * WEIGHTS[k];
    loudest = Math.max(loudest, power);
  }
  // A full scale sine puts (WINDOW / 2) squared into its bin; that is 0 dB here.
  return 10 * Math.log10(loudest / (WINDOW / 2) ** 2 + 1e-20);
}
