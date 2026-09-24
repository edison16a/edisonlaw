import { cardBend } from './appearance';
import { CARD_HEIGHT, CARD_WIDTH, cardPose, createPose, SPIRAL } from './geometry';
import { CAMERA, fitFov } from './lens';

/** A box on the stage in CSS pixels from its top left corner. */
export interface StageRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

const pose = createPose();

/**
 * Where the focused card sits on a `width` by `height` stage once it has come
 * forward, with the picture slid `shift` pixels left and `lift` pixels up for
 * the panel. It follows the camera, the card's bend and the strand's sweep the
 * way the canvas draws them, in plain math so the page can place the arrows
 * beside the card without loading three.js.
 */
export function focusCardRect(width: number, height: number, shift: number, lift: number): StageRect {
  cardPose(0, 1, 0, pose);
  // Pixels per world unit at one unit from the camera.
  const focal = height / 2 / Math.tan((fitFov(width / height) * Math.PI) / 360);
  // The settled card relaxes almost flat, so its edges fall back only a little.
  const curvature = cardBend(0, pose.focus) / SPIRAL.radius;
  const angle = (CARD_WIDTH / 2) * curvature;
  const halfWidth = (Math.sin(angle) / curvature) * pose.scale;
  const edgeZ = pose.z + ((Math.cos(angle) - 1) / curvature) * pose.scale;
  const halfHeight = (CARD_HEIGHT / 2) * pose.scale;

  const rect: StageRect = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity };
  for (const side of [-1, 1]) {
    for (const end of [-1, 1]) {
      const y = pose.y + end * halfHeight;
      const x = pose.x + side * halfWidth + SPIRAL.sweep * y * y;
      const depth = CAMERA.z - edgeZ;
      const screenX = width / 2 + (x / depth) * focal - shift;
      const screenY = height / 2 - (y / depth) * focal - lift;
      rect.left = Math.min(rect.left, screenX);
      rect.right = Math.max(rect.right, screenX);
      rect.top = Math.min(rect.top, screenY);
      rect.bottom = Math.max(rect.bottom, screenY);
    }
  }
  return rect;
}
