import { peak, rms, toDb } from '../dsp/analysis';
import { toSamples, type Signal } from '../dsp/signal';
import type { Region } from '../sprite';
import { spectrum } from '../dsp/fft';
import type { SoundCheck } from './measure';

export interface PlotRow {
  check: SoundCheck;
  region: Region;
  decoded: Signal;
  /** A loop shows its whole lap and a zoom across the seam. */
  loop?: boolean;
}

const ROW = 130;
const PAD = 14;
const PANELS = { label: 190, wave: 760, spectrum: 380, zoom: 200 };
const WIDTH = Object.values(PANELS).reduce((sum, width) => sum + width + PAD, PAD);
/** Floor of the dB scales. */
const FLOOR = -100;

const at = (seconds: number) => toSamples(seconds);
const y = (db: number, height: number) => (Math.min(0, Math.max(FLOOR, db)) / FLOOR) * height;
const path = (points: [number, number][]) => points.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join('');

/** Min and max per pixel column, scaled to the window's own peak so quiet sounds stay readable. */
function waveform(samples: Signal, width: number, height: number) {
  const scale = 1 / Math.max(peak(samples), 1e-9);
  const step = samples.length / width;
  const top: [number, number][] = [];
  const bottom: [number, number][] = [];
  for (let x = 0; x < width; x++) {
    const column = samples.subarray(Math.floor(x * step), Math.max(Math.floor((x + 1) * step), Math.floor(x * step) + 1));
    let [min, max] = [0, 0];
    for (const value of column) [min, max] = [Math.min(min, value), Math.max(max, value)];
    top.push([x, height / 2 - (max * scale * height) / 2]);
    bottom.unshift([x, height / 2 - (min * scale * height) / 2]);
  }
  return `${path([...top, ...bottom])}Z`;
}

/** RMS level per pixel column in dB, which shows decays, noise floors and any click at an edge. */
function envelope(samples: Signal, width: number, height: number) {
  const step = samples.length / width;
  const points: [number, number][] = [];
  for (let x = 0; x < width; x++) points.push([x, y(toDb(rms(samples.subarray(Math.floor(x * step), Math.ceil((x + 1) * step)))), height)]);
  return path(points);
}

/** Spectrum on a log frequency axis from 20 Hz to 20 kHz. */
function spectrumPath(samples: Signal, width: number, height: number) {
  const { frequencies, levels } = spectrum(samples);
  const fx = (f: number) => (Math.log10(f / 20) / 3) * width;
  return path(frequencies.flatMap((f, i) => (f >= 20 && f <= 20000 ? [[fx(f), y(levels[i], height)] as [number, number]] : [])));
}

function samplesPath(samples: Signal, width: number, height: number) {
  const scale = 1 / Math.max(peak(samples), 1e-9);
  return path(Array.from(samples, (value, i) => [(i / (samples.length - 1)) * width, height / 2 - (value * scale * height) / 2.2]));
}

function row({ check, region, decoded, loop = false }: PlotRow, index: number) {
  const h = ROW - 30;
  const start = region.start / 1000;
  const end = start + region.duration / 1000;
  const margin = loop ? 0 : 0.01;
  const window = decoded.subarray(at(start - margin), at(end + margin));
  const clip = decoded.subarray(at(start), at(end));
  // Attack for one-shots; for loops, the last and first 8 ms of the lap, joined at the seam.
  const zoom = loop
    ? Float32Array.from([...decoded.subarray(at(end - 0.008), at(end)), ...decoded.subarray(at(start), at(start + 0.008))])
    : decoded.subarray(at(start), at(start + 0.024));
  const lead = (margin / (end - start + 2 * margin)) * PANELS.wave;

  const stats = [
    `peak ${check.peakDb.toFixed(1)} dB, rms ${toDb(rms(clip)).toFixed(1)} dB`,
    `snr ${check.snrDb.toFixed(1)} dB, delay ${check.delay}`,
    check.seam === undefined ? `captured ${((check.captured ?? 0) * 100).toFixed(2)}%` : `seam ${check.seam.toFixed(2)}x a step`,
    `${region.duration.toFixed(0)} ms`,
  ];
  const x = { wave: PAD * 2 + PANELS.label, spectrum: PAD * 3 + PANELS.label + PANELS.wave };
  const zoomX = x.spectrum + PANELS.spectrum + PAD;

  return `<g transform="translate(0 ${index * ROW + 20})">
    <text x="${PAD}" y="16" class="name">${check.name}</text>
    ${stats.map((line, i) => `<text x="${PAD}" y="${36 + i * 16}" class="stat">${line}</text>`).join('')}
    <g transform="translate(${x.wave} 0)">
      <rect width="${PANELS.wave}" height="${h}" class="panel"/>
      <path d="${waveform(window, PANELS.wave, h)}" class="wave"/>
      <path d="${envelope(window, PANELS.wave, h)}" class="env"/>
      ${margin ? `<line x1="${lead}" x2="${lead}" y2="${h}" class="edge"/><line x1="${PANELS.wave - lead}" x2="${PANELS.wave - lead}" y2="${h}" class="edge"/>` : ''}
    </g>
    <g transform="translate(${x.spectrum} 0)">
      <rect width="${PANELS.spectrum}" height="${h}" class="panel"/>
      ${[100, 1000, 10000].map((f) => `<line x1="${(Math.log10(f / 20) / 3) * PANELS.spectrum}" x2="${(Math.log10(f / 20) / 3) * PANELS.spectrum}" y2="${h}" class="grid"/>`).join('')}
      <path d="${spectrumPath(clip, PANELS.spectrum, h)}" class="spec"/>
    </g>
    <g transform="translate(${zoomX} 0)">
      <rect width="${PANELS.zoom}" height="${h}" class="panel"/>
      <line y1="${h / 2}" x2="${PANELS.zoom}" y2="${h / 2}" class="grid"/>
      ${loop ? `<line x1="${PANELS.zoom / 2}" x2="${PANELS.zoom / 2}" y2="${h}" class="edge"/>` : ''}
      <path d="${samplesPath(zoom, PANELS.zoom, h)}" class="zoom"/>
    </g>
  </g>`;
}

/** A standalone page with one row per sound: waveform and dB envelope, spectrum, and an attack or seam zoom. */
export function plotPage(rows: PlotRow[]) {
  const height = rows.length * ROW + 40;
  return `<!doctype html><html><body style="margin:0;background:#0b0b0b">
  <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${height}" font-family="monospace">
    <style>
      .name { fill: #fff; font-size: 15px; font-weight: bold }
      .stat { fill: #9a9a9a; font-size: 11px }
      .panel { fill: #151515 }
      .wave { fill: #d8d8d8 }
      .env { fill: none; stroke: #5aa0ff; stroke-width: 1.2 }
      .spec { fill: none; stroke: #ffb454; stroke-width: 1.2 }
      .zoom { fill: none; stroke: #7dffb2; stroke-width: 1.2 }
      .edge { stroke: #ff5d5d; stroke-dasharray: 3 3 }
      .grid { stroke: #333 }
    </style>
    ${rows.map(row).join('')}
  </svg></body></html>`;
}

export const PLOT_WIDTH = WIDTH;
