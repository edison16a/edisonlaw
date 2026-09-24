import { lowpass } from '../dsp/filters';
import { createRandom } from '../dsp/random';
import { softClick } from './parts/softClick';
import type { OneShotRecipe } from './types';

/**
 * The spiral detent, like a smooth scroll wheel notch. It fires many times a second,
 * so it is tiny and round: a padded contact and a small plastic body that dies in a few ms.
 */
export const tick: OneShotRecipe = {
  kind: 'oneShot',
  name: 'tick',
  peakDb: -12,
  render: () =>
    lowpass(
      softClick({
        seconds: 0.034,
        attack: 0.0012,
        puff: 0.25,
        puffTone: 2200,
        body: [
          { frequency: 1350, amplitude: 0.8, decay: 0.004 },
          { frequency: 2480, amplitude: 0.22, decay: 0.0022 },
          { frequency: 640, amplitude: 0.55, decay: 0.007 },
          { frequency: 210, amplitude: 0.4, decay: 0.008 },
        ],
        random: createRandom(101),
      }),
      5200,
      0.6,
    ),
};
