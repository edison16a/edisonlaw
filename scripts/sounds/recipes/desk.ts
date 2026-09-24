import { lowpass } from '../dsp/filters';
import { mixCircular, processLoop } from '../dsp/loop';
import { createRandom } from '../dsp/random';
import { reverb } from '../dsp/reverb';
import { mix, silence, toSeconds } from '../dsp/signal';
import { fanHum } from './parts/fan';
import { keystroke } from './parts/keystroke';
import { typingSchedule } from './parts/typing';
import type { LoopRecipe } from './types';

const SECONDS = 8;

/**
 * Work Experience ambience: someone typing on a mechanical keyboard across the room,
 * in human bursts with pauses, over the low hum of a PC fan.
 */
export const desk: LoopRecipe = {
  kind: 'loop',
  name: 'desk',
  seconds: SECONDS,
  rmsDb: -36,
  render: () => {
    const random = createRandom(909);
    const keys = silence(SECONDS);
    for (const { at, kind, level } of typingSchedule(SECONDS, random)) mixCircular(keys, keystroke(kind, random), at, level);

    // Heard from across the desk: the highs are gone and the room answers softly.
    const muffled = processLoop(keys, (signal) => {
      const dark = lowpass(lowpass(signal, 1700, 0.6), 2400);
      const room = reverb(dark, { decay: 0.45, damping: 2500, size: 0.7, tail: 0 });
      return mix([{ signal: dark }, { signal: room, level: 0.35 }], toSeconds(signal.length));
    });
    const fan = fanHum({ seconds: SECONDS, random, tone: 138, toneLevel: 0.05, airLevel: 0.3 });
    return mix([{ signal: muffled }, { signal: fan, level: 0.12 }], SECONDS);
  },
};
