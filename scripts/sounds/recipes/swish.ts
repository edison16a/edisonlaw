import { swell } from '../dsp/envelopes';
import { bandpass, lowpass } from '../dsp/filters';
import { pinkNoise, whiteNoise } from '../dsp/noise';
import { createRandom } from '../dsp/random';
import { reverb } from '../dsp/reverb';
import { mix, shape } from '../dsp/signal';
import type { OneShotRecipe } from './types';

const SECONDS = 0.42;

/** Band centre glides up from 520 Hz to 2.6 kHz, the air rushing past as the panel slides open. */
const sweep = (t: number) => 520 * Math.pow(2600 / 520, Math.min(1, t / 0.34));

/** A faint airy swish as the project panel opens: band passed noise sweeping upward. */
export const swish: OneShotRecipe = {
  kind: 'oneShot',
  name: 'swish',
  peakDb: -19,
  render: () => {
    const random = createRandom(303);
    const band = bandpass(pinkNoise(SECONDS, random), sweep, 1.3);
    const air = lowpass(bandpass(whiteNoise(SECONDS, random), (t) => 3000 + 3000 * (t / SECONDS), 0.9), 8000);
    const body = shape(mix([{ signal: band }, { signal: air, level: 0.12 }], SECONDS), (t) => swell(t, 0.15, SECONDS));
    const room = reverb(body, { decay: 0.5, damping: 4000, size: 0.8, tail: 0 });
    return shape(mix([{ signal: body }, { signal: room, level: 0.25 }], SECONDS), (t) => swell(t, 0.02, SECONDS));
  },
};
