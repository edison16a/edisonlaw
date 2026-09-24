import { BoxGeometry, BufferGeometry, CylinderGeometry, ExtrudeGeometry, Float32BufferAttribute, Path, RingGeometry } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { lerp } from '@/lib/math';
import { roundedRectShape } from '../../geometry/shapes';

/** Outer size and thickness of a 120 class fan, in metres. */
export const FAN_SIZE = 0.114;
export const FAN_DEPTH = 0.025;
const HOLE_RADIUS = FAN_SIZE * 0.45;
const HUB_RADIUS = 0.019;
const FRAME_BEVEL = 0.0015;
const BLADE_COUNT = 9;

/** Merges parts into one non indexed geometry and frees the parts. */
function merge(parts: BufferGeometry[]) {
  const flat = parts.map((part) => (part.index ? part.toNonIndexed() : part));
  const merged = mergeGeometries(flat);
  new Set([...parts, ...flat]).forEach((part) => part.dispose());
  if (!merged) throw new Error('Fan parts could not be merged');
  return merged;
}

/**
 * Square frame with softened edges and a round opening, facing +Z, plus the motor housing and its four
 * struts across the back of the opening.
 */
export function createFanFrameGeometry() {
  const shape = roundedRectShape(FAN_SIZE - FRAME_BEVEL * 2, FAN_SIZE - FRAME_BEVEL * 2, 0.011);
  const hole = new Path();
  // The bevel closes the hole in by its size, so it is cut that much wider.
  hole.absarc(0, 0, HOLE_RADIUS + FRAME_BEVEL, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const frame = new ExtrudeGeometry(shape, {
    depth: FAN_DEPTH - FRAME_BEVEL * 2,
    bevelEnabled: true,
    bevelThickness: FRAME_BEVEL,
    bevelSize: FRAME_BEVEL,
    bevelSegments: 2,
    curveSegments: 40,
  });
  frame.translate(0, 0, -(FAN_DEPTH - FRAME_BEVEL * 2) / 2);
  frame.deleteAttribute('uv');

  const backZ = -FAN_DEPTH / 2 + 0.004;
  const motor = new CylinderGeometry(HUB_RADIUS * 0.92, HUB_RADIUS * 0.92, 0.006, 32);
  motor.rotateX(Math.PI / 2);
  motor.translate(0, 0, backZ);
  motor.deleteAttribute('uv');

  const strutLength = HOLE_RADIUS + 0.002 - HUB_RADIUS * 0.8;
  const struts = [0, 1, 2, 3].map((index) => {
    const strut = new BoxGeometry(strutLength, 0.003, 0.004);
    strut.translate(HUB_RADIUS * 0.8 + strutLength / 2, 0, backZ);
    strut.rotateZ(Math.PI / 4 + (index * Math.PI) / 2);
    strut.deleteAttribute('uv');
    return strut;
  });
  return merge([frame, motor, ...struts]);
}

/**
 * All blades of one rotor as a single open surface: each blade sweeps back as it reaches out,
 * is pitched steeply at the root and flatter at the tip, and has a little camber. Render both sides.
 */
export function createFanBladesGeometry() {
  const rootRadius = HUB_RADIUS - 0.0008;
  const tipRadius = HOLE_RADIUS - 0.0022;
  const radial = 7;
  const chord = 5;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let blade = 0; blade < BLADE_COUNT; blade++) {
    const start = positions.length / 3;
    const base = (blade / BLADE_COUNT) * Math.PI * 2;
    for (let i = 0; i <= radial; i++) {
      const u = i / radial;
      const radius = lerp(rootRadius, tipRadius, u);
      const span = lerp(0.36, 0.5, u);
      const sweep = 0.38 * u * u;
      const axial = lerp(0.0125, 0.0075, u);
      for (let j = 0; j <= chord; j++) {
        const v = j / chord;
        const angle = base + sweep + (v - 0.5) * span;
        const z = (0.5 - v) * axial + Math.sin(v * Math.PI) * 0.0012;
        positions.push(radius * Math.cos(angle), radius * Math.sin(angle), z);
      }
    }
    for (let i = 0; i < radial; i++) {
      for (let j = 0; j < chord; j++) {
        const a = start + i * (chord + 1) + j;
        const b = a + chord + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** Flat light ring on the front face of the frame, around the opening. */
export function createFanRingGeometry() {
  const geometry = new RingGeometry(HOLE_RADIUS + FRAME_BEVEL + 0.0006, HOLE_RADIUS + FRAME_BEVEL + 0.0036, 64, 1);
  geometry.translate(0, 0, FAN_DEPTH / 2 + 0.0003);
  return geometry;
}

/** Hub cap in front of the blades, its flat face along +Z. */
export function createFanHubGeometry() {
  const geometry = new CylinderGeometry(HUB_RADIUS, HUB_RADIUS, 0.012, 32);
  geometry.rotateX(Math.PI / 2);
  geometry.translate(0, 0, 0.001);
  return geometry;
}
