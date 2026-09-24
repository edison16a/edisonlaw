import { fall, strike } from '../dsp/envelopes';
import { lowpass } from '../dsp/filters';
import { sine } from '../dsp/oscillators';
import { reverb } from '../dsp/reverb';
import { mix, shape } from '../dsp/signal';
import type { OneShotRecipe } from './types';

const SECONDS = 0.3;

/** A soft sine tone that leans up by a couple of percent as it starts, with a faint octave. */
function tone(frequency: number, seconds: number, tau: number) {
  const glide = (t: number) => frequency * (1 + 0.025 * (1 - Math.exp(-t / 0.015)));
  const body = mix([{ signal: sine(seconds, glide) }, { signal: sine(seconds, (t) => glide(t) * 2), level: 0.1 }], seconds);
  return shape(body, (t) => strike(t, 0.005, tau));
}

/** Short confirm for contact links and copying the email: two soft rising tones. */
export const blip: OneShotRecipe = {
  kind: 'oneShot',
  name: 'blip',
  peakDb: -16,
  render: () => {
    const dry = mix(
      [
        { signal: tone(620, 0.2, 0.04) },
        { signal: tone(930, 0.22, 0.055), level: 0.85, at: 0.07 },
      ],
      SECONDS,
    );
    const tail = lowpass(reverb(dry, { decay: 0.6, damping: 3500, size: 0.9, preDelay: 0.008, tail: 0 }), 3000);
    return shape(mix([{ signal: dry }, { signal: tail, level: 0.3 }], SECONDS), (t) => fall(t, 0.22, SECONDS));
  },
};
