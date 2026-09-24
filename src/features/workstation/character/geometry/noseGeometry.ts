import { BufferGeometry, Color, Float32BufferAttribute, Vector3 } from 'three';
import { PALETTE } from '../materials';
import { headRadius, surfaceFrame } from './headShape';

/**
 * A small button nose, sculpted as a patch of the skull pushed outward. The patch is finely
 * tessellated and its edge lies on the skull with the skull's own normal, so it melts into the face
 * with no rim. Softer above where it runs into the bridge, a little crisper underneath.
 */
const NOSE = {
  theta: 109,
  /** Height of the tip above the skull, in metres. */
  height: 0.0052,
  /** Half widths of the bump: across, above the tip and below it, in metres. */
  across: 0.0086,
  above: 0.0092,
  below: 0.0056,
  /** Half size of the patch in radians, well past where the bump fades out. */
  extent: 0.15,
  segments: 30,
} as const;

/** Clearance above the coarser head mesh, so the two never fight for the same pixels. */
const LIFT = 0.00022;

const frame = surfaceFrame(NOSE.theta, 0, 0);
const centre = new Vector3(0, 0, 1).applyQuaternion(frame.quaternion);
const across = new Vector3(1, 0, 0).applyQuaternion(frame.quaternion);
const up = new Vector3(0, 1, 0).applyQuaternion(frame.quaternion);
const tipTint = new Color(PALETTE.blush);

function bumpAt(x: number, y: number) {
  const vertical = y >= 0 ? NOSE.above : NOSE.below;
  return NOSE.height * Math.exp(-((x / NOSE.across) ** 2) - (y / vertical) ** 2);
}

/** Point on the nose patch for offsets `u`, `v` in radians across and up the face. */
function surfaceAt(u: number, v: number, out: Vector3) {
  out.copy(centre).addScaledVector(across, u).addScaledVector(up, v).normalize();
  const skull = headRadius(out.x, out.y, out.z);
  return out.multiplyScalar(skull + LIFT + bumpAt(u * skull, v * skull));
}

const point = new Vector3();
const du = new Vector3();
const dv = new Vector3();
const normal = new Vector3();
const color = new Color();

/**
 * The nose patch in head centre space with position, normal and colour, ready to merge with the head.
 * `paint` gives the skin colour at a point, so the patch matches the face around it.
 */
export function noseGeometry(paint: (point: Vector3, out: Color) => Color) {
  const { segments, extent } = NOSE;
  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const step = 1e-4;

  for (let j = 0; j <= segments; j++) {
    for (let i = 0; i <= segments; i++) {
      const u = (i / segments - 0.5) * 2 * extent;
      const v = (j / segments - 0.5) * 2 * extent;
      surfaceAt(u, v, point);
      surfaceAt(u + step, v, du).sub(point);
      surfaceAt(u, v + step, dv).sub(point);
      normal.crossVectors(du, dv).normalize();
      positions.push(point.x, point.y, point.z);
      normals.push(normal.x, normal.y, normal.z);
      const skull = headRadius(point.x, point.y, point.z);
      const tip = bumpAt(u * skull, v * skull) / NOSE.height;
      paint(point, color).lerp(tipTint, 0.22 * tip);
      colors.push(color.r, color.g, color.b);
    }
  }
  const row = segments + 1;
  for (let j = 0; j < segments; j++) {
    for (let i = 0; i < segments; i++) {
      const a = j * row + i;
      indices.push(a, a + 1, a + row, a + 1, a + row + 1, a + row);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  return geometry;
}
