import { Matrix4, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { headForms, headFur } from '../anatomy/head';
import { HEAD, PART_COUNT } from '../dimensions';
import { Field } from '../sdf/field';
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
    // The tail only sweeps slowly across the floor.
    ...pose.tail.map((swing): [number, number] => [swing, 0.01]),
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
      // Leaning into the hand, never so far that its shoulder reaches Edison's leg.
      expect(Math.abs(pose.lean)).toBeLessThan(0.03);
      for (const swing of pose.tail) expect(Math.abs(swing)).toBeLessThan(0.6);
    }
  });

  it('keeps the crown in the palm however the head moves', () => {
    const rig = createDogRig();
    const pivot = rig.head.position.clone();
    const pose = createDogPose();
    const head = new Field([...headForms(), ...headFur()], PART_COUNT);
    // The dome the palm strokes over, as in character/rig/petting.ts: 0.1 across, touching the crown
    // contact and leaning in from Edison's side. Sampled out to a stroke's reach in every direction.
    const lean = HEAD.contactLean;
    const from = new Vector3(-Math.cos(HEAD.contactFrom), 0, -Math.sin(HEAD.contactFrom));
    const normal = new Vector3(0, Math.cos(lean), 0).addScaledVector(from, Math.sin(lean));
    const side = new Vector3().crossVectors(normal, new Vector3(0, 0, 1)).normalize();
    const ahead = new Vector3().crossVectors(side, normal);
    const dome = new Vector3(...HEAD.top).addScaledVector(normal, -0.1);
    const palm: Vector3[] = [];
    for (const angle of [0, 0.12, 0.24]) {
      for (let turn = 0; turn < Math.PI * 2; turn += Math.PI / 4) {
        const out = normal.clone().multiplyScalar(Math.cos(angle));
        out.addScaledVector(side, Math.sin(angle) * Math.cos(turn)).addScaledVector(ahead, Math.sin(angle) * Math.sin(turn));
        palm.push(dome.clone().addScaledVector(out, 0.1));
      }
    }
    const toHead = new Matrix4();
    const point = new Vector3();
    for (let t = 0; t < 40; t += 0.25) {
      applyDogPose(rig, dogPose(t, 1, SEED, pose));
      rig.root.updateMatrixWorld(true);
      expect(rig.head.position.distanceTo(pivot)).toBe(0);
      // Dog space into head space: out of the head bone, then back by where head space sits in it.
      toHead.copy(rig.head.matrixWorld).invert().premultiply(new Matrix4().makeTranslation(-rig.headOrigin.x, -rig.headOrigin.y, -rig.headOrigin.z));
      for (const p of palm) {
        point.copy(p).applyMatrix4(toHead);
        // Pressed a few millimetres into the fur at most, and never lifting off it.
        const gap = head.distance(point.x, point.y, point.z) * HEAD.scale;
        expect(gap).toBeGreaterThan(-0.006);
        expect(gap).toBeLessThan(0.0015);
      }
    }
  });
});
