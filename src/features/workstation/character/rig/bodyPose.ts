import { Euler, Matrix4, Vector3 } from 'three';
import { BODY, LIMBS } from '../dimensions';
import { applyExpression, createExpression, type Expression } from './expression';
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
  /** How far each shoulder joint rolls forward, in metres. */
  reach: Record<LimbName, number>;
  arms: Record<LimbName, LimbGoal>;
  legs: Record<LimbName, LimbGoal>;
  /** Curl of index, middle, ring and little finger at the knuckle, in radians. */
  fingers: Record<LimbName, [number, number, number, number]>;
  /** How much the middle joints bend, as a share of each knuckle's curl. */
  fingerBend: Record<LimbName, number>;
  thumbs: Record<LimbName, number>;
  /** 0 open, 1 shut. */
  blink: number;
  expression: Expression;
  /** Where the eyes look within the face, -1 to 1: +x toward his left, +y up. */
  gaze: { x: number; y: number };
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
    reach: { left: 0, right: 0 },
    arms: { left: createLimbGoal(), right: createLimbGoal() },
    legs: { left: createLimbGoal(), right: createLimbGoal() },
    fingers: { left: [0, 0, 0, 0], right: [0, 0, 0, 0] },
    fingerBend: { left: 0.7, right: 0.7 },
    thumbs: { left: 0, right: 0 },
    blink: 0,
    expression: createExpression(),
    gaze: { x: 0, y: 0 },
  };
}

const LIMB_NAMES: readonly LimbName[] = ['left', 'right'];
/** How far the eyes slide across the face at full gaze, in metres. */
const GAZE_SHIFT = { x: 0.0045, y: 0.003 } as const;
/** Share of the eye a full squint covers. */
const SQUINT_DEPTH = 0.32;
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

  for (let side = 0; side < LIMB_NAMES.length; side++) {
    const name = LIMB_NAMES[side];
    const arm = rig.arms[name];
    arm.base.position.y = BODY.shoulder.y + pose.shrug[name];
    arm.base.position.z = BODY.shoulder.z + pose.reach[name];
    arm.base.updateMatrix();
    baseMatrix.multiplyMatrices(chestMatrix, arm.base.matrix);
    poseLimb(arm, baseMatrix, pose.arms[name], LIMBS.arm.upper, LIMBS.arm.lower);
    for (let i = 0; i < arm.fingers.length; i++) {
      arm.fingers[i].rotation.x = pose.fingers[name][i];
      arm.fingerTips[i].rotation.x = pose.fingers[name][i] * pose.fingerBend[name];
    }
    arm.thumb.rotation.x = pose.thumbs[name];

    const leg = rig.legs[name];
    leg.base.updateMatrix();
    baseMatrix.multiplyMatrices(rig.pelvis.matrix, leg.base.matrix);
    poseLimb(leg, baseMatrix, pose.legs[name], LIMBS.leg.upper, LIMBS.leg.lower);
  }

  // A squint lowers the lids part way, a blink closes them the rest of the way.
  const shut = pose.blink + (1 - pose.blink) * SQUINT_DEPTH * pose.expression.squint;
  const open = 1 - 0.93 * shut;
  const shine = Math.max(0, 1 - shut * 2.5);
  for (let i = 0; i < 2; i++) {
    rig.eyes[i].scale.y = open;
    rig.gazes[i].position.set(pose.gaze.x * GAZE_SHIFT.x, pose.gaze.y * GAZE_SHIFT.y, 0);
    rig.shines[i].scale.setScalar(shine);
    rig.shines[i].visible = shine > 0;
  }
  applyExpression(rig, pose.expression);
}
