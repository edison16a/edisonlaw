import { Vector3 } from 'three';
import { smoothstep } from '@/lib/math';
import type { Vec3 } from '../layout';
import type { StageVariant } from '../types';

export interface CameraShot {
  position: Vec3;
  target: Vec3;
  /** Vertical field of view in degrees. */
  fov: number;
}

/** One composition tuned for a tall panel and one for a wide panel. */
export interface CameraFraming {
  portrait: CameraShot;
  landscape: CameraShot;
}

/** Panel aspect ratios (width / height) the two shots are tuned for. */
export const PORTRAIT_ASPECT = 0.7;
export const LANDSCAPE_ASPECT = 1.4;

export const CAMERA_FRAMINGS: Record<StageVariant, CameraFraming> = {
  // Elevated three-quarter view from behind and to the right, like the reference.
  work: {
    portrait: { position: [2.6, 2.85, 3.5], target: [0.28, 0.82, -0.3], fov: 36 },
    landscape: { position: [2.45, 2.7, 3.2], target: [0.3, 0.9, -0.3], fov: 31 },
  },
  // Lower and from the front left, so the standing figure reads in three-quarter profile.
  about: {
    portrait: { position: [-2.0, 1.72, 2.75], target: [0.22, 0.92, -0.18], fov: 36 },
    landscape: { position: [-1.85, 1.62, 2.45], target: [0.2, 0.98, -0.22], fov: 31 },
  },
};

export interface ResolvedShot {
  position: Vector3;
  target: Vector3;
  fov: number;
}

const scratch = new Vector3();

export function createResolvedShot(): ResolvedShot {
  return { position: new Vector3(), target: new Vector3(), fov: 30 };
}

/**
 * Blends the portrait and landscape shots for the current aspect. Outside the tuned
 * range the field of view widens so the horizontal framing never gets cropped.
 */
export function resolveShot(framing: CameraFraming, aspect: number, out: ResolvedShot) {
  const t = smoothstep(PORTRAIT_ASPECT, LANDSCAPE_ASPECT, aspect);
  const { portrait: a, landscape: b } = framing;
  out.position.fromArray(a.position).lerp(scratch.fromArray(b.position), t);
  out.target.fromArray(a.target).lerp(scratch.fromArray(b.target), t);
  out.fov = a.fov + (b.fov - a.fov) * t;

  if (aspect < PORTRAIT_ASPECT) {
    // Keep the horizontal field of view of the portrait shot on even taller panels.
    const halfWidth = Math.tan((a.fov * Math.PI) / 360) * PORTRAIT_ASPECT;
    out.fov = (Math.atan(halfWidth / aspect) * 360) / Math.PI;
  }
  return out;
}
