import { Matrix4, Quaternion, Vector3 } from 'three';
import type { Field } from './field';
import type { Vec3Like } from './primitives';

export interface SurfaceFrame {
  position: Vector3;
  /** Local +Z along the outward normal, local +Y as close to straight up as the surface allows. */
  quaternion: Quaternion;
  normal: Vector3;
}

/**
 * Finds where a ray from far outside, aimed back at `origin` along `direction`, first meets the surface,
 * and the frame of the surface there. Used to seat eyes and the nose exactly on the sculpted head.
 */
export function surfaceFrame(field: Field, origin: Vec3Like, direction: Vec3Like, lift = 0, reach = 0.4): SurfaceFrame {
  const dir = new Vector3(...direction).normalize();
  const point = new Vector3(...origin).addScaledVector(dir, reach);
  for (let i = 0; i < 400; i++) {
    const d = field.distance(point.x, point.y, point.z);
    if (Math.abs(d) < 1e-7) break;
    point.addScaledVector(dir, -d * 0.9);
  }
  const normal = gradientAt(field, point).normalize();
  const up = new Vector3(0, 1, 0).addScaledVector(normal, -normal.y).normalize();
  const side = new Vector3().crossVectors(up, normal);
  const quaternion = new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(side, up, normal));
  return { position: point.addScaledVector(normal, lift), quaternion, normal };
}

export function gradientAt(field: Field, point: Vector3, eps = 1e-4) {
  const { x, y, z } = point;
  return new Vector3(
    field.distance(x + eps, y, z) - field.distance(x - eps, y, z),
    field.distance(x, y + eps, z) - field.distance(x, y - eps, z),
    field.distance(x, y, z + eps) - field.distance(x, y, z - eps),
  ).divideScalar(2 * eps);
}
