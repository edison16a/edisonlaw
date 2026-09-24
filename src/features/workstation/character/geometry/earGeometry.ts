import { Color, Float32BufferAttribute, SphereGeometry } from 'three';
import { PALETTE } from '../materials';

const skin = new Color(PALETTE.skin);
const inner = new Color(PALETTE.skinShade).lerp(new Color(PALETTE.blush), 0.35);

/**
 * A small cupped ear. Local frame: +Z points away from the head, +Y up, +X toward the face.
 * The outer face is pressed in to make the bowl, which is painted a little warmer.
 */
export function earGeometry() {
  const geometry = new SphereGeometry(1, 28, 20);
  const positions = geometry.getAttribute('position');
  const colors = new Float32Array(positions.count * 3);
  const color = new Color();
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i) * 0.03;
    const y = positions.getY(i) * 0.041;
    let z = positions.getZ(i) * 0.017;
    const bowl = Math.exp(-((x / 0.017) ** 2 + ((y + 0.002) / 0.025) ** 2));
    if (z > 0) z *= 1 - 0.8 * bowl;
    positions.setXYZ(i, x, y, z);
    color.copy(skin).lerp(inner, z > 0 ? bowl * 0.8 : 0);
    colors.set([color.r, color.g, color.b], i * 3);
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}
