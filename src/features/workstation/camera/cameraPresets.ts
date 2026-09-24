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
  // From the left, a little above eye level, so the standing figure reads in three-quarter profile
  // against the glowing screens. The camera stands well back past the left wall, which is single sided
  // and so invisible, with a long lens that keeps the near end of the room from looming. The plant, the
  // shelf, the cork board, the picture, the desk with all three monitors, Edison and the whole golden
  // retriever on his left all stay clear of the stage's faded edges. The portrait shot is tuned for a
  // desktop half panel, and taller panels keep its width.
  about: {
    portrait: { position: [-9, 2.85, 3.95], target: [0.11, 0.92, -0.03], fov: 23.9 },
    landscape: { position: [-9, 2.85, 3.95], target: [0.11, 0.93, -0.04], fov: 19.6 },
    aspects: [0.86, 1.4],
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
