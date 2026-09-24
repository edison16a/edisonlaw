import { lowpass } from '../dsp/filters';
import { crossfadeLoop, mixCircular } from '../dsp/loop';
import { pinkNoise } from '../dsp/noise';
import { createRandom } from '../dsp/random';
import { mix, slice } from '../dsp/signal';
import { fanHum } from './parts/fan';
import { softClick } from './parts/softClick';
import type { LoopRecipe } from './types';

const SECONDS = 7;

/** When the one mouse click lands in the lap. */
const CLICK_AT = 4.3;

/** About Me ambience: a quiet room, a fan further away, and one very soft mouse click. */
export const room: LoopRecipe = {
  kind: 'loop',
  name: 'room',
  seconds: SECONDS,
  rmsDb: -39,
  render: () => {
    const random = createRandom(1201);
    const fan = fanHum({ seconds: SECONDS, random, tone: 131, toneLevel: 0.03, airLevel: 0.2 });
    const hush = crossfadeLoop(slice(lowpass(pinkNoise(SECONDS + 1, random), 900, 0.6), 0.5), SECONDS, 0.5);
    const tone = mix([{ signal: fan }, { signal: hush, level: 0.35 }], SECONDS);

    const press = softClick({
      seconds: 0.05,
      attack: 0.0006,
      puff: 0.4,
      puffTone: 3000,
      body: [
        { frequency: 2100, amplitude: 0.6, decay: 0.003 },
        { frequency: 900, amplitude: 0.4, decay: 0.006 },
      ],
      random,
    });
    const click = lowpass(mix([{ signal: press }, { signal: press, level: 0.5, at: 0.09 }]), 2200);
    return mixCircular(tone, click, CLICK_AT, 0.25);
  },
};
