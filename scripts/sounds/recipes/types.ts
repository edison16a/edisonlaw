import type { SoundName } from '@/features/sound/types';
import type { Signal } from '../dsp/signal';

/** One sound of the sprite. Every one is a short one-shot. */
export interface Recipe {
  name: SoundName;
  /** Peak level after mastering, in dBFS. This balances the sounds against each other in the sprite. */
  peakDb: number;
  render: () => Signal;
}
