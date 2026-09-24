import { describe, expect, it } from 'vitest';
import { swipeStep } from './swipe';

describe('swipeStep', () => {
  it('brings the next project on a swipe to the left, like a phone gallery', () => {
    expect(swipeStep(-120, 10)).toBe(1);
    expect(swipeStep(120, -10)).toBe(-1);
  });

  it('ignores taps and short slides', () => {
    expect(swipeStep(0, 0)).toBeNull();
    expect(swipeStep(-30, 0)).toBeNull();
  });

  it('leaves mostly vertical swipes to the page scroll', () => {
    expect(swipeStep(-80, 120)).toBeNull();
    expect(swipeStep(90, -80)).toBeNull();
  });
});
