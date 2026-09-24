import { Color, Euler, Float32BufferAttribute, Matrix4, Quaternion, SphereGeometry, Vector3 } from 'three';
import { PALETTE } from '../materials';
import { surfaceFrame } from './headShape';

const skin = new Color(PALETTE.skin);
const inner = new Color(PALETTE.skinShade).lerp(new Color(PALETTE.blush), 0.35);

/** Ears sit a little below eye level, turned slightly forward and tipped back. */
const EAR = { theta: 102, phi: 91, lift: -0.006, flare: 0.32, tilt: 0.2 } as const;

/**
 * A small cupped ear. Local frame: +Z points away from the head, +Y up.
 * The outer face is pressed in to make the bowl, which is painted a little warmer.
 */
function cuppedEar() {
  const geometry = new SphereGeometry(1, 24, 16);
  geometry.deleteAttribute('uv');
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

/** An ear already placed on the skull, in head centre space. `side` 1 is his left. */
export function earGeometry(side: 1 | -1) {
  const { position, quaternion } = surfaceFrame(EAR.theta, side * EAR.phi, EAR.lift);
  // The ear's local X points forward on his right and backward on his left, hence the side sign.
  quaternion.multiply(new Quaternion().setFromEuler(new Euler(0, -side * EAR.flare, -side * EAR.tilt)));
  return cuppedEar().applyMatrix4(new Matrix4().compose(position, quaternion, new Vector3(1, 1, 1)));
}
