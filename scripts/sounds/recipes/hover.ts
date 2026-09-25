import { lowpass } from '../dsp/filters';
import { createRandom } from '../dsp/random';
import { softClick } from './parts/softClick';
import type { OneShotRecipe } from './types';

/** A barely there tick for hovering a navbar tab. */
export const hover: OneShotRecipe = {
  kind: 'oneShot',
  name: 'hover',
  peakDb: -21,
  render: () =>
    lowpass(
      softClick({
        seconds: 0.024,
        attack: 0.0007,
        puff: 0.2,
        puffTone: 4000,
        body: [
          { frequency: 2600, amplitude: 0.6, decay: 0.0022 },
          { frequency: 1300, amplitude: 0.4, decay: 0.0035 },
        ],
        random: createRandom(505),
      }),
      6000,
    ),
};
