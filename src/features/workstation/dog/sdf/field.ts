import type { Matrix4 } from 'three';
import { packedBound, packedDistance, STRIDE as PACKED_STRIDE, type Bounds, type Primitive } from './primitives';

// Local copies for the hot loops: some bundlers read imported bindings through getters.
const STRIDE = PACKED_STRIDE;
const evaluate = packedDistance;
const evaluateBound = packedBound;

/**
 * A sculpture as an ordered list of shapes. Each shape is smoothly added to everything listed
 * before it, or carved out of it, like pressing clay onto a form. Carves come last.
 */
export interface Shape {
  primitive: Primitive;
  /** Radius of the soft fillet where this shape meets the ones before it. 0 is a hard union. */
  blend: number;
  /** Carves the shape out instead of adding it. */
  carve?: boolean;
  /** Coat lightness where this shape shows: 0 deep gold, 1 cream. */
  tone: number;
  /** Which bone group the shape belongs to, for skinning. */
  part: number;
}

/** Surface attributes blended across shapes the same way their distances are. */
export interface FieldSample {
  distance: number;
  tone: number;
  /** Share of each part at this point, summing to 1. */
  parts: Float32Array;
}

export const createFieldSample = (partCount: number): FieldSample => ({ distance: 0, tone: 0, parts: new Float32Array(partCount) });

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);

/** Smooth union of the accumulated distance `d` with a new shape at `di`. */
function unite(d: number, di: number, k: number) {
  if (d === Infinity) return di;
  if (k <= 0) return d < di ? d : di;
  const keep = clamp01(0.5 + (0.5 * (di - d)) / k);
  return di + (d - di) * keep - k * keep * (1 - keep);
}

/** Smooth subtraction of a shape at `di` from the accumulated distance `d`. */
function cut(d: number, di: number, k: number) {
  if (k <= 0) return d > -di ? d : -di;
  const h = clamp01(0.5 - (0.5 * (d + di)) / k);
  return d + (-di - d) * h + k * h * (1 - h);
}

/** Growth rate allowed for distances when bounding them over a region; the ellipsoid bound is not exact. */
const LIPSCHITZ = 1.3;

export class Field {
  readonly shapes: readonly Shape[];
  readonly partCount: number;
  /** Largest blend radius, how far one shape can reach into its neighbours. */
  readonly maxBlend: number;
  private readonly kinds: Uint8Array;
  private readonly program: Float64Array;
  private readonly blends: Float64Array;
  private readonly carves: Uint8Array;
  private readonly all: Int32Array;

  constructor(shapes: readonly Shape[], partCount: number) {
    const firstCarve = shapes.findIndex((shape) => shape.carve);
    if (firstCarve !== -1 && shapes.slice(firstCarve).some((shape) => !shape.carve)) {
      throw new Error('Carved shapes must come after every added shape.');
    }
    if (shapes.length === 0 || shapes[0].carve) throw new Error('A field needs an added shape first.');
    this.shapes = shapes;
    this.partCount = partCount;
    this.maxBlend = shapes.reduce((max, shape) => Math.max(max, shape.blend), 0);
    this.kinds = Uint8Array.from(shapes, (shape) => shape.primitive.kind);
    this.program = new Float64Array(shapes.length * STRIDE);
    shapes.forEach((shape, index) => this.program.set(shape.primitive.params, index * STRIDE));
    this.blends = Float64Array.from(shapes, (shape) => shape.blend);
    this.carves = Uint8Array.from(shapes, (shape) => (shape.carve ? 1 : 0));
    this.all = Int32Array.from(shapes.keys());
  }

  /** Distance from one shape alone. */
  shapeDistance(index: number, x: number, y: number, z: number) {
    return evaluate(this.kinds[index], this.program, index * STRIDE, x, y, z);
  }

  /** Signed distance at a point, from the shapes in `list` only (all of them by default). */
  distance(x: number, y: number, z: number, list: ArrayLike<number> = this.all) {
    const { kinds, program, blends, carves } = this;
    let d = Infinity;
    for (let i = 0; i < list.length; i++) {
      const s = list[i];
      const di = evaluate(kinds[s], program, s * STRIDE, x, y, z);
      d = carves[s] ? cut(d, di, blends[s]) : unite(d, di, blends[s]);
    }
    return d;
  }

  /**
   * The field at a point from the shapes in `list` (all by default), never deeper inside than it really
   * is, so it is safe for deciding that a region holds no surface. Outside it equals `distance`.
   */
  bound(x: number, y: number, z: number, list: ArrayLike<number> = this.all) {
    const { kinds, program, blends, carves } = this;
    let d = Infinity;
    for (let i = 0; i < list.length; i++) {
      const s = list[i];
      const di = evaluateBound(kinds[s], program, s * STRIDE, x, y, z);
      d = carves[s] ? cut(d, di, blends[s]) : unite(d, di, blends[s]);
    }
    return d;
  }

  /** Distance plus blended tone and part shares at a point, from the shapes in `list` (all by default). */
  sample(x: number, y: number, z: number, out: FieldSample, list: ArrayLike<number> = this.all) {
    let d = Infinity;
    out.tone = 0;
    out.parts.fill(0);
    for (let i = 0; i < list.length; i++) {
      const s = list[i];
      const di = this.shapeDistance(s, x, y, z);
      const k = this.blends[s];
      if (this.carves[s]) {
        d = cut(d, di, k);
        continue;
      }
      // Share kept by what was there before this shape.
      const keep = d === Infinity ? 0 : k <= 0 ? (di < d ? 0 : 1) : clamp01(0.5 + (0.5 * (di - d)) / k);
      d = unite(d, di, k);
      const shape = this.shapes[s];
      out.tone = shape.tone + (out.tone - shape.tone) * keep;
      for (let p = 0; p < out.parts.length; p++) out.parts[p] *= keep;
      out.parts[shape.part] += 1 - keep;
    }
    out.distance = d;
    return out;
  }

  /**
   * The shapes in `candidates` that can change the field anywhere within `radius` of a point.
   * An added shape does nothing where it is at least its blend radius further away than every shape
   * before it, because a smooth union leaves the nearer value untouched there. Carves only matter
   * where they come within their blend radius of the surface or reach inside.
   */
  cull(candidates: ArrayLike<number>, x: number, y: number, z: number, radius: number) {
    const reach = radius * LIPSCHITZ;
    const kept: number[] = [];
    let nearest = Infinity;
    let deepest = Infinity;
    for (let i = 0; i < candidates.length; i++) {
      const s = candidates[i];
      // Depths inside a shape are only trusted as far as they surely go.
      const di = evaluateBound(this.kinds[s], this.program, s * STRIDE, x, y, z);
      if (this.carves[s]) {
        // Deep inside, the union can sink to the nearest shape's depth plus the reach and the widest blend,
        // so a carve must come within that of the point to matter.
        if (di - reach < this.blends[s] + Math.max(0, -(deepest - reach)) + this.maxBlend) kept.push(s);
        continue;
      }
      if (di - reach < nearest + reach + this.blends[s]) kept.push(s);
      nearest = Math.min(nearest, di);
      deepest = Math.min(deepest, di);
    }
    return Int32Array.from(kept);
  }

  /** Box around every added shape. */
  bounds(): Bounds {
    const box: Bounds = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
    for (const shape of this.shapes) {
      if (shape.carve) continue;
      const b = shape.primitive.bounds;
      for (let k = 0; k < 3; k++) {
        box[k] = Math.min(box[k], b[k]);
        box[k + 3] = Math.max(box[k + 3], b[k + 3]);
      }
    }
    return box;
  }
}

/** Moves every shape by a similarity transform (uniform scale allowed), keeping tones and parts. */
export function transformShapes(shapes: readonly Shape[], matrix: Matrix4): Shape[] {
  const scale = matrix.getMaxScaleOnAxis();
  return shapes.map((shape) => ({ ...shape, primitive: shape.primitive.transformed(matrix), blend: shape.blend * scale }));
}
