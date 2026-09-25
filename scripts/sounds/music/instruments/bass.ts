import { fall, rise } from '../../dsp/envelopes';
import { lowpass } from '../../dsp/filters';
import { SAMPLE_RATE, silence, type Signal } from '../../dsp/signal';
import { midiToHz } from '../theory';

const TAU = Math.PI * 2;
const RELEASE = 0.12;
/** Gentle saturation drive. It adds the overtones that let small speakers hint at the low notes. */
const DRIVE = 1.4;

/** A round, fingered bass note: a sine with a little second and third harmonic, softly saturated. */
export function bassNote(midi: number, duration: number, velocity: number): Signal {
  const frequency = midiToHz(midi);
  const out = silence(duration + RELEASE);
  const norm = Math.tanh(DRIVE);
  for (let i = 0; i < out.length; i++) {
    const t = i / SAMPLE_RATE;
    const wave = Math.sin(TAU * frequency * t) + 0.3 * Math.sin(2 * TAU * frequency * t) + 0.08 * Math.sin(3 * TAU * frequency * t);
    const level = rise(t, 0.012) * (0.6 + 0.4 * Math.exp(-t / 0.2)) * Math.exp(-t / 2.5) * fall(t, duration, duration + RELEASE);
    out[i] = (Math.tanh(DRIVE * wave * 0.7) / norm) * level * velocity;
  }
  return lowpass(out, 520, 0.6);
}
