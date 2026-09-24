import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { STANDING_PLACEMENT } from '../character/placement';
import { DESK, DOG_PAT_POINT } from '../layout';
import { coatField } from './anatomy/coat';
import { HEAD } from './dimensions';
import { DOG_PLACEMENT } from './placement';

const field = coatField();
const UP = new Vector3(0, 1, 0);

/** A room point in dog space. */
const toDog = (x: number, y: number, z: number) =>
  new Vector3(x, y, z).sub(new Vector3(...DOG_PLACEMENT.position)).applyAxisAngle(UP, -DOG_PLACEMENT.rotationY);

/** Height of the coat's top surface straight below a dog space point, found by marching down. */
function surfaceBelow(x: number, z: number) {
  let y = 1;
  for (let i = 0; i < 400; i++) {
    const d = field.distance(x, y, z);
    if (d < 1e-6) break;
    y -= d;
  }
  return y;
}

describe('dog placement', () => {
  it('stands on the floor with its crown on DOG_PAT_POINT', () => {
    expect(DOG_PLACEMENT.position[1]).toBe(0);
    const crown = toDog(...DOG_PAT_POINT);
    expect(crown.distanceTo(new Vector3(...HEAD.top))).toBeLessThan(1e-9);
  });

  it('has the top of its head right under the hand', () => {
    const [x, y, z] = HEAD.top;
    expect(Math.abs(surfaceBelow(x, z) - y)).toBeLessThan(0.004);
    // Nothing around the contact rises above the palm, which leans in from Edison's side.
    const slope = Math.tan(HEAD.contactLean);
    for (const [dx, dz] of [
      [0.02, 0],
      [-0.02, 0],
      [0, 0.02],
      [0, -0.02],
    ]) {
      expect(surfaceBelow(x + dx, z + dz)).toBeLessThan(y + dx * slope + 0.003);
    }
  });

  it('is a grown retriever, 0.50 to 0.55 at the shoulder', () => {
    // Just behind the neck, over the shoulder blades.
    const withers = surfaceBelow(0, 0.12);
    expect(withers).toBeGreaterThan(0.5);
    expect(withers).toBeLessThan(0.55);
  });

  it('keeps clear of Edison and of the desk legs', () => {
    // Edison's feet and shins fill roughly a 0.1 radius column around his placement; higher up only
    // the line of his left thigh must stay clear, since the petted head leans against his leg.
    const [ex, , ez] = STANDING_PLACEMENT.position;
    const [sin, cos] = [Math.sin(STANDING_PLACEMENT.rotationY), Math.cos(STANDING_PLACEMENT.rotationY)];
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 24) {
      for (const y of [0.03, 0.15, 0.3]) {
        const p = toDog(ex + Math.cos(angle) * 0.1, y, ez + Math.sin(angle) * 0.1);
        expect(field.distance(p.x, p.y, p.z)).toBeGreaterThan(0.005);
      }
    }
    const thigh = toDog(ex + 0.085 * cos, 0.45, ez - 0.085 * sin);
    expect(field.distance(thigh.x, thigh.y, thigh.z)).toBeGreaterThan(0.04);
    const legX = DESK.width / 2 - 0.13;
    const legZ = DESK.center[2] + DESK.depth / 2 - 0.1;
    for (let y = 0; y < DESK.height; y += 0.05) {
      const p = toDog(legX, y, legZ);
      expect(field.distance(p.x, p.y, p.z)).toBeGreaterThan(0.03);
    }
  });
});
