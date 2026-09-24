import { BufferGeometry, Float32BufferAttribute } from 'three';

/** One horizontal section of a lofted body shape. */
export interface LoftRing {
  y: number;
  /** Half width along X. */
  x: number;
  /** Depth from the centre line toward the front (+Z). */
  front: number;
  /** Depth from the centre line toward the back (-Z). */
  back: number;
  /** Moves the section along Z. */
  z?: number;
}

interface LoftOptions {
  radialSegments?: number;
  /** 2 is an ellipse, higher values square the section off a little, like a torso. */
  squareness?: number;
  /** Closes the bottom ring with a point. */
  capBottom?: boolean;
  /** Closes the top ring with a point. */
  capTop?: boolean;
  /** Sections per span between the given rings, interpolated smoothly. 1 keeps the rings as given. */
  smooth?: number;
}

const signedPow = (value: number, power: number) => Math.sign(value) * Math.abs(value) ** power;

/**
 * Tangents for a monotone cubic through evenly spaced samples (Fritsch and Carlson): smooth, and never
 * swinging past its neighbours, so a smoothed body never bulges out between two sections.
 */
function monotoneTangents(values: number[]) {
  const count = values.length;
  const slopes = values.slice(1).map((value, i) => value - values[i]);
  const tangents = values.map((_, i) => {
    if (i === 0) return slopes[0];
    if (i === count - 1) return slopes[count - 2];
    return slopes[i - 1] * slopes[i] <= 0 ? 0 : (slopes[i - 1] + slopes[i]) / 2;
  });
  slopes.forEach((slope, i) => {
    if (slope === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
      return;
    }
    const a = tangents[i] / slope;
    const b = tangents[i + 1] / slope;
    const length = Math.hypot(a, b);
    if (length > 3) {
      tangents[i] = (3 / length) * a * slope;
      tangents[i + 1] = (3 / length) * b * slope;
    }
  });
  return tangents;
}

const RING_KEYS = ['y', 'x', 'front', 'back', 'z'] as const;

/** Inserts `steps - 1` smoothly interpolated sections between each pair of rings. */
function refineRings(rings: LoftRing[], steps: number): LoftRing[] {
  const curves = RING_KEYS.map((key) => {
    const values = rings.map((ring) => ring[key] ?? 0);
    return { key, values, tangents: monotoneTangents(values) };
  });
  const refined: LoftRing[] = [];
  for (let i = 0; i < rings.length - 1; i++) {
    for (let step = 0; step < steps; step++) {
      const t = step / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      const ring: LoftRing = { y: 0, x: 0, front: 0, back: 0 };
      for (const { key, values, tangents } of curves) {
        ring[key] =
          (2 * t3 - 3 * t2 + 1) * values[i] + (t3 - 2 * t2 + t) * tangents[i] + (-2 * t3 + 3 * t2) * values[i + 1] + (t3 - t2) * tangents[i + 1];
      }
      refined.push(ring);
    }
  }
  refined.push({ ...rings[rings.length - 1] });
  return refined;
}

/**
 * Builds a smooth tube through horizontal sections, listed bottom to top.
 * UVs run around the body with the front at u = 0.5 (the seam is at the back) and up the height in v.
 */
export function loftGeometry(sections: LoftRing[], { radialSegments = 64, squareness = 2, capBottom = false, capTop = false, smooth = 1 }: LoftOptions = {}) {
  const rings = smooth > 1 ? refineRings(sections, smooth) : sections;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const columns = radialSegments + 1;
  const minY = rings[0].y;
  const spanY = rings[rings.length - 1].y - minY || 1;
  const exponent = 2 / squareness;

  rings.forEach((ring, row) => {
    for (let j = 0; j <= radialSegments; j++) {
      const angle = -Math.PI + (j / radialSegments) * Math.PI * 2;
      const sin = signedPow(Math.sin(angle), exponent);
      const cos = signedPow(Math.cos(angle), exponent);
      positions.push(sin * ring.x, ring.y, (ring.z ?? 0) + cos * (cos >= 0 ? ring.front : ring.back));
      uvs.push(j / radialSegments, (ring.y - minY) / spanY);
    }
    if (row === 0) return;
    for (let j = 0; j < radialSegments; j++) {
      const a = (row - 1) * columns + j;
      const b = a + 1;
      const c = a + columns;
      const d = c + 1;
      indices.push(a, b, c, b, d, c);
    }
  });

  const addCap = (row: number, top: boolean) => {
    const ring = rings[row];
    const center = positions.length / 3;
    positions.push(0, ring.y + (top ? 0.001 : -0.001), ring.z ?? 0);
    uvs.push(0.5, top ? 1 : 0);
    for (let j = 0; j < radialSegments; j++) {
      const a = row * columns + j;
      if (top) indices.push(a, a + 1, center);
      else indices.push(a + 1, a, center);
    }
  };
  if (capBottom) addCap(0, false);
  if (capTop) addCap(rings.length - 1, true);

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  weldSeamNormals(geometry, rings.length, columns);
  return geometry;
}

/** The first and last column share positions at the back seam, give them one averaged normal. */
function weldSeamNormals(geometry: BufferGeometry, rows: number, columns: number) {
  const normals = geometry.getAttribute('normal');
  for (let row = 0; row < rows; row++) {
    const first = row * columns;
    const last = first + columns - 1;
    const x = normals.getX(first) + normals.getX(last);
    const y = normals.getY(first) + normals.getY(last);
    const z = normals.getZ(first) + normals.getZ(last);
    const length = Math.hypot(x, y, z) || 1;
    normals.setXYZ(first, x / length, y / length, z / length);
    normals.setXYZ(last, x / length, y / length, z / length);
  }
  normals.needsUpdate = true;
}
