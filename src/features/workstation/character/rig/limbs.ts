import { Matrix4, Quaternion, Vector3 } from 'three';
import { solveTwoBone } from './ik';
import type { LimbRig } from './types';

/** What a limb should do this frame. Everything is in the character's own space. */
export interface LimbGoal {
  /** Where the end joint (wrist or ankle) goes. */
  target: Vector3;
  /** Rotation of the hand or foot. */
  rotation: Quaternion;
  /** Direction the elbow or knee should point. */
  pole: Vector3;
}

export const createLimbGoal = (): LimbGoal => ({ target: new Vector3(), rotation: new Quaternion(), pole: new Vector3() });

const X_AXIS = new Vector3(1, 0, 0);
const inverse = new Matrix4();
const localTarget = new Vector3();
const localPole = new Vector3();
const baseRotation = new Quaternion();
const lowerRotation = new Quaternion();
const chain = new Quaternion();

/**
 * Solves a limb toward its goal. `baseMatrix` is the limb base (shoulder or hip) in character space.
 * The hand or foot takes whatever local rotation makes it match the goal rotation exactly.
 */
export function poseLimb(limb: LimbRig, baseMatrix: Matrix4, goal: LimbGoal, upperLength: number, lowerLength: number) {
  inverse.copy(baseMatrix).invert();
  localTarget.copy(goal.target).applyMatrix4(inverse);
  localPole.copy(goal.pole).transformDirection(inverse);
  const bend = solveTwoBone(localTarget, localPole, upperLength, lowerLength, limb.upper.quaternion);
  lowerRotation.setFromAxisAngle(X_AXIS, -bend);
  limb.lower.quaternion.copy(lowerRotation);
  baseRotation.setFromRotationMatrix(baseMatrix);
  chain.copy(baseRotation).multiply(limb.upper.quaternion).multiply(lowerRotation).invert();
  limb.end.quaternion.copy(chain).multiply(goal.rotation);
}

const basis = new Matrix4();
const axisX = new Vector3();
const axisY = new Vector3();
const axisZ = new Vector3();

/**
 * Rotation whose local -Y points along `along` (fingers or bone direction) and whose local +Z
 * leans toward `facing` (back of the hand, or up for a foot).
 */
export function aimRotation(along: Vector3, facing: Vector3, out: Quaternion) {
  axisY.copy(along).normalize().negate();
  axisZ.copy(facing).addScaledVector(axisY, -facing.dot(axisY)).normalize();
  axisX.crossVectors(axisY, axisZ);
  return out.setFromRotationMatrix(basis.makeBasis(axisX, axisY, axisZ));
}

const offset = new Vector3();

/** Wrist or ankle position that puts a point given in the end bone's space (`local`) at `point`. */
export function jointFor(point: Vector3, rotation: Quaternion, local: Vector3, out: Vector3) {
  offset.copy(local).applyQuaternion(rotation);
  return out.copy(point).sub(offset);
}
