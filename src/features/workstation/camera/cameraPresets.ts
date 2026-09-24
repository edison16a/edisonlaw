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
  /** Panel aspect ratios (width / height) the portrait and landscape shots are tuned for. */
  aspects: readonly [portrait: number, landscape: number];
}

export const CAMERA_FRAMINGS: Record<StageVariant, CameraFraming> = {
  // Elevated three-quarter view from behind and to the right, like the reference.
  work: {
    portrait: { position: [3.0, 3.25, 4.4], target: [0.36, 0.72, -0.3], fov: 37 },
    landscape: { position: [2.6, 2.85, 3.6], target: [0.35, 0.9, -0.3], fov: 32 },
    aspects: [0.7, 1.4],
  },
  // From the left, near eye level, so the standing figure reads in three-quarter profile against
  // the glowing screens. The camera sits past the left wall, which is single sided and so invisible.
  // Wide enough that the left monitor, the Mac mini, Edison and the whole golden retriever on his left,
  // tail and paws included, stay clear of the stage's faded edges at every panel width.
  about: {
    portrait: { position: [-4.8, 1.95, 2.3], target: [0.25, 1.0, 0.25], fov: 40 },
    landscape: { position: [-4.6, 1.98, 2.3], target: [0.22, 0.86, 0.2], fov: 25.5 },
    aspects: [0.7, 1.4],
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
  const { portrait: a, landscape: b, aspects } = framing;
  const [portraitAspect, landscapeAspect] = aspects;
  const t = smoothstep(portraitAspect, landscapeAspect, aspect);
  out.position.fromArray(a.position).lerp(scratch.fromArray(b.position), t);
  out.target.fromArray(a.target).lerp(scratch.fromArray(b.target), t);
  out.fov = a.fov + (b.fov - a.fov) * t;

  if (aspect < portraitAspect) {
    // Keep the horizontal field of view of the portrait shot on even taller panels.
    const halfWidth = Math.tan((a.fov * Math.PI) / 360) * portraitAspect;
    out.fov = (Math.atan(halfWidth / aspect) * 360) / Math.PI;
  }
  return out;
}
