import { BufferGeometry, ExtrudeGeometry, Float32BufferAttribute } from 'three';
import { roundedPolygonShape } from '../../geometry/shapes';

export interface KeyboardCaseSize {
  width: number;
  depth: number;
  /** Height of the case at the edge nearest the typist. */
  frontHeight: number;
  /** Height at the back edge. The difference sets the typing angle. */
  backHeight: number;
  /** Radius of the rounding on every outer edge. */
  bevel: number;
}

/**
 * Wedge shaped case: a side profile that rises toward the back, extruded across the width with
 * rounded edges. Origin at the middle of the bottom face, X across, +Z toward the typist.
 */
export function createKeyboardCaseGeometry({ width, depth, frontHeight, backHeight, bevel }: KeyboardCaseSize) {
  const halfDepth = depth / 2 - bevel;
  // The bevel grows the profile by `bevel` on every side, so the profile is drawn that much smaller.
  const profile = roundedPolygonShape(
    [
      [halfDepth, bevel],
      [halfDepth, frontHeight - bevel],
      [-halfDepth, backHeight - bevel],
      [-halfDepth, bevel],
    ],
    [0.0015, 0.0035, 0.0035, 0.0015],
  );
  const geometry = new ExtrudeGeometry(profile, {
    depth: width - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 6,
  });
  // The profile lies in the extrusion's XY plane: turn it so the profile's X runs along Z and the
  // extrusion runs along X, then centre it across the width.
  geometry.rotateY(-Math.PI / 2);
  geometry.translate(width / 2 - bevel, 0, 0);
  geometry.computeVertexNormals();
  return geometry;
}

export interface KeycapShape {
  /** Width and depth of a 1u cap at its base. */
  size: number;
  height: number;
  /** How far each side leans in from the base to the top face. */
  taper: number;
  /** Corner radius at the base. */
  radius: number;
}

/** Rounded square ring at height `y`, inset from the base outline by `inset`. */
function pushRing(positions: number[], half: number, radius: number, inset: number, y: number, segments: number) {
  const h = half - inset;
  const r = Math.max(0.0006, Math.min(radius - inset * 0.4, h));
  const corners: [number, number][] = [
    [1, 1],
    [-1, 1],
    [-1, -1],
    [1, -1],
  ];
  corners.forEach(([sx, sz], corner) => {
    for (let s = 0; s <= segments; s++) {
      const angle = ((corner + s / segments) * Math.PI) / 2;
      positions.push(sx * (h - r) + r * Math.cos(angle), y, sz * (h - r) + r * Math.sin(angle));
    }
  });
}

/**
 * One 1u keycap centred on the origin: straight sides that lean in toward a softly rounded top,
 * open underneath. Wider keys reuse it and the shader pushes each half outward (see keycapMaterial),
 * so a space bar keeps the same taper and corners as a letter key instead of being stretched.
 */
export function createKeycapGeometry({ size, height, taper, radius }: KeycapShape) {
  const segments = 3;
  const ringSize = 4 * (segments + 1);
  const half = size / 2;
  // Height and inset of each ring from the base up: a crisp foot, the leaning wall, then the rounded lip.
  const rings: [number, number][] = [
    [0, 0],
    [0.12, taper * 0.1],
    [0.78, taper * 0.82],
    [0.92, taper + 0.0004],
    [0.985, taper + 0.0011],
    [1, taper + 0.0019],
  ];

  const positions: number[] = [];
  rings.forEach(([t, inset]) => pushRing(positions, half, radius, inset, t * height - height / 2, segments));
  const center = positions.length / 3;
  positions.push(0, height / 2 + 0.0002, 0);

  const indices: number[] = [];
  for (let ring = 0; ring < rings.length - 1; ring++) {
    for (let j = 0; j < ringSize; j++) {
      const a = ring * ringSize + j;
      const b = ring * ringSize + ((j + 1) % ringSize);
      const c = a + ringSize;
      const d = b + ringSize;
      indices.push(a, c, b, b, c, d);
    }
  }
  const top = (rings.length - 1) * ringSize;
  for (let j = 0; j < ringSize; j++) indices.push(top + j, center, top + ((j + 1) % ringSize));

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** Per vertex attribute of the halo: 1 under the cap, fading to 0 at the outer edge. */
export const HALO_ALPHA_ATTRIBUTE = 'haloAlpha';

/**
 * Flat pool of light under one 1u keycap, facing up: full strength under the cap and fading out
 * `spread` past its edge. Stretched for wide keys the same way as the caps.
 */
export function createKeyHaloGeometry({ size, radius, spread }: { size: number; radius: number; spread: number }) {
  const segments = 3;
  const ringSize = 4 * (segments + 1);
  const rings: [inset: number, alpha: number][] = [
    [0.0006, 1],
    [-spread * 0.3, 0.5],
    [-spread, 0],
  ];

  const positions: number[] = [];
  const alphas: number[] = [];
  rings.forEach(([inset, alpha]) => {
    pushRing(positions, size / 2, radius, inset, 0, segments);
    for (let j = 0; j < ringSize; j++) alphas.push(alpha);
  });
  const center = positions.length / 3;
  positions.push(0, 0, 0);
  alphas.push(1);

  const indices: number[] = [];
  for (let j = 0; j < ringSize; j++) indices.push(j, center, (j + 1) % ringSize);
  for (let ring = 0; ring < rings.length - 1; ring++) {
    for (let j = 0; j < ringSize; j++) {
      const a = ring * ringSize + j;
      const b = ring * ringSize + ((j + 1) % ringSize);
      indices.push(a, b, a + ringSize, b, b + ringSize, a + ringSize);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute(HALO_ALPHA_ATTRIBUTE, new Float32BufferAttribute(alphas, 1));
  geometry.setIndex(indices);
  return geometry;
}
