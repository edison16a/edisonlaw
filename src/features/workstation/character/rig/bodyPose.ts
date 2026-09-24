import { Euler, Matrix4, Vector3 } from 'three';
import { BODY, LIMBS } from '../dimensions';
import { createLimbGoal, poseLimb, type LimbGoal } from './limbs';
import type { LimbName, Rig } from './types';

/**
 * One frame of pose, as the animation layers describe it. Torso angles are local to each bone
 * (turn, then lean, then roll), limb goals are in the character's own space and solved with IK.
 */
export interface BodyPose {
  pelvisPosition: Vector3;
  pelvis: Euler;
  spine: Euler;
  chest: Euler;
  neck: Euler;
  head: Euler;
  /** Extra lift of each shoulder joint, in metres. */
  shrug: Record<LimbName, number>;
  arms: Record<LimbName, LimbGoal>;
  legs: Record<LimbName, LimbGoal>;
  /** Curl of index, middle, ring and little finger, in radians. */
  fingers: Record<LimbName, [number, number, number, number]>;
  thumbs: Record<LimbName, number>;
  /** 0 open, 1 shut. */
  blink: number;
}

export function createBodyPose(): BodyPose {
  return {
    pelvisPosition: new Vector3(),
    pelvis: new Euler(0, 0, 0, 'YXZ'),
    spine: new Euler(0, 0, 0, 'YXZ'),
    chest: new Euler(0, 0, 0, 'YXZ'),
    neck: new Euler(0, 0, 0, 'YXZ'),
    head: new Euler(0, 0, 0, 'YXZ'),
    shrug: { left: 0, right: 0 },
    arms: { left: createLimbGoal(), right: createLimbGoal() },
    legs: { left: createLimbGoal(), right: createLimbGoal() },
    fingers: { left: [0, 0, 0, 0], right: [0, 0, 0, 0] },
    thumbs: { left: 0, right: 0 },
    blink: 0,
  };
}

const LIMB_NAMES: readonly LimbName[] = ['left', 'right'];
const chestMatrix = new Matrix4();
const baseMatrix = new Matrix4();

/** Writes a pose onto the rig: torso first, then IK for the limbs from the updated torso. */
export function applyBodyPose(rig: Rig, pose: BodyPose) {
  rig.pelvis.position.copy(pose.pelvisPosition);
  rig.pelvis.rotation.copy(pose.pelvis);
  rig.spine.rotation.copy(pose.spine);
  rig.chest.rotation.copy(pose.chest);
  rig.neck.rotation.copy(pose.neck);
  rig.head.rotation.copy(pose.head);
  rig.pelvis.updateMatrix();
  rig.spine.updateMatrix();
  rig.chest.updateMatrix();
  chestMatrix.multiplyMatrices(rig.pelvis.matrix, rig.spine.matrix).multiply(rig.chest.matrix);

  for (const name of LIMB_NAMES) {
    const arm = rig.arms[name];
    arm.base.position.y = BODY.shoulder.y + pose.shrug[name];
    arm.base.updateMatrix();
    baseMatrix.multiplyMatrices(chestMatrix, arm.base.matrix);
    poseLimb(arm, baseMatrix, pose.arms[name], LIMBS.arm.upper, LIMBS.arm.lower);
    for (let i = 0; i < arm.fingers.length; i++) arm.fingers[i].rotation.x = pose.fingers[name][i];
    arm.thumb.rotation.x = pose.thumbs[name];

    const leg = rig.legs[name];
    leg.base.updateMatrix();
    baseMatrix.multiplyMatrices(rig.pelvis.matrix, leg.base.matrix);
    poseLimb(leg, baseMatrix, pose.legs[name], LIMBS.leg.upper, LIMBS.leg.lower);
  }

  const open = 1 - 0.93 * pose.blink;
  rig.eyes[0].scale.y = open;
  rig.eyes[1].scale.y = open;
}
