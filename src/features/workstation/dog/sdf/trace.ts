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

/**
 * The point of the surface that reaches furthest along `direction`: rays traced in toward `origin` in a
 * fan round `direction`, out to `spread` degrees from it every `step` degrees and 36 to a ring, keeping
 * the hit that lies furthest along it.
 */
export function furthestAlong(field: Field, origin: Vec3Like, direction: Vector3, spread: number, step = 1): Vector3 {
  const axis = direction.clone().normalize();
  const across = new Vector3(1, 0, 0).addScaledVector(axis, -axis.x).normalize();
  const along = new Vector3().crossVectors(axis, across);
  const ray = new Vector3();
  const found = new Vector3();
  let best = -Infinity;
  for (let ring = 0; ring <= spread; ring += step) {
    const tilt = (ring * Math.PI) / 180;
    for (let turn = 0; turn < (ring === 0 ? 1 : 36); turn++) {
      const angle = (turn * Math.PI) / 18;
      ray
        .copy(axis)
        .multiplyScalar(Math.cos(tilt))
        .addScaledVector(across, Math.sin(tilt) * Math.cos(angle))
        .addScaledVector(along, Math.sin(tilt) * Math.sin(angle));
      const { position } = surfaceFrame(field, origin, ray.toArray());
      const reach = position.dot(axis);
      if (reach > best) {
        best = reach;
        found.copy(position);
      }
    }
  }
  return found;
}

function gradientAt(field: Field, point: Vector3, eps = 1e-4) {
  const { x, y, z } = point;
  return new Vector3(
    field.distance(x + eps, y, z) - field.distance(x - eps, y, z),
    field.distance(x, y + eps, z) - field.distance(x, y - eps, z),
    field.distance(x, y, z + eps) - field.distance(x, y, z - eps),
  ).divideScalar(2 * eps);
}
