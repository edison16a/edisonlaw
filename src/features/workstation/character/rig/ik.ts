import { Matrix4, Quaternion, Vector3 } from 'three';
import { clamp } from '@/lib/math';

const direction = new Vector3();
const bendDirection = new Vector3();
const elbow = new Vector3();
const lowerDirection = new Vector3();
const axisX = new Vector3();
const axisY = new Vector3();
const axisZ = new Vector3();
const basis = new Matrix4();
const fallback = new Vector3();

/**
 * Two bone IK for a limb whose bones hang along their own -Y and bend around their own X.
 * `target` (the end joint) and `pole` (where the middle joint should point) are in the limb base's space,
 * with the upper joint at the origin. Writes the upper bone rotation into `upper` and returns the bend
 * angle for the lower bone, to apply as a rotation of minus that angle around its X axis.
 * Allocation free: safe to call every frame.
 */
export function solveTwoBone(target: Vector3, pole: Vector3, upperLength: number, lowerLength: number, upper: Quaternion) {
  const reach = upperLength + lowerLength;
  const distance = clamp(target.length(), Math.abs(upperLength - lowerLength) + 1e-4, reach * 0.9995);
  direction.copy(target).normalize();

  // Angle at the upper joint from the law of cosines.
  const cosUpper = clamp((upperLength ** 2 + distance ** 2 - lowerLength ** 2) / (2 * upperLength * distance), -1, 1);
  const sinUpper = Math.sqrt(1 - cosUpper * cosUpper);

  // The middle joint swings off the straight line toward the pole.
  bendDirection.copy(pole).addScaledVector(direction, -pole.dot(direction));
  if (bendDirection.lengthSq() < 1e-8) {
    fallback.set(0, 0, 1).addScaledVector(direction, -direction.z);
    bendDirection.copy(fallback.lengthSq() > 1e-8 ? fallback : fallback.set(1, 0, 0));
  }
  bendDirection.normalize();
  elbow.copy(direction).multiplyScalar(cosUpper * upperLength).addScaledVector(bendDirection, sinUpper * upperLength);

  // Upper bone frame: Y runs back up the bone, Z faces the way the lower bone swings.
  axisY.copy(elbow).multiplyScalar(-1 / upperLength);
  lowerDirection.copy(direction).multiplyScalar(distance).sub(elbow).normalize();
  axisZ.copy(lowerDirection).addScaledVector(axisY, -lowerDirection.dot(axisY));
  if (axisZ.lengthSq() < 1e-8) axisZ.copy(bendDirection).multiplyScalar(-1).addScaledVector(axisY, bendDirection.dot(axisY));
  axisZ.normalize();
  axisX.crossVectors(axisY, axisZ);
  basis.makeBasis(axisX, axisY, axisZ);
  upper.setFromRotationMatrix(basis);

  return Math.acos(clamp(-lowerDirection.dot(axisY), -1, 1));
}
