import type { LoopName, SoundName } from '@/features/sound/types';
import type { Signal } from '../dsp/signal';

export interface OneShotRecipe {
  kind: 'oneShot';
  name: SoundName;
  /** Peak level after mastering, in dBFS. This balances the sounds against each other in the sprite. */
  peakDb: number;
  render: () => Signal;
}

export interface LoopRecipe {
  kind: 'loop';
  name: LoopName;
  /** RMS level after mastering, in dBFS. Loops are steady, so RMS says more than peak. */
  rmsDb: number;
  /** Length of one lap. The render returns exactly this much audio, already seamless. */
  seconds: number;
  render: () => Signal;
}

export type Recipe = OneShotRecipe | LoopRecipe;
