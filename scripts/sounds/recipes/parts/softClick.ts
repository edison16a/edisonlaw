import { rise, swell } from '../../dsp/envelopes';
import { lowpass } from '../../dsp/filters';
import { whiteNoise } from '../../dsp/noise';
import { modes, type Mode } from '../../dsp/oscillators';
import type { Random } from '../../dsp/random';
import { mix, shape, type Signal } from '../../dsp/signal';

export interface SoftClickOptions {
  seconds: number;
  /** Ringing modes of the struck body. Short decays read as tactile, long ones as tonal. */
  body: Mode[];
  /** Attack time in seconds. A millisecond or more keeps it round instead of clicky. */
  attack: number;
  /** Level of the brief noise puff that marks the moment of contact. */
  puff?: number;
  /** Lowpass on the puff in Hz. Lower is a softer, padded contact. */
  puffTone?: number;
  random: Random;
}

/**
 * The shared shape of every tactile sound here: a soft contact puff plus a damped body.
 * Both are eased in, so even the shortest click has no hard edge.
 */
export function softClick({ seconds, body, attack, puff = 0.3, puffTone = 2500, random }: SoftClickOptions): Signal {
  const ring = shape(modes(seconds, body), (t) => rise(t, attack));
  const contact = shape(lowpass(whiteNoise(seconds, random), puffTone, 0.6), (t) => swell(t, attack * 0.6, attack * 0.6 + 0.003));
  return mix([{ signal: ring }, { signal: contact, level: puff }], seconds);
}
