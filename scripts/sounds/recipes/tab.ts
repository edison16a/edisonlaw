import { createRandom } from '../dsp/random';
import { softClick } from './parts/softClick';
import type { OneShotRecipe } from './types';

/** Quick soft click as the nav underline slides: a touch brighter and fuller than the tick. */
export const tab: OneShotRecipe = {
  kind: 'oneShot',
  name: 'tab',
  peakDb: -13,
  render: () =>
    softClick({
      seconds: 0.06,
      attack: 0.0009,
      puff: 0.3,
      puffTone: 3200,
      body: [
        { frequency: 1900, amplitude: 0.7, decay: 0.0035 },
        { frequency: 3100, amplitude: 0.2, decay: 0.002 },
        { frequency: 820, amplitude: 0.5, decay: 0.008 },
        { frequency: 260, amplitude: 0.3, decay: 0.01 },
      ],
      random: createRandom(404),
    }),
};
