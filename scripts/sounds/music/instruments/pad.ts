import { fall, rise } from '../../dsp/envelopes';
import { lowpass } from '../../dsp/filters';
import { saw } from '../../dsp/oscillators';
import { between, type Random } from '../../dsp/random';
import { mix, shape, type Signal } from '../../dsp/signal';
import { midiToHz } from '../theory';

const ATTACK = 1.1;
/** Long enough to melt into the next chord, short enough that a B natural does not linger under a B flat. */
const RELEASE = 1.2;
/** Detune of the two saws under each note, in cents, a little different in each ear for width. */
const DETUNE = [
  [-7, 5],
  [-4, 8],
];

const cents = (frequency: number, amount: number) => frequency * Math.pow(2, amount / 1200);

/**
 * A soft string pad for one chord, as a left and right pair: two detuned
 * saws per note, well filtered, swelling in slowly and fading out long
 * after the chord ends, so neighbouring chords melt into each other.
 */
export function padChord(notes: number[], duration: number, random: Random): [Signal, Signal] {
  const seconds = duration + RELEASE;
  const ears = DETUNE.map((pair) => {
    const voices = notes.flatMap((midi) =>
      pair.map((detune) => ({ signal: saw(seconds, cents(midiToHz(midi), detune), random()), level: 1 / notes.length })),
    );
    const warm = lowpass(lowpass(mix(voices, seconds), 1100, 0.5), 1600, 0.5);
    return shape(warm, (t) => rise(t, ATTACK) * fall(t, duration, seconds));
  });
  // The same chord never swells quite the same way twice.
  const level = between(random, 0.9, 1);
  return [shape(ears[0], () => level), shape(ears[1], () => level)];
}
