import { createRandom } from '../dsp/random';
import { mix } from '../dsp/signal';
import { softClick } from './parts/softClick';
import type { Recipe } from './types';

const SECONDS = 0.12;

/** Soft switch click: a rounded press, then the lighter snap of the switch settling. */
export const toggle: Recipe = {
  name: 'toggle',
  peakDb: -12,
  render: () => {
    const random = createRandom(808);
    const press = softClick({
      seconds: 0.07,
      attack: 0.001,
      puff: 0.3,
      puffTone: 2400,
      body: [
        { frequency: 1250, amplitude: 0.7, decay: 0.0045 },
        { frequency: 2300, amplitude: 0.2, decay: 0.0025 },
        { frequency: 540, amplitude: 0.55, decay: 0.009 },
        { frequency: 175, amplitude: 0.35, decay: 0.012 },
      ],
      random,
    });
    const settle = softClick({
      seconds: 0.05,
      attack: 0.0008,
      puff: 0.25,
      puffTone: 3000,
      body: [
        { frequency: 1650, amplitude: 0.6, decay: 0.0035 },
        { frequency: 720, amplitude: 0.4, decay: 0.006 },
      ],
      random,
    });
    return mix([{ signal: press }, { signal: settle, level: 0.45, at: 0.042 }], SECONDS);
  },
};
