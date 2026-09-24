import { BufferGeometry, Float32BufferAttribute } from 'three';

interface LeafOptions {
  length: number;
  width: number;
  /** Total bend along the leaf in radians. Positive arches the tip outward and down. */
  curl: number;
  /** Depth of the V fold along the midrib, as a share of the width. */
  fold?: number;
  segments?: number;
}

/**
 * A paddle-shaped leaf that rises from its base along +Y and arches toward +Z,
 * with a soft fold down the middle so it catches light like a real leaf.
 */
export function createLeafGeometry({ length, width, curl, fold = 0.22, segments = 14 }: LeafOptions) {
  const across = 6;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  let y = 0;
  let z = 0;
  const step = length / segments;
  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    const angle = curl * u * u;
    if (i > 0) {
      y += Math.cos(angle) * step;
      z += Math.sin(angle) * step;
    }
    // Wide belly, narrow stem, pointed tip.
    const halfWidth = (width / 2) * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.75)), 0.85);
    for (let j = 0; j <= across; j++) {
      const v = (j / across) * 2 - 1;
      const lift = Math.abs(v) * halfWidth * fold * 2;
      // Offset the fold along the bent normal so it stays perpendicular to the leaf.
      positions.push(v * halfWidth, y - Math.sin(angle) * lift, z + Math.cos(angle) * lift);
      uvs.push(j / across, u);
    }
  }

  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < across; j++) {
      const a = i * (across + 1) + j;
      const b = a + across + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
