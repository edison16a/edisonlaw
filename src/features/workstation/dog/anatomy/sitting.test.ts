import { describe, expect, it } from 'vitest';
import { PAWS } from '../dimensions';
import { coatField } from './coat';
import { TAIL_PATH } from './tail';

const field = coatField();

/** Height where a vertical line through a dog space point first meets the coat, marching `down` or up. */
function surfaceOnLine(x: number, z: number, down: boolean) {
  let y = down ? 1 : -0.2;
  for (let i = 0; i < 400; i++) {
    const d = field.distance(x, y, z);
    if (d < 1e-6) return y;
    y += down ? -d : d;
    if (y > 1) break;
  }
  return NaN;
}
const topAt = (x: number, z: number) => surfaceOnLine(x, z, true);
const bottomAt = (x: number, z: number) => surfaceOnLine(x, z, false);

/** The floor, give or take the pile of the rug the dog sinks into a little. */
const ON_FLOOR = 0.035;

describe('the sitting dog', () => {
  it('is a grown retriever, 0.50 to 0.56 at the shoulder', () => {
    // Just behind the neck, over the shoulder blades.
    const withers = topAt(0, -0.02);
    expect(withers).toBeGreaterThan(0.5);
    expect(withers).toBeLessThan(0.56);
  });

  it('rests its seat, its hocks and all four paws on the floor', () => {
    expect(bottomAt(0, -0.18)).toBeLessThan(ON_FLOOR);
    for (const side of [1, -1]) {
      expect(bottomAt(PAWS.front[0] * side, PAWS.front[1])).toBeLessThan(0.005);
      expect(bottomAt(PAWS.rear[0] * side, PAWS.rear[1])).toBeLessThan(0.005);
      expect(bottomAt(PAWS.hock[0] * side, PAWS.hock[1])).toBeLessThan(ON_FLOOR);
    }
  });

  it('brings the hind paws forward beside the forepaws, a little outside and behind them', () => {
    expect(PAWS.rear[0]).toBeGreaterThan(PAWS.front[0]);
    expect(PAWS.rear[1]).toBeLessThan(PAWS.front[1]);
    expect(PAWS.front[1] - PAWS.rear[1]).toBeLessThan(0.15);
  });

  it('slopes its back up from the seat to the withers', () => {
    const heights = [-0.26, -0.2, -0.14, -0.08, -0.02].map((z) => topAt(0, z));
    for (let i = 1; i < heights.length; i++) expect(heights[i]).toBeGreaterThan(heights[i - 1] + 0.02);
    // Steeper than level and well short of upright, as a retriever sits.
    const rise = Math.atan2(heights[heights.length - 1] - heights[0], 0.24);
    expect(rise).toBeGreaterThan(0.7);
    expect(rise).toBeLessThan(1.2);
  });

  it('lays its tail along the floor round its left haunch', () => {
    for (const [x, , z] of TAIL_PATH.slice(2)) {
      expect(bottomAt(x, z)).toBeLessThan(0.01);
      expect(topAt(x, z)).toBeLessThan(0.08);
    }
    const tip = TAIL_PATH[TAIL_PATH.length - 1];
    expect(tip[0]).toBeGreaterThan(0.15);
    expect(tip[2]).toBeGreaterThan(-0.12);
  });
});
