import type { Field } from './field';
import type { Bounds } from './primitives';

/**
 * Turns a distance field into a smooth closed triangle mesh with surface nets.
 * The grid is split into blocks and only blocks the surface passes through are evaluated, each with
 * just the shapes that can reach it, so a fine grid stays cheap. Vertices are then pulled exactly onto
 * the surface and shaded with the field's own gradient, so the result is smooth at any cell size that
 * resolves the thinnest feature.
 */

export interface SurfaceMesh {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
  /** For each vertex, the shapes that can affect the field around it, for sampling attributes cheaply. */
  shapesAt: Int32Array[];
}

export interface MeshOptions {
  /** Edge length of one grid cell, in metres. Features thinner than about two cells get lost. */
  cell: number;
  /** Region to mesh. Defaults to the field's own bounds plus a margin. */
  bounds?: Bounds;
}

/** Cells along one edge of a block. */
const BLOCK = 4;
const CORNERS = BLOCK + 1;
/** How much faster than the point moves a distance may change: the ellipsoid bound is not exact. */
const LIPSCHITZ_SLACK = 1.15;

/** The eight corners of a cell as offsets along X, Y and Z, and the twelve edges between them. */
const CORNER_U = Int8Array.from([0, 1, 0, 1, 0, 1, 0, 1]);
const CORNER_V = Int8Array.from([0, 0, 1, 1, 0, 0, 1, 1]);
const CORNER_W = Int8Array.from([0, 0, 0, 0, 1, 1, 1, 1]);
const EDGE_A = Int8Array.from([0, 2, 4, 6, 0, 1, 4, 5, 0, 1, 2, 3]);
const EDGE_B = Int8Array.from([1, 3, 5, 7, 2, 3, 6, 7, 4, 5, 6, 7]);

/** Tetrahedron directions for four sample gradients, as X, Y, Z triples. */
const TETRA = Int8Array.from([1, -1, -1, -1, -1, 1, -1, 1, -1, 1, 1, 1]);

interface Block {
  /** Shapes that can affect this block, in field order. */
  shapes: Int32Array;
  corners: Float32Array;
  /** Vertex index for each cell, or -1. */
  cells: Int32Array;
}

export function meshField(field: Field, { cell, bounds }: MeshOptions): SurfaceMesh {
  const pad = cell * 3 + field.maxBlend;
  const box = bounds ?? field.bounds();
  const origin = [box[0] - pad, box[1] - pad, box[2] - pad];
  const blockSize = cell * BLOCK;
  const blockCounts = [0, 1, 2].map((k) => Math.max(1, Math.ceil((box[k + 3] + pad - origin[k]) / blockSize)));
  const [bx, by, bz] = blockCounts;
  const blockIndex = (i: number, j: number, k: number) => (k * by + j) * bx + i;

  // Shapes whose padded box overlaps each block. Far outside a shape's box its distance is larger than
  // its blend radius plus the margin, so it cannot change the surface there.
  const margin = blockSize * Math.sqrt(3) + cell * 2 + field.maxBlend;
  const lists: number[][] = [];
  field.shapes.forEach((shape, index) => {
    const reach = shape.blend + margin;
    const b = shape.primitive.bounds;
    const lo = [0, 1, 2].map((k) => Math.max(0, Math.floor((b[k] - reach - origin[k]) / blockSize)));
    const hi = [0, 1, 2].map((k) => Math.min(blockCounts[k] - 1, Math.floor((b[k + 3] + reach - origin[k]) / blockSize)));
    for (let k = lo[2]; k <= hi[2]; k++)
      for (let j = lo[1]; j <= hi[1]; j++)
        for (let i = lo[0]; i <= hi[0]; i++) (lists[blockIndex(i, j, k)] ??= []).push(index);
  });

  // Evaluate the corners of blocks the surface might cross. Blocks are visited in order, so a corner on a
  // face shared with an earlier block is copied from it rather than evaluated again.
  const blocks: (Block | undefined)[] = new Array(bx * by * bz);
  const evaluated: (Float32Array | undefined)[] = new Array(bx * by * bz);
  const halfDiagonal = (blockSize * Math.sqrt(3)) / 2;
  for (let k = 0; k < bz; k++)
    for (let j = 0; j < by; j++)
      for (let i = 0; i < bx; i++) {
        const index = blockIndex(i, j, k);
        const list = lists[index];
        if (!list || field.shapes[list[0]].carve) continue;
        const cx = origin[0] + (i + 0.5) * blockSize;
        const cy = origin[1] + (j + 0.5) * blockSize;
        const cz = origin[2] + (k + 0.5) * blockSize;
        // Vertices may drift up to a cell out of their block while they settle onto the surface.
        const shapes = field.cull(list, cx, cy, cz, halfDiagonal + cell);
        if (shapes.length === 0 || field.shapes[shapes[0]].carve) continue;
        // Distances grow about as fast as the point moves, and the bound never overstates depth inside, so
        // a block this far from the surface holds none of it.
        if (Math.abs(field.bound(cx, cy, cz, shapes)) > halfDiagonal * LIPSCHITZ_SLACK + cell * 0.25) continue;
        const west = i > 0 ? evaluated[index - 1] : undefined;
        const south = j > 0 ? evaluated[index - bx] : undefined;
        const below = k > 0 ? evaluated[index - bx * by] : undefined;
        const corners = new Float32Array(CORNERS ** 3);
        let inside = 0;
        for (let c = 0, w = 0; w < CORNERS; w++)
          for (let v = 0; v < CORNERS; v++)
            for (let u = 0; u < CORNERS; u++, c++) {
              let value: number;
              if (u === 0 && west) value = west[c + BLOCK];
              else if (v === 0 && south) value = south[c + BLOCK * CORNERS];
              else if (w === 0 && below) value = below[c + BLOCK * CORNERS * CORNERS];
              else value = field.distance(origin[0] + (i * BLOCK + u) * cell, origin[1] + (j * BLOCK + v) * cell, origin[2] + (k * BLOCK + w) * cell, shapes);
              corners[c] = value;
              if (value < 0) inside++;
            }
        evaluated[index] = corners;
        if (inside === 0 || inside === corners.length) continue;
        blocks[index] = { shapes, corners, cells: new Int32Array(BLOCK ** 3).fill(-1) };
      }

  // One vertex per cell the surface crosses, at the mean of its edge crossings.
  const positions: number[] = [];
  const vertexBlock: number[] = [];
  const values = new Float64Array(8);
  const cornerAt = (block: Block, u: number, v: number, w: number) => block.corners[(w * CORNERS + v) * CORNERS + u];
  blocks.forEach((block, index) => {
    if (!block) return;
    const i0 = (index % bx) * BLOCK;
    const j0 = (Math.floor(index / bx) % by) * BLOCK;
    const k0 = Math.floor(index / (bx * by)) * BLOCK;
    for (let w = 0; w < BLOCK; w++)
      for (let v = 0; v < BLOCK; v++)
        for (let u = 0; u < BLOCK; u++) {
          let mask = 0;
          for (let c = 0; c < 8; c++) {
            values[c] = cornerAt(block, u + CORNER_U[c], v + CORNER_V[c], w + CORNER_W[c]);
            if (values[c] < 0) mask |= 1 << c;
          }
          if (mask === 0 || mask === 255) continue;
          let sx = 0;
          let sy = 0;
          let sz = 0;
          let crossings = 0;
          for (let e = 0; e < 12; e++) {
            const a = EDGE_A[e];
            const b = EDGE_B[e];
            const va = values[a];
            const vb = values[b];
            if (va < 0 === vb < 0) continue;
            const t = va / (va - vb);
            sx += CORNER_U[a] + (CORNER_U[b] - CORNER_U[a]) * t;
            sy += CORNER_V[a] + (CORNER_V[b] - CORNER_V[a]) * t;
            sz += CORNER_W[a] + (CORNER_W[b] - CORNER_W[a]) * t;
            crossings++;
          }
          block.cells[(w * BLOCK + v) * BLOCK + u] = positions.length / 3;
          positions.push(
            origin[0] + (i0 + u + sx / crossings) * cell,
            origin[1] + (j0 + v + sy / crossings) * cell,
            origin[2] + (k0 + w + sz / crossings) * cell,
          );
          vertexBlock.push(index);
        }
  });

  const vertexAt = (i: number, j: number, k: number) => {
    if (i < 0 || j < 0 || k < 0) return -1;
    const block = blocks[blockIndex(Math.floor(i / BLOCK), Math.floor(j / BLOCK), Math.floor(k / BLOCK))];
    if (!block) return -1;
    return block.cells[((k % BLOCK) * BLOCK + (j % BLOCK)) * BLOCK + (i % BLOCK)];
  };

  // A quad around every grid edge the surface crosses, joining the four cells that share the edge.
  const quads: number[] = [];
  blocks.forEach((block, index) => {
    if (!block) return;
    const i0 = (index % bx) * BLOCK;
    const j0 = (Math.floor(index / bx) % by) * BLOCK;
    const k0 = Math.floor(index / (bx * by)) * BLOCK;
    for (let w = 0; w < BLOCK; w++)
      for (let v = 0; v < BLOCK; v++)
        for (let u = 0; u < BLOCK; u++) {
          if (block.cells[(w * BLOCK + v) * BLOCK + u] < 0) continue;
          const d0 = cornerAt(block, u, v, w);
          const i = i0 + u;
          const j = j0 + v;
          const k = k0 + w;
          // Edge along X: cells around it vary in Y and Z.
          const dx = cornerAt(block, u + 1, v, w);
          if (d0 < 0 !== dx < 0) addQuad(quads, d0 < 0, vertexAt(i, j - 1, k - 1), vertexAt(i, j, k - 1), vertexAt(i, j, k), vertexAt(i, j - 1, k));
          const dy = cornerAt(block, u, v + 1, w);
          if (d0 < 0 !== dy < 0) addQuad(quads, d0 < 0, vertexAt(i - 1, j, k - 1), vertexAt(i - 1, j, k), vertexAt(i, j, k), vertexAt(i, j, k - 1));
          const dz = cornerAt(block, u, v, w + 1);
          if (d0 < 0 !== dz < 0) addQuad(quads, d0 < 0, vertexAt(i - 1, j - 1, k), vertexAt(i, j - 1, k), vertexAt(i, j, k), vertexAt(i - 1, j, k));
        }
  });

  const vertexCount = positions.length / 3;
  const finalPositions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const eps = cell * 0.2;
  const gradient = [0, 0, 0];
  /** Samples four points around (x, y, z): returns their mean distance and leaves the gradient in `gradient`. */
  const sampleGradient = (x: number, y: number, z: number, shapes: Int32Array) => {
    gradient[0] = gradient[1] = gradient[2] = 0;
    let mean = 0;
    for (let t = 0; t < 12; t += 3) {
      const value = field.distance(x + TETRA[t] * eps, y + TETRA[t + 1] * eps, z + TETRA[t + 2] * eps, shapes);
      mean += value / 4;
      gradient[0] += (TETRA[t] * value) / (4 * eps);
      gradient[1] += (TETRA[t + 1] * value) / (4 * eps);
      gradient[2] += (TETRA[t + 2] * value) / (4 * eps);
    }
    return mean;
  };

  for (let n = 0; n < vertexCount; n++) {
    const shapes = (blocks[vertexBlock[n]] as Block).shapes;
    let x = positions[n * 3];
    let y = positions[n * 3 + 1];
    let z = positions[n * 3 + 2];
    // Newton steps onto the zero set along the gradient, never more than a cell.
    for (let step = 0; step < 3; step++) {
      const value = sampleGradient(x, y, z, shapes);
      const length2 = gradient[0] ** 2 + gradient[1] ** 2 + gradient[2] ** 2;
      if (step === 2 || length2 < 1e-20 || Math.abs(value) < cell * 1e-3) break;
      const scale = value / length2;
      let mx = -gradient[0] * scale;
      let my = -gradient[1] * scale;
      let mz = -gradient[2] * scale;
      const move = Math.sqrt(mx * mx + my * my + mz * mz);
      if (move > cell) {
        mx *= cell / move;
        my *= cell / move;
        mz *= cell / move;
      }
      x += mx;
      y += my;
      z += mz;
    }
    const length = Math.sqrt(gradient[0] ** 2 + gradient[1] ** 2 + gradient[2] ** 2) || 1;
    finalPositions[n * 3] = x;
    finalPositions[n * 3 + 1] = y;
    finalPositions[n * 3 + 2] = z;
    normals[n * 3] = gradient[0] / length;
    normals[n * 3 + 1] = gradient[1] / length;
    normals[n * 3 + 2] = gradient[2] / length;
  }

  const shapesAt = vertexBlock.map((index) => (blocks[index] as Block).shapes);
  const indices = weld(triangulate(quads, finalPositions), finalPositions, cell * WELD);
  return { positions: finalPositions, normals, indices, shapesAt };
}

/** Vertices closer than this share of a cell have settled onto the same spot. */
const WELD = 0.15;

/**
 * Joins vertices that settled onto the same spot and drops the triangles folded flat between them.
 * Where the surface runs along a grid face, the vertices of the cells on both sides of it land together,
 * and the quads round that face would otherwise meet in a pinch. The joined vertex keeps the index of
 * one of them; the other is left unused.
 */
function weld(indices: Uint32Array, positions: Float32Array, tolerance: number) {
  const parent = Int32Array.from({ length: positions.length / 3 }, (_, i) => i);
  const find = (i: number): number => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  };
  const limit = tolerance * tolerance;
  for (let t = 0; t < indices.length; t += 3) {
    for (let e = 0; e < 3; e++) {
      const a = indices[t + e];
      const b = indices[t + ((e + 1) % 3)];
      const dx = positions[a * 3] - positions[b * 3];
      const dy = positions[a * 3 + 1] - positions[b * 3 + 1];
      const dz = positions[a * 3 + 2] - positions[b * 3 + 2];
      if (dx * dx + dy * dy + dz * dz < limit) parent[find(a)] = find(b);
    }
  }
  const kept: number[] = [];
  for (let t = 0; t < indices.length; t += 3) {
    const a = find(indices[t]);
    const b = find(indices[t + 1]);
    const c = find(indices[t + 2]);
    if (a !== b && b !== c && c !== a) kept.push(a, b, c);
  }
  return Uint32Array.from(kept);
}

/** Stores a quad wound so its front faces out of the solid. */
function addQuad(quads: number[], outwardPositive: boolean, a: number, b: number, c: number, d: number) {
  if (a < 0 || b < 0 || c < 0 || d < 0) return;
  if (outwardPositive) quads.push(a, b, c, d);
  else quads.push(a, d, c, b);
}

/** Splits each quad along its shorter diagonal. */
function triangulate(quads: number[], positions: Float32Array) {
  const indices = new Uint32Array((quads.length / 4) * 6);
  const distance2 = (p: number, q: number) =>
    (positions[p * 3] - positions[q * 3]) ** 2 +
    (positions[p * 3 + 1] - positions[q * 3 + 1]) ** 2 +
    (positions[p * 3 + 2] - positions[q * 3 + 2]) ** 2;
  for (let q = 0, t = 0; q < quads.length; q += 4, t += 6) {
    const [a, b, c, d] = [quads[q], quads[q + 1], quads[q + 2], quads[q + 3]];
    if (distance2(a, c) <= distance2(b, d)) indices.set([a, b, c, a, c, d], t);
    else indices.set([a, b, d, b, c, d], t);
  }
  return indices;
}
