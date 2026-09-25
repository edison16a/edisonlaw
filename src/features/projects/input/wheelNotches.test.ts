import { describe, expect, it } from 'vitest';
import { notchesIn } from './wheelNotches';

describe('notchesIn', () => {
  it('counts whole notches, one or merged', () => {
    expect(notchesIn(100, 100)).toBe(1);
    expect(notchesIn(300, 100)).toBe(3);
    expect(notchesIn(160, 53.33)).toBe(3);
    expect(notchesIn(4.000244140625, 4.000244140625)).toBe(1);
  });

  it('is 0 for travel that is not a whole number of notches', () => {
    expect(notchesIn(127, 46)).toBe(0);
    expect(notchesIn(110, 50)).toBe(0);
    expect(notchesIn(40, 100)).toBe(0);
    expect(notchesIn(101, 100)).toBe(0);
  });
});
