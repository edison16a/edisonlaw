import { Matrix4, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { PART_COUNT } from '../dimensions';
import { meshPart } from '../geometry/partGeometry';
import { createDogRig } from '../rig/createDogRig';
import { applyDogPose, createDogPose, dogPose } from '../rig/dogPose';
import { Field } from '../sdf/field';
import { earShapes } from './ear';
import { headForms, headFur } from './head';

describe('ears', () => {
  it('hang clear of the head all through the idle', () => {
    // Coarser than the page builds them, which only thickens the flap a little: a fair test.
    const ear = meshPart(new Field(earShapes(), PART_COUNT), 0.004, true);
    const head = new Field([...headForms(), ...headFur()], PART_COUNT);
    const rig = createDogRig();
    const pose = createDogPose();
    const toHead = new Matrix4();
    const fromBone = new Matrix4().makeTranslation(-rig.headOrigin.x, -rig.headOrigin.y, -rig.headOrigin.z);
    const point = new Vector3();
    for (let t = 0; t < 40; t += 0.4) {
      applyDogPose(rig, dogPose(t, 1, 53, pose));
      rig.root.updateMatrixWorld(true);
      for (const [index, side] of [
        [0, 1],
        [1, -1],
      ] as const) {
        // Ear space to head space: into the head bone, then back by where head space sits in it.
        toHead.copy(rig.head.matrixWorld).invert().multiply(rig.ears[index].matrixWorld).premultiply(fromBone);
        for (let n = 0; n < ear.positions.length; n += 9) {
          point.fromArray(ear.positions, n);
          // The fold at the top is meant to sit in the skull.
          if (point.y > -0.035) continue;
          point.x *= side;
          point.applyMatrix4(toHead);
          expect(head.distance(point.x, point.y, point.z)).toBeGreaterThan(-0.001);
        }
      }
    }
  }, 60000);
});
