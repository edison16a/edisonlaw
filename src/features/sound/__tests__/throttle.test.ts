import { describe, expect, it } from 'vitest';
import { createThrottle } from '../throttle';

describe('createThrottle', () => {
  const intervals = { tick: 28, hover: 60 };
  const allow = () => createThrottle<keyof typeof intervals>((key) => intervals[key]);

  it('lets the first call through and drops repeats inside the interval', () => {
    const throttle = allow();
    expect(throttle('tick', 1000)).toBe(true);
    expect(throttle('tick', 1010)).toBe(false);
    expect(throttle('tick', 1027)).toBe(false);
    expect(throttle('tick', 1028)).toBe(true);
  });

  it('thins a steady stream instead of blocking it', () => {
    const throttle = allow();
    // A call every 10 ms for a second: every third one is 30 ms after the last and passes.
    const allowed = Array.from({ length: 100 }, (_, frame) => throttle('tick', frame * 10)).filter(Boolean).length;
    expect(allowed).toBe(34);
  });

  it('keeps every key on its own clock', () => {
    const throttle = allow();
    expect(throttle('tick', 0)).toBe(true);
    expect(throttle('hover', 5)).toBe(true);
    expect(throttle('hover', 40)).toBe(false);
    expect(throttle('tick', 40)).toBe(true);
  });
});
