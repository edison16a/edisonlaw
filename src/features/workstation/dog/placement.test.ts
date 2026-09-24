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
    // Roughly where his sneakers and left leg are in his own space (see character/rig/standingPose.ts):
    // each shoe about 0.1 to the side of his centre, 0.09 wide and running from 0.03 behind the ankle to
    // 0.12 in front, and his left leg rising from that ankle to the hip in trousers about 0.05 thick. The
    // dog keeps a little more room than the lean into his hand takes up.
    const inRoom = (x: number, y: number, z: number) =>
      new Vector3(x, y, z).applyAxisAngle(UP, STANDING_PLACEMENT.rotationY).add(new Vector3(...STANDING_PLACEMENT.position));
    const clearance = (p: Vector3) => {
      const dog = toDog(p.x, p.y, p.z);
      return field.distance(dog.x, dog.y, dog.z);
    };
    for (const foot of [
      { x: 0.104, z: 0.035, turn: 0.2 },
      { x: -0.1, z: -0.01, turn: -0.26 },
    ]) {
      for (let across = -0.046; across <= 0.046; across += 0.023) {
        for (let along = -0.03; along <= 0.12; along += 0.015) {
          for (const y of [0.01, 0.05, 0.09]) {
            const local = new Vector3(across, y, along).applyAxisAngle(UP, foot.turn);
            expect(clearance(inRoom(foot.x + local.x, y, foot.z + local.z))).toBeGreaterThan(0.02);
          }
        }
      }
    }
    for (let share = 0; share <= 1; share += 0.05) {
      const leg = inRoom(0.104 - 0.032 * share, 0.07 + 0.49 * share, 0.035 * (1 - share));
      expect(clearance(leg) - 0.05).toBeGreaterThan(0.015);
    }
    // The desk: its legs at the corners and the front edge of its top.
    for (const sx of [1, -1]) {
      for (const sz of [1, -1]) {
        for (let y = 0; y < DESK.height; y += 0.05) {
          const p = toDog(sx * (DESK.width / 2 - 0.13), y, DESK.center[2] + sz * (DESK.depth / 2 - 0.1));
          expect(field.distance(p.x, p.y, p.z)).toBeGreaterThan(0.03);
        }
      }
    }
    for (let x = -DESK.width / 2; x <= DESK.width / 2; x += 0.05) {
      const p = toDog(x, DESK.height - DESK.thickness / 2, DESK.frontZ);
      expect(field.distance(p.x, p.y, p.z)).toBeGreaterThan(0.03);
    }
  });
});
