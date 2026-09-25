import { fall } from '../dsp/envelopes';
import { lowpass } from '../dsp/filters';
import { createRandom } from '../dsp/random';
import { reverb } from '../dsp/reverb';
import { mix, shape } from '../dsp/signal';
import { softClick } from './parts/softClick';
import type { Recipe } from './types';

const SECONDS = 0.17;

/** A4. Low enough to stay round, high enough for laptop speakers to play. */
const PITCH = 440;

/**
 * The one sound of the Projects section, as the focus moves to another
 * project: a soft felt tap on a small wooden bar. It eases in over a few
 * milliseconds and has nothing above the low treble, so it stays in the
 * background however often it plays.
 */
export const move: Recipe = {
  name: 'move',
  peakDb: -19,
  render: () => {
    const tap = softClick({
      seconds: SECONDS,
      attack: 0.005,
      puff: 0.1,
      puffTone: 900,
      body: [
        { frequency: PITCH, amplitude: 1, decay: 0.032 },
        // The bar's first overtone, faint and short, gives it a hint of wood.
        { frequency: PITCH * 3.93, amplitude: 0.05, decay: 0.008 },
        { frequency: PITCH * 0.45, amplitude: 0.3, decay: 0.016 },
      ],
      random: createRandom(707),
    });
    const soft = lowpass(tap, 2200, 0.6);
    const room = lowpass(reverb(soft, { decay: 0.4, damping: 2400, size: 0.7, tail: 0 }), 2000);
    return shape(mix([{ signal: soft }, { signal: room, level: 0.16 }], SECONDS), (t) => fall(t, 0.1, SECONDS));
  },
};
