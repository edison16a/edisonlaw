import { describe, expect, it } from 'vitest';
import { createVoiceLimiter } from '../voices';

describe('createVoiceLimiter', () => {
  const caps = { tick: 2, focus: 1 };
  const limiter = (total = 3) => createVoiceLimiter<keyof typeof caps>(total, (key) => caps[key]);

  it('caps how many copies of one sound ring at once', () => {
    const voices = limiter();
    expect(voices.tryStart('tick', 0, 50)).toBe(true);
    expect(voices.tryStart('tick', 10, 50)).toBe(true);
    expect(voices.tryStart('tick', 20, 50)).toBe(false);
  });

  it('frees a voice once its sound has finished', () => {
    const voices = limiter();
    voices.tryStart('focus', 0, 400);
    expect(voices.tryStart('focus', 399, 400)).toBe(false);
    expect(voices.tryStart('focus', 400, 400)).toBe(true);
  });

  it('caps the total across sounds', () => {
    const voices = limiter(2);
    expect(voices.tryStart('tick', 0, 100)).toBe(true);
    expect(voices.tryStart('focus', 0, 100)).toBe(true);
    expect(voices.tryStart('tick', 0, 100)).toBe(false);
    expect(voices.tryStart('tick', 100, 100)).toBe(true);
  });
});
