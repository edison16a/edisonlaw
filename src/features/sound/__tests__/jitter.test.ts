import { describe, expect, it } from 'vitest';
import { RATE_RANGE } from '../config';
import { jitterRate } from '../jitter';

describe('jitterRate', () => {
  it('stays within plus or minus the jitter amount', () => {
    expect(jitterRate(1, 0.04, () => 0)).toBeCloseTo(0.96);
    expect(jitterRate(1, 0.04, () => 0.5)).toBeCloseTo(1);
    expect(jitterRate(1, 0.04, () => 0.999999)).toBeCloseTo(1.04);
  });

  it('scales around the requested rate', () => {
    expect(jitterRate(1.5, 0.04, () => 0)).toBeCloseTo(1.44);
    expect(jitterRate(1.5, 0.04, () => 0.999999)).toBeCloseTo(1.56);
  });

  it('varies from call to call but never leaves the default bounds', () => {
    const rates = Array.from({ length: 500 }, () => jitterRate());
    expect(Math.min(...rates)).toBeGreaterThanOrEqual(0.96);
    expect(Math.max(...rates)).toBeLessThanOrEqual(1.04);
    expect(new Set(rates).size).toBeGreaterThan(400);
  });

  it('clamps extreme rates to a natural range', () => {
    expect(jitterRate(10, 0.04, () => 0.5)).toBe(RATE_RANGE[1]);
    expect(jitterRate(0.1, 0.04, () => 0.5)).toBe(RATE_RANGE[0]);
  });
});
