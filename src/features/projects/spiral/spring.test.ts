import { describe, expect, it } from 'vitest';
import { stepSpring, type SpringState } from './spring';

describe('stepSpring', () => {
  it('reaches the target without overshooting', () => {
    const state: SpringState = { value: 0, velocity: 0 };
    let peak = 0;
    for (let frame = 0; frame < 240; frame++) {
      stepSpring(state, 3, 0.3, 1 / 60);
      peak = Math.max(peak, state.value);
    }
    expect(peak).toBeLessThanOrEqual(3);
    expect(state.value).toBeCloseTo(3, 3);
  });

  it('moves the same distance at 30 and 120 frames per second', () => {
    const slow: SpringState = { value: 0, velocity: 0 };
    const fast: SpringState = { value: 0, velocity: 0 };
    for (let frame = 0; frame < 15; frame++) stepSpring(slow, 1, 0.3, 1 / 30);
    for (let frame = 0; frame < 60; frame++) stepSpring(fast, 1, 0.3, 1 / 120);
    expect(slow.value).toBeCloseTo(fast.value, 1);
  });

  it('ignores empty frames', () => {
    const state: SpringState = { value: 1, velocity: 2 };
    stepSpring(state, 5, 0.3, 0);
    expect(state).toEqual({ value: 1, velocity: 2 });
  });
});
