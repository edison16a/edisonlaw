import { bandpass, lowpass } from '../../dsp/filters';
import { crossfadeLoop } from '../../dsp/loop';
import { brownNoise, pinkNoise } from '../../dsp/noise';
import { loopableFrequency } from '../../dsp/oscillators';
import type { Random } from '../../dsp/random';
import { mix, render, slice } from '../../dsp/signal';

export interface FanOptions {
  seconds: number;
  random: Random;
  /** Blade tone in Hz, snapped so it fits the lap exactly. */
  tone: number;
  toneLevel: number;
  /** Level of the airy band over the rumble. */
  airLevel: number;
}

/** Filters need a moment to settle, so noise is rendered with a lead in that is thrown away. */
const WARM_UP = 0.5;
const CROSSFADE = 0.5;

/**
 * A seamless PC fan: low motor rumble, air through the grille, and a faint blade tone
 * that wobbles slowly. The tones fit the lap exactly and only the noise is crossfaded,
 * so nothing correlated is ever faded against itself.
 */
export function fanHum({ seconds, random, tone, toneLevel, airLevel }: FanOptions) {
  const total = WARM_UP + seconds + CROSSFADE;
  const rumble = lowpass(brownNoise(total, random), 180, 0.7);
  const air = bandpass(pinkNoise(total, random), 650, 0.6);
  const noise = crossfadeLoop(slice(mix([{ signal: rumble }, { signal: air, level: airLevel }], total), WARM_UP), seconds, CROSSFADE);

  const blade = loopableFrequency(tone, seconds);
  const wobble = loopableFrequency(0.3, seconds);
  const hum = render(seconds, (t) => {
    const swayLevel = 1 + 0.25 * Math.sin(2 * Math.PI * wobble * t);
    return (Math.sin(2 * Math.PI * blade * t) + 0.35 * Math.sin(4 * Math.PI * blade * t + 0.6)) * swayLevel;
  });
  return mix([{ signal: noise }, { signal: hum, level: toneLevel }], seconds);
}
