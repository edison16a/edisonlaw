import { SAMPLE_RATE, type Signal } from './signal';

/** In place iterative radix 2 FFT. Lengths must be powers of two. */
export function fft(re: Float64Array, im: Float64Array) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let size = 2; size <= n; size <<= 1) {
    const angle = (-2 * Math.PI) / size;
    for (let start = 0; start < n; start += size) {
      for (let k = 0; k < size / 2; k++) {
        const cos = Math.cos(angle * k);
        const sin = Math.sin(angle * k);
        const a = start + k;
        const b = a + size / 2;
        const tre = re[b] * cos - im[b] * sin;
        const tim = re[b] * sin + im[b] * cos;
        re[b] = re[a] - tre;
        im[b] = im[a] - tim;
        re[a] += tre;
        im[a] += tim;
      }
    }
  }
}

export interface Spectrum {
  /** Frequency of each bin in Hz. */
  frequencies: number[];
  /** Level of each bin in dB. */
  levels: number[];
}

/** Averaged magnitude spectrum (Welch's method, Hann windows, half overlap). */
export function spectrum(signal: Signal, size = 4096): Spectrum {
  const window = Float64Array.from({ length: size }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / size));
  const windowSum = window.reduce((sum, value) => sum + value, 0);
  const power = new Float64Array(size / 2);
  let frames = 0;

  for (let start = 0; frames === 0 || start + size <= signal.length; start += size / 2) {
    const re = new Float64Array(size);
    const im = new Float64Array(size);
    for (let i = 0; i < size && start + i < signal.length; i++) re[i] = signal[start + i] * window[i];
    fft(re, im);
    for (let k = 0; k < size / 2; k++) power[k] += re[k] * re[k] + im[k] * im[k];
    frames++;
  }

  const frequencies: number[] = [];
  const levels: number[] = [];
  for (let k = 1; k < size / 2; k++) {
    frequencies.push((k * SAMPLE_RATE) / size);
    levels.push(10 * Math.log10(power[k] / frames / (windowSum * windowSum) + 1e-20) + 6);
  }
  return { frequencies, levels };
}
