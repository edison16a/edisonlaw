/**
 * Seamless loops. Steady layers (noise, hum) are rendered a little long and their tail
 * is crossfaded over the head. Event layers (key presses, clicks) are placed on a circle,
 * so a sound that runs past the end simply continues at the start.
 */

import { concat, toSamples, type Signal } from './signal';

/**
 * Returns exactly `seconds` of audio that loops, by fading the audio after the loop point
 * back in over the start. Equal power curves, which suit uncorrelated material like noise.
 */
export function crossfadeLoop(signal: Signal, seconds: number, fade: number): Signal {
  const length = toSamples(seconds);
  const fadeCount = toSamples(fade);
  if (signal.length < length + fadeCount) throw new Error('crossfadeLoop needs the fade rendered past the loop end');
  const out = signal.slice(0, length);
  for (let i = 0; i < fadeCount; i++) {
    const x = ((i + 0.5) / fadeCount) * (Math.PI / 2);
    out[i] = signal[i] * Math.sin(x) + signal[length + i] * Math.cos(x);
  }
  return out;
}

/** Adds `source` into a circular `loop` at `at` seconds. Anything past the end wraps to the start. */
export function mixCircular(loop: Signal, source: Signal, at: number, level = 1): Signal {
  const offset = toSamples(at);
  for (let i = 0; i < source.length; i++) {
    const index = (((offset + i) % loop.length) + loop.length) % loop.length;
    loop[index] += source[i] * level;
  }
  return loop;
}

/**
 * Runs a stateful process (a filter, a reverb) on a loop without breaking the seam.
 * It processes two laps and keeps the second, where the filter memory has already wrapped around.
 * Only valid when the process forgets its input faster than one lap.
 */
export function processLoop(loop: Signal, process: (signal: Signal) => Signal): Signal {
  return process(concat(loop, loop)).slice(loop.length, loop.length * 2);
}

/**
 * Surrounds a loop with a copy of its own tail before and head after. Any window of the loop
 * length inside the result is still one seamless lap, so a player that lands a few
 * milliseconds off (MP3 decoder delay) still loops cleanly.
 */
export function padLoop(loop: Signal, pad: number): Signal {
  const count = toSamples(pad);
  return concat(loop.slice(loop.length - count), loop, loop.slice(0, count));
}
