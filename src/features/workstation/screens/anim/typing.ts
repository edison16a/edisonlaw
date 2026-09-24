import { hashString, seededRandom } from '@/lib/math';

/**
 * Human looking typing: each key lands after an uneven gap, a little longer after spaces
 * and punctuation. The rhythm is seeded by the text, so every loop types the same way.
 */

const cache = new Map<string, Float32Array>();

function keyTimes(value: string, charsPerSecond: number) {
  const cacheKey = `${charsPerSecond}:${value}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const random = seededRandom(hashString(value));
  const base = 1 / charsPerSecond;
  const times = new Float32Array(value.length);
  let at = 0;
  for (let i = 0; i < value.length; i++) {
    const previous = value[i - 1];
    const pause = previous === ' ' ? 1.5 : /[.,(){}]/.test(previous ?? '') ? 1.8 : 1;
    at += base * (0.45 + random() * 1.1) * pause;
    times[i] = at;
  }
  cache.set(cacheKey, times);
  return times;
}

/** Seconds it takes to type `value`. */
export function typingDuration(value: string, charsPerSecond: number) {
  const times = keyTimes(value, charsPerSecond);
  return times.length ? times[times.length - 1] : 0;
}

/** How many characters of `value` are on screen `elapsed` seconds after typing starts. */
export function typedLength(value: string, elapsed: number, charsPerSecond: number) {
  if (elapsed <= 0) return 0;
  const times = keyTimes(value, charsPerSecond);
  let low = 0;
  let high = times.length;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (times[mid] <= elapsed) low = mid + 1;
    else high = mid;
  }
  return low;
}

/** Streams text a few words at a time, the way model output arrives. */
export function streamedLength(value: string, elapsed: number, charsPerSecond: number) {
  if (elapsed <= 0) return 0;
  const target = Math.min(value.length, Math.floor(elapsed * charsPerSecond));
  // Snap to the end of a word so text arrives in small chunks, not letter by letter.
  const space = value.indexOf(' ', target);
  return target >= value.length ? value.length : space === -1 ? value.length : space;
}
