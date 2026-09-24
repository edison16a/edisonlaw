import { Matrix4, Vector3 } from 'three';

/**
 * Signed distance primitives for sculpting the dog: negative inside, positive outside, in metres.
 * Each primitive packs its constants into a few numbers so a field can store every shape in one typed
 * array and evaluate them in a tight loop (see ./field.ts), which matters because the mesher asks for
 * millions of distances.
 */

/** Axis aligned box as min x, y, z then max x, y, z. */
export type Bounds = [number, number, number, number, number, number];

export type Vec3Like = readonly [number, number, number];

export const KIND = { sphere: 0, ellipsoid: 1, roundCone: 2 } as const;
export type Kind = (typeof KIND)[keyof typeof KIND];

/** Numbers stored per primitive in a packed program. */
export const STRIDE = 18;

export interface Primitive {
  readonly kind: Kind;
  /** Constants for the packed evaluator, at most STRIDE of them. */
  readonly params: readonly number[];
  /** Box around the solid. */
  readonly bounds: Bounds;
  /** A copy moved by a similarity transform: rotation, translation and a uniform scale. */
  transformed(matrix: Matrix4): Primitive;
}

const scratch = new Vector3();

function transformPoint(point: Vec3Like, matrix: Matrix4): [number, number, number] {
  scratch.set(point[0], point[1], point[2]).applyMatrix4(matrix);
  return [scratch.x, scratch.y, scratch.z];
}

/** Distance to a packed primitive of `kind` whose constants start at `o` in `p`. */
export function packedDistance(kind: number, p: Float64Array, o: number, x: number, y: number, z: number) {
  if (kind === KIND.sphere) {
    const dx = x - p[o];
    const dy = y - p[o + 1];
    const dz = z - p[o + 2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz) - p[o + 3];
  }
  if (kind === KIND.ellipsoid) {
    // Inigo Quilez's ellipsoid bound: exact on the surface and close to it nearby.
    const dx = x - p[o];
    const dy = y - p[o + 1];
    const dz = z - p[o + 2];
    const lx = dx * p[o + 3] + dy * p[o + 4] + dz * p[o + 5];
    const ly = dx * p[o + 6] + dy * p[o + 7] + dz * p[o + 8];
    const lz = dx * p[o + 9] + dy * p[o + 10] + dz * p[o + 11];
    const ax = lx * p[o + 12];
    const ay = ly * p[o + 13];
    const az = lz * p[o + 14];
    const bx = lx * p[o + 15];
    const by = ly * p[o + 16];
    const bz = lz * p[o + 17];
    const k0 = Math.sqrt(ax * ax + ay * ay + az * az);
    const k1 = Math.sqrt(bx * bx + by * by + bz * bz);
    return k1 < 1e-12 ? -1 / Math.max(p[o + 12], p[o + 13], p[o + 14]) : (k0 * (k0 - 1)) / k1;
  }
  // Round cone, after Inigo Quilez: exact.
  const pax = x - p[o];
  const pay = y - p[o + 1];
  const paz = z - p[o + 2];
  const bax = p[o + 3];
  const bay = p[o + 4];
  const baz = p[o + 5];
  const l2 = p[o + 6];
  const rr = p[o + 7];
  const a2 = p[o + 8];
  const il2 = p[o + 9];
  const along = pax * bax + pay * bay + paz * baz;
  const beyond = along - l2;
  const qx = pax * l2 - bax * along;
  const qy = pay * l2 - bay * along;
  const qz = paz * l2 - baz * along;
  const x2 = qx * qx + qy * qy + qz * qz;
  const y2 = along * along * l2;
  const z2 = beyond * beyond * l2;
  const k = (rr < 0 ? -1 : rr > 0 ? 1 : 0) * rr * rr * x2;
  if ((beyond < 0 ? -1 : 1) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - p[o + 11];
  if ((along < 0 ? -1 : along > 0 ? 1 : 0) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - p[o + 10];
  return (Math.sqrt(x2 * a2 * il2) + along * rr) * il2 - p[o + 10];
}

export class Sphere implements Primitive {
  readonly kind = KIND.sphere;
  readonly params: number[];
  readonly bounds: Bounds;

  constructor(
    readonly center: Vec3Like,
    readonly radius: number,
  ) {
    this.params = [...center, radius];
    this.bounds = [center[0] - radius, center[1] - radius, center[2] - radius, center[0] + radius, center[1] + radius, center[2] + radius];
  }

  transformed(matrix: Matrix4) {
    return new Sphere(transformPoint(this.center, matrix), this.radius * matrix.getMaxScaleOnAxis());
  }
}

type Basis = readonly [Vec3Like, Vec3Like, Vec3Like];

const IDENTITY_BASIS: Basis = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

/** Ellipsoid with its own orientation. */
export class Ellipsoid implements Primitive {
  readonly kind = KIND.ellipsoid;
  readonly params: number[];
  readonly bounds: Bounds;

  constructor(
    readonly center: Vec3Like,
    readonly radii: Vec3Like,
    /** Local X, Y and Z axes in the parent space, unit length and orthogonal. */
    readonly basis: Basis = IDENTITY_BASIS,
  ) {
    const inv = radii.map((r) => 1 / r);
    this.params = [...center, ...basis[0], ...basis[1], ...basis[2], ...inv, ...inv.map((v) => v * v)];
    const half = [0, 1, 2].map((k) => Math.hypot(radii[0] * basis[0][k], radii[1] * basis[1][k], radii[2] * basis[2][k]));
    this.bounds = [center[0] - half[0], center[1] - half[1], center[2] - half[2], center[0] + half[0], center[1] + half[1], center[2] + half[2]];
  }

  transformed(matrix: Matrix4) {
    const rotation = new Matrix4().extractRotation(matrix);
    const basis = this.basis.map((axis) => {
      scratch.set(axis[0], axis[1], axis[2]).applyMatrix4(rotation);
      return [scratch.x, scratch.y, scratch.z] as const;
    });
    const scale = matrix.getMaxScaleOnAxis();
    const radii = [this.radii[0] * scale, this.radii[1] * scale, this.radii[2] * scale] as const;
    return new Ellipsoid(transformPoint(this.center, matrix), radii, [basis[0], basis[1], basis[2]]);
  }
}

/** Two spheres joined by a smoothly tapering cone: a capsule with a different radius at each end. */
export class RoundCone implements Primitive {
  readonly kind = KIND.roundCone;
  readonly params: number[];
  readonly bounds: Bounds;

  constructor(
    readonly a: Vec3Like,
    readonly b: Vec3Like,
    readonly ra: number,
    readonly rb: number,
  ) {
    const ba = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const l2 = Math.max(1e-12, ba[0] ** 2 + ba[1] ** 2 + ba[2] ** 2);
    const rr = ra - rb;
    this.params = [...a, ...ba, l2, rr, l2 - rr * rr, 1 / l2, ra, rb];
    this.bounds = [
      Math.min(a[0] - ra, b[0] - rb),
      Math.min(a[1] - ra, b[1] - rb),
      Math.min(a[2] - ra, b[2] - rb),
      Math.max(a[0] + ra, b[0] + rb),
      Math.max(a[1] + ra, b[1] + rb),
      Math.max(a[2] + ra, b[2] + rb),
    ];
  }

  transformed(matrix: Matrix4) {
    const scale = matrix.getMaxScaleOnAxis();
    return new RoundCone(transformPoint(this.a, matrix), transformPoint(this.b, matrix), this.ra * scale, this.rb * scale);
  }
}

/** Orthonormal basis whose local Y runs along `up` and whose local Z leans toward `forward`. */
export function basisFrom(up: Vec3Like, forward: Vec3Like): Basis {
  const y = new Vector3(...up).normalize();
  const z = new Vector3(...forward);
  z.addScaledVector(y, -z.dot(y)).normalize();
  const x = new Vector3().crossVectors(y, z);
  return [
    [x.x, x.y, x.z],
    [y.x, y.y, y.z],
    [z.x, z.y, z.z],
  ];
}
