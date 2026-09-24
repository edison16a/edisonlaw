import { CatmullRomCurve3, Vector3 } from 'three';
import type { Vec3 } from '../../layout';
import type { Shape } from '../sdf/field';
import { basisFrom, Ellipsoid, RoundCone, Sphere, type Vec3Like } from '../sdf/primitives';

/** Shorthands for writing the dog's recipes: every shape carries its blend, tone and part. */

export interface Finish {
  blend: number;
  tone: number;
  part: number;
}

export const ellipsoid = (center: Vec3Like, radii: Vec3Like, finish: Finish, up?: Vec3Like, forward: Vec3Like = [0, 0, 1]): Shape => ({
  primitive: new Ellipsoid(center, radii, up ? basisFrom(up, forward) : undefined),
  ...finish,
});

export const cone = (a: Vec3Like, b: Vec3Like, ra: number, rb: number, finish: Finish): Shape => ({
  primitive: new RoundCone(a, b, ra, rb),
  ...finish,
});

export const ball = (center: Vec3Like, radius: number, finish: Finish): Shape => ({ primitive: new Sphere(center, radius), ...finish });

/** Cuts a shape made with one of the helpers above out of the sculpture, with a soft edge of `blend`. */
export const carve = (shape: Shape, blend: number): Shape => ({ ...shape, blend, carve: true });

/** Finish for carved shapes, whose tone and part do not matter. */
export const CUT: Finish = { blend: 0, tone: 0, part: 0 };

/** Runs a recipe for the left side (+1) and the right side (-1). */
export const bothSides = (build: (side: 1 | -1) => Shape[]) => [...build(1), ...build(-1)];

/** A point with its X scaled by `side`. */
export const sided = ([x, y, z]: Vec3Like, side: number): Vec3 => [x * side, y, z];

export interface FlatLockSpec {
  /** Root to tip, through the middle of the lock. */
  path: Vec3Like[];
  /** Half width at the widest point, a third of the way along. */
  width: number;
  /** Thickness as a share of the width. */
  flatness: number;
  /** Which way the flat face of the lock looks, usually straight out of the body. */
  facing: Vec3Like;
  /** Tone at the root and at the tip. */
  tones: [number, number];
  /** How softly the root melts into the coat below. */
  blend: number;
  part: number;
  segments?: number;
}

/**
 * A broad, flat lock of fur like a sculpted hair lock: it widens a little past its root, lies along
 * its path with its flat face turned out, and closes in a soft round tip. Overlapping ellipsoids melt
 * into one smooth ribbon.
 */
export function flatLock({ path, width, flatness, facing, tones, blend, part, segments = 6 }: FlatLockSpec): Shape[] {
  const curve = new CatmullRomCurve3(
    path.map(([x, y, z]) => new Vector3(x, y, z)),
    false,
    'centripetal',
  );
  const halfLength = (curve.getLength() / segments) * 0.8;
  const face = new Vector3(...facing).normalize();
  const center = new Vector3();
  const tangent = new Vector3();
  const up = new Vector3();
  // Swells to full width a third of the way along, then rounds off toward the tip.
  const profile = (s: number) =>
    s < 0.35 ? 0.72 + 0.28 * Math.sin((s / 0.35) * Math.PI * 0.5) : Math.sqrt(Math.max(0.12, 1 - ((s - 0.35) / 0.65) ** 2.4));
  const shapes: Shape[] = [];
  for (let i = 0; i < segments; i++) {
    const s = (i + 0.5) / segments;
    curve.getPointAt(s, center);
    curve.getTangentAt(s, tangent);
    up.copy(face).addScaledVector(tangent, -face.dot(tangent)).normalize();
    const w = width * profile(s);
    // The root melts into the coat; further along, each piece only softens into its neighbours.
    const finish = { blend: i === 0 ? blend : Math.min(blend, w * 0.6), tone: tones[0] + (tones[1] - tones[0]) * s ** 1.4, part };
    shapes.push(ellipsoid(center.toArray(), [w, w * flatness, halfLength], finish, up.toArray(), tangent.toArray()));
  }
  return shapes;
}
