import { rise, strike, swell } from '../../dsp/envelopes';
import { bandpass, highpass, lowpass } from '../../dsp/filters';
import { whiteNoise } from '../../dsp/noise';
import { sine } from '../../dsp/oscillators';
import type { Random } from '../../dsp/random';
import { mix, shape, type Signal } from '../../dsp/signal';

/** A soft, felted kick: a low sine that drops in pitch, with no click on top. */
export function kick(velocity: number): Signal {
  const seconds = 0.4;
  const body = shape(sine(seconds, (t) => 48 + 55 * Math.exp(-t / 0.035)), (t) => strike(t, 0.004, 0.14));
  return shape(lowpass(body, 900), () => velocity);
}

/** A brush slapped across the snare head: a breathy burst with the faintest drum body under it. */
export function brush(velocity: number, random: Random): Signal {
  const seconds = 0.4;
  const hiss = shape(lowpass(bandpass(whiteNoise(seconds, random), 2400, 0.6), 6000), (t) => rise(t, 0.008) * (0.7 * Math.exp(-t / 0.07) + 0.3 * Math.exp(-t / 0.22)));
  const body = shape(sine(seconds, 185), (t) => strike(t, 0.004, 0.05));
  return shape(mix([{ signal: hiss }, { signal: body, level: 0.12 }], seconds), () => velocity);
}

/** A light shaker tick, soft at both ends. */
export function shaker(velocity: number, random: Random): Signal {
  const seconds = 0.09;
  const grain = shape(bandpass(highpass(whiteNoise(seconds, random), 4000), 7500, 0.9), (t) => swell(t, 0.012, seconds));
  return shape(grain, () => velocity);
}
