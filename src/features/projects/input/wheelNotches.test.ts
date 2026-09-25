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

  it('allows the same small slack however many notches an event holds', () => {
    expect(notchesIn(900.05, 100)).toBe(9);
    expect(notchesIn(363.97, 40.09)).toBe(0);
    expect(notchesIn(117.1, 117.3)).toBe(0);
  });
});
