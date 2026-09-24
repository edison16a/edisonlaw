import { BoxGeometry, CylinderGeometry, ExtrudeGeometry, Path, TorusGeometry, type BufferGeometry } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { roundedRectShape } from '../../geometry/shapes';

/** Outer size of a fan frame, in metres. */
export const FAN_SIZE = 0.116;
export const FAN_DEPTH = 0.012;
const FAN_RING_RADIUS = FAN_SIZE * 0.44;
const BLADE_COUNT = 7;

/** Square frame with a round opening, facing +Z. */
export function createFanFrameGeometry() {
  const shape = roundedRectShape(FAN_SIZE, FAN_SIZE, 0.01);
  const hole = new Path();
  hole.absarc(0, 0, FAN_RING_RADIUS - 0.002, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const geometry = new ExtrudeGeometry(shape, { depth: FAN_DEPTH, bevelEnabled: false, curveSegments: 24 });
  geometry.translate(0, 0, -FAN_DEPTH / 2);
  return geometry;
}

/** All blades of one rotor merged into a single mesh, pitched like a real fan. */
export function createFanBladesGeometry() {
  const length = FAN_RING_RADIUS - 0.022;
  const blades: BufferGeometry[] = [];
  for (let i = 0; i < BLADE_COUNT; i++) {
    const blade = new BoxGeometry(length, 0.019, 0.0014);
    blade.rotateX(0.55);
    blade.translate(0.018 + length / 2, 0, 0);
    blade.rotateZ((i / BLADE_COUNT) * Math.PI * 2);
    blades.push(blade);
  }
  const merged = mergeGeometries(blades) ?? blades[0];
  blades.forEach((blade) => blade !== merged && blade.dispose());
  return merged;
}

/** Glowing ring just inside the frame opening. */
export function createFanRingGeometry() {
  return new TorusGeometry(FAN_RING_RADIUS, 0.0032, 8, 48);
}

/** Hub cap, turned so its flat face points along +Z like the rest of the fan. */
export function createFanHubGeometry() {
  const geometry = new CylinderGeometry(0.017, 0.017, 0.008, 24);
  geometry.rotateX(Math.PI / 2);
  return geometry;
}
