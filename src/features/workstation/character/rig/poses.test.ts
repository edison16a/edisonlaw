import { Group, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { CHAIR, DOG_PAT_POINT, ROOM } from '../../layout';
import { BODY, HAND } from '../dimensions';
import { SEATED_PLACEMENT, STANDING_PLACEMENT, type Placement } from '../placement';
import { applyBodyPose, createBodyPose, type BodyPose } from './bodyPose';
import { createRig } from './createRig';
import { seatedPose } from './seatedPose';
import { standingPose } from './standingPose';
import type { Rig } from './types';

type PoseLayer = (t: number, motion: number, seed: number, pose: BodyPose) => void;

/** Nests the bones the way CharacterBody does and places the character in the room. */
function mount(placement: Placement) {
  const rig = createRig();
  const root = new Group();
  root.position.set(...placement.position);
  root.rotation.y = placement.rotationY;
  root.add(rig.pelvis);
  rig.pelvis.add(rig.legs.left.base, rig.legs.right.base, rig.spine);
  rig.spine.add(rig.chest);
  rig.chest.add(rig.arms.left.base, rig.arms.right.base, rig.neck);
  rig.neck.add(rig.head);
  for (const limb of [rig.arms.left, rig.arms.right, rig.legs.left, rig.legs.right]) {
    limb.base.add(limb.upper);
    limb.upper.add(limb.lower);
    limb.lower.add(limb.end);
  }
  return { rig, root };
}

/** Poses the rig at time `t` and brings every world matrix up to date. */
function poseAt(layer: PoseLayer, seed: number, t: number, rig: Rig, root: Group, pose: BodyPose) {
  layer(t, 1, seed, pose);
  applyBodyPose(rig, pose);
  root.updateMatrixWorld(true);
}

/** Middle of the left palm's skin, the point that rests on the dog's head (as in petting.ts). */
const PALM = new Vector3(0, -HAND.palmLength * 0.56, -0.0156);
/** Back of the heel and tip of the toe under the sneaker, in the foot bone's space with the shoe's scale in Leg.tsx. */
const SOLE = [new Vector3(0, -BODY.ankle, -0.03 * 1.14), new Vector3(0, -BODY.ankle, 0.124 * 1.14)];

const point = new Vector3();

describe('standing pose', () => {
  const { rig, root } = mount(STANDING_PLACEMENT);
  const pose = createBodyPose();
  const pat = new Vector3(...DOG_PAT_POINT);

  it('keeps the left palm on the top of the dog head', () => {
    for (let t = 0; t < 90; t += 0.1) {
      poseAt(standingPose, 29, t, rig, root, pose);
      // The palm strokes a couple of centimetres each way from the pat point.
      expect(point.copy(PALM).applyMatrix4(rig.arms.left.end.matrixWorld).distanceTo(pat)).toBeLessThan(0.03);
    }
  });

  it('stands with both soles on the floor', () => {
    for (let t = 0; t < 30; t += 0.5) {
      poseAt(standingPose, 29, t, rig, root, pose);
      for (const leg of [rig.legs.left, rig.legs.right]) {
        for (const local of SOLE) expect(point.copy(local).applyMatrix4(leg.end.matrixWorld).y).toBeCloseTo(ROOM.floorY, 2);
      }
    }
  });
});

describe('seated pose', () => {
  const { rig, root } = mount(SEATED_PLACEMENT);
  const pose = createBodyPose();

  it('lets the feet hang clear of the floor, under the front of the seat', () => {
    for (let t = 0; t < 60; t += 0.1) {
      poseAt(seatedPose, 11, t, rig, root, pose);
      for (const leg of [rig.legs.left, rig.legs.right]) {
        for (const local of SOLE) expect(point.copy(local).applyMatrix4(leg.end.matrixWorld).y).toBeGreaterThan(0.08);
        // The knees stay up on the seat's level and the shins hang back from them, well below the seat.
        const knee = leg.lower.getWorldPosition(point);
        expect(knee.y).toBeGreaterThan(CHAIR.seatHeight);
        const ankle = leg.end.getWorldPosition(point);
        expect(ankle.y).toBeLessThan(CHAIR.seatHeight - 0.12);
        expect(ankle.z).toBeGreaterThan(SEATED_PLACEMENT.position[2] - BODY.thigh);
      }
    }
  });
});

describe.each([
  ['seated', seatedPose, SEATED_PLACEMENT, 11],
  ['standing', standingPose, STANDING_PLACEMENT, 29],
] as const)('%s pose', (_, layer, placement, seed) => {
  it('moves hands and feet smoothly, with no pops between frames', () => {
    const { rig, root } = mount(placement);
    const pose = createBodyPose();
    const ends = [rig.arms.left.end, rig.arms.right.end, rig.legs.left.end, rig.legs.right.end];
    const before = ends.map(() => new Vector3());
    for (let t = 0; t < 60; t += 0.05) {
      poseAt(layer, seed, t, rig, root, pose);
      ends.forEach((end, i) => end.getWorldPosition(before[i]));
      poseAt(layer, seed, t + 1 / 60, rig, root, pose);
      ends.forEach((end, i) => expect(end.getWorldPosition(point).distanceTo(before[i])).toBeLessThan(0.02));
    }
  });
});
