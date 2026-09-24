import type { PerspectiveCamera } from 'three';

export const CAMERA = {
  z: 8,
  /** Vertical field of view on wide screens, in degrees. */
  fov: 33,
  maxFov: 58,
  /** Half the spiral's width at the axis, which must stay in frame on narrow screens. */
  halfWidth: 2.95,
} as const;

/** Vertical field of view that keeps the whole spiral in frame at this aspect ratio. */
export function fitFov(aspect: number) {
  const needed = (2 * Math.atan(CAMERA.halfWidth / (CAMERA.z * aspect)) * 180) / Math.PI;
  return Math.min(CAMERA.maxFov, Math.max(CAMERA.fov, needed));
}

/**
 * Frames the spiral for a `width` by `height` canvas and slides the picture
 * `shift` CSS pixels to the left, like a shifted lens, so perspective does not
 * change as the scene makes room for the panel.
 */
export function frameCamera(camera: PerspectiveCamera, width: number, height: number, shift: number) {
  const fov = fitFov(width / height);
  const view = camera.view;
  const unchanged =
    camera.fov === fov &&
    view !== null &&
    view.offsetX === shift &&
    view.fullWidth === width &&
    view.fullHeight === height;
  if (unchanged) return;
  camera.fov = fov;
  camera.setViewOffset(width, height, shift, 0, width, height);
}
