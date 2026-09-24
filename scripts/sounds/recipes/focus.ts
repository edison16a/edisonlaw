import { fall, strike, swell } from '../dsp/envelopes';
import { highpass, lowpass } from '../dsp/filters';
import { pinkNoise } from '../dsp/noise';
import { sine } from '../dsp/oscillators';
import { createRandom } from '../dsp/random';
import { reverb } from '../dsp/reverb';
import { mix, shape } from '../dsp/signal';
import type { OneShotRecipe } from './types';

const SECONDS = 0.48;

/** Where the deep thump lands, slightly after the faint upper "bla". */
const THUMP_AT = 0.014;

/** Pitch of the thump: starts near 96 Hz and settles at 62 Hz as it lands. */
const drop = (t: number) => 62 + 34 * Math.exp(-t / 0.035);

/**
 * The "bladoom" when a card locks into focus: a faint upper partial, then a soft deep
 * thump with a quick pitch drop, and a dark bloom of reverb swelling behind it.
 */
export const focus: OneShotRecipe = {
  kind: 'oneShot',
  name: 'focus',
  peakDb: -3.5,
  render: () => {
    const random = createRandom(202);
    const thump = shape(sine(SECONDS, drop), (t) => strike(t, 0.009, 0.12));
    // Small speakers cannot play 62 Hz, so the harmonics carry the thump on a laptop.
    const second = shape(sine(SECONDS, (t) => drop(t) * 2), (t) => strike(t, 0.007, 0.08));
    const third = shape(sine(SECONDS, (t) => drop(t) * 3), (t) => strike(t, 0.006, 0.05));
    const bla = shape(sine(SECONDS, (t) => 330 + 140 * Math.exp(-t / 0.02)), (t) => strike(t, 0.004, 0.03));
    const air = shape(lowpass(pinkNoise(SECONDS, random), 380, 0.7), (t) => swell(t, 0.006, 0.05));

    const dry = mix(
      [
        { signal: thump, at: THUMP_AT },
        { signal: second, level: 0.4, at: THUMP_AT },
        { signal: third, level: 0.12, at: THUMP_AT },
        { signal: bla, level: 0.26 },
        { signal: air, level: 0.35 },
      ],
      SECONDS,
    );
    const wet = reverb(dry, { decay: 1.4, damping: 1800, size: 1.3, preDelay: 0.012, tail: 0 });
    const bloom = lowpass(highpass(wet, 80), 2400);
    return shape(mix([{ signal: dry }, { signal: bloom, level: 0.5 }], SECONDS), (t) => fall(t, 0.3, SECONDS));
  },
};
