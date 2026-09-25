import { fall, rise } from '../../dsp/envelopes';
import { lowpass } from '../../dsp/filters';
import { SAMPLE_RATE, silence, type Signal } from '../../dsp/signal';
import { midiToHz } from '../theory';

const TAU = Math.PI * 2;
/** How long a released key takes to fall silent, in seconds. */
const RELEASE = 0.35;

export interface KeyOptions {
  /** 0 to 1. Harder notes are louder and brighter. */
  velocity: number;
  /** Lowpass on the whole note in Hz. The lead melody sits a little brighter than the chords. */
  tone?: number;
}

/**
 * A warm electric piano note: two operator FM with the modulator at the
 * carrier's pitch, so it stays harmonic. The brightness blooms at the strike
 * and mellows as it rings, with a faint bell tine at the very start. Held for
 * `duration` seconds, then released.
 */
export function electricPiano(midi: number, duration: number, { velocity, tone = 3800 }: KeyOptions): Signal {
  const frequency = midiToHz(midi);
  const out = silence(duration + RELEASE);
  const ring = 2.4 * Math.sqrt(261.6 / frequency);
  const bright = 0.6 + 0.8 * velocity;

  for (let i = 0; i < out.length; i++) {
    const t = i / SAMPLE_RATE;
    const index = bright * (1.8 * Math.exp(-t / 0.25) + 0.35);
    const body = Math.sin(TAU * frequency * t + index * Math.sin(TAU * frequency * t));
    const tine = 0.05 * velocity * Math.exp(-t / 0.04) * Math.sin(TAU * frequency * 7 * t);
    const level = rise(t, 0.004) * Math.exp(-t / ring) * fall(t, duration, duration + RELEASE);
    out[i] = (body + tine) * level * velocity;
  }
  return lowpass(out, tone, 0.6);
}
