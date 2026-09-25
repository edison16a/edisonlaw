import { fft } from '../dsp/fft';
import { SAMPLE_RATE, type Signal } from '../dsp/signal';

const SIZE = 4096;
const BANDS = 72;
const LOW = 30;
const HIGH = 16000;
/** dB range the colours span. */
const FLOOR = -100;
const TOP = -10;

const bandEdge = (band: number) => LOW * Math.pow(HIGH / LOW, band / BANDS);

/**
 * Level of each log spaced band over time, one column per pixel, scaled to 0 to 255.
 * Rows run from the lowest band up.
 */
export function spectrogram(samples: Signal, columns: number): Uint8Array {
  const window = Float64Array.from({ length: SIZE }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / SIZE));
  const norm = window.reduce((sum, value) => sum + value, 0) ** 2;
  const bins = Array.from({ length: BANDS + 1 }, (_, band) => Math.round((bandEdge(band) * SIZE) / SAMPLE_RATE));
  const out = new Uint8Array(columns * BANDS);
  for (let column = 0; column < columns; column++) {
    const centre = Math.floor(((column + 0.5) / columns) * samples.length);
    const re = new Float64Array(SIZE);
    const im = new Float64Array(SIZE);
    for (let i = 0; i < SIZE; i++) re[i] = (samples[(centre - SIZE / 2 + i + samples.length) % samples.length] ?? 0) * window[i];
    fft(re, im);
    for (let band = 0; band < BANDS; band++) {
      let power = 0;
      const [from, to] = [bins[band], Math.max(bins[band + 1], bins[band] + 1)];
      for (let k = from; k < to; k++) power += (re[k] * re[k] + im[k] * im[k]) / (to - from);
      const db = 10 * Math.log10((4 * power) / norm + 1e-20);
      out[band * columns + column] = Math.round(255 * Math.min(1, Math.max(0, (db - FLOOR) / (TOP - FLOOR))));
    }
  }
  return out;
}

/** A canvas that paints the spectrogram, with a label and grid lines at 100 Hz, 1 kHz and 10 kHz. */
export function spectrogramBlock(name: string, samples: Signal, width: number, height: number) {
  const levels = Buffer.from(spectrogram(samples, width)).toString('base64');
  const grid = [100, 1000, 10000].map((f) => Math.log(f / LOW) / Math.log(HIGH / LOW));
  return `<div style="margin:8px 14px;color:#fff;font:bold 15px monospace">${name} spectrogram, ${LOW} Hz to ${HIGH / 1000} kHz, ${FLOOR} to ${TOP} dB</div>
  <canvas width="${width}" height="${height}" style="margin:0 14px" data-levels="${levels}" data-bands="${BANDS}" data-grid="${grid.join(',')}"></canvas>`;
}

/** Page script that paints every spectrogram canvas: dark blue through orange to white. */
export const SPECTROGRAM_SCRIPT = `for (const canvas of document.querySelectorAll('canvas[data-levels]')) {
  const levels = Uint8Array.from(atob(canvas.dataset.levels), (c) => c.charCodeAt(0));
  const bands = Number(canvas.dataset.bands);
  const { width, height } = canvas;
  const context = canvas.getContext('2d');
  const image = context.createImageData(width, height);
  for (let y = 0; y < height; y++) {
    const band = Math.min(bands - 1, Math.floor(((height - 1 - y) / height) * bands));
    for (let x = 0; x < width; x++) {
      const v = levels[band * width + x] / 255;
      const i = (y * width + x) * 4;
      image.data[i] = 255 * Math.min(1, v * 1.8);
      image.data[i + 1] = 255 * Math.max(0, Math.min(1, v * 1.6 - 0.45));
      image.data[i + 2] = 255 * (v < 0.5 ? v * 0.9 : Math.max(0, v * 2 - 1.2));
      image.data[i + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  context.strokeStyle = 'rgba(255,255,255,0.25)';
  for (const g of canvas.dataset.grid.split(',').map(Number)) {
    context.beginPath();
    context.moveTo(0, height * (1 - g));
    context.lineTo(width, height * (1 - g));
    context.stroke();
  }
}`;
