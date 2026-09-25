import { fall } from '../dsp/envelopes';
import { createRandom } from '../dsp/random';
import { reverb } from '../dsp/reverb';
import { mix, shape } from '../dsp/signal';
import { softClick } from './parts/softClick';
import type { Recipe } from './types';

const SECONDS = 0.16;

/** Fundamental of the block. The overtone ratios below are those of a small wood block. */
const PITCH = 780;

/** Soft knock as a timeline dot fills: a felt mallet on a small wood block, with a hint of pitch. */
export const dot: Recipe = {
  name: 'dot',
  peakDb: -14,
  render: () => {
    const knock = softClick({
      seconds: SECONDS,
      attack: 0.0015,
      puff: 0.35,
      puffTone: 1800,
      body: [
        { frequency: PITCH, amplitude: 1, decay: 0.028 },
        { frequency: PITCH * 2.61, amplitude: 0.22, decay: 0.009 },
        { frequency: PITCH * 4.3, amplitude: 0.06, decay: 0.004 },
        { frequency: 240, amplitude: 0.25, decay: 0.008 },
      ],
      random: createRandom(606),
    });
    const room = reverb(knock, { decay: 0.35, damping: 3000, size: 0.6, tail: 0 });
    return shape(mix([{ signal: knock }, { signal: room, level: 0.18 }], SECONDS), (t) => fall(t, 0.11, SECONDS));
  },
};
