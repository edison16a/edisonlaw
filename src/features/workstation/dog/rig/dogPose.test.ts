import { describe, expect, it } from 'vitest';
import { createDogRig } from './createDogRig';
import { applyDogPose, createDogPose, dogPose, type DogPose } from './dogPose';

const SEED = 53;

/** Every value in a pose with the most it may change in one frame at 60 fps. */
function values(pose: DogPose): [number, number][] {
  return [
    [pose.lean, 0.02],
    [pose.rock, 0.02],
    // Breath is a normalised cycle rather than an angle.
    [pose.breath, 0.1],
    [pose.head.yaw, 0.06],
    [pose.head.pitch, 0.06],
    [pose.head.tilt, 0.06],
    // A happy wag is quick.
    ...pose.tail.map((swing): [number, number] => [swing, 0.12]),
    [pose.tailLift, 0.03],
    ...pose.ears.flatMap((ear): [number, number][] => [
      [ear.out, 0.06],
      [ear.forward, 0.06],
    ]),
    // Blinks are meant to be quick.
    [pose.blink, 0.5],
  ];
}

/** Just the values, with minus zero folded into zero. */
const plain = (pose: DogPose) => values(pose).map(([value]) => value + 0);

describe('dogPose', () => {
  it('holds one still pose when motion is off', () => {
    const first = plain(dogPose(0, 0, SEED, createDogPose()));
    for (const t of [1.3, 7.9, 42]) expect(plain(dogPose(t, 0, SEED, createDogPose()))).toEqual(first);
  });

  it('moves smoothly, with no pops between frames', () => {
    const a = createDogPose();
    const b = createDogPose();
    for (let t = 0; t < 60; t += 0.05) {
      const before = values(dogPose(t, 1, SEED, a));
      const after = values(dogPose(t + 1 / 60, 1, SEED, b));
      before.forEach(([value, limit], index) => expect(Math.abs(after[index][0] - value)).toBeLessThan(limit));
    }
  });

  it('stays in a believable range', () => {
    const pose = createDogPose();
    for (let t = 0; t < 120; t += 0.1) {
      dogPose(t, 1, SEED, pose);
      expect(pose.blink).toBeGreaterThanOrEqual(0);
      expect(pose.blink).toBeLessThanOrEqual(1);
      for (const ear of pose.ears) expect(ear.out).toBeGreaterThanOrEqual(0);
      expect(Math.abs(pose.lean)).toBeLessThan(0.06);
      for (const swing of pose.tail) expect(Math.abs(swing)).toBeLessThan(0.6);
    }
  });

  it('keeps the crown under the hand however the head moves', () => {
    const rig = createDogRig();
    const crown = rig.head.position.clone();
    const pose = createDogPose();
    for (let t = 0; t < 30; t += 0.25) {
      applyDogPose(rig, dogPose(t, 1, SEED, pose));
      expect(rig.head.position.distanceTo(crown)).toBe(0);
    }
  });
});
