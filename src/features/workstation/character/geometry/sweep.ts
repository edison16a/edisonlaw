import { BufferGeometry, Float32BufferAttribute, Vector3, type Curve } from 'three';

export interface SweepProfile {
  /** Rings along the path. */
  segments: number;
  /** Vertices around each ring. */
  radialSegments: number;
  /** Half width across the stroke at `s` in [0, 1]. Zero at an end closes it into a soft tip. */
  width: (s: number) => number;
  /** Half thickness away from the surface at `s`. */
  thickness: (s: number) => number;
  /** Outward direction near `point`. The flat face of the section lies against it. */
  normalAt: (point: Vector3, out: Vector3) => Vector3;
  /** 1 keeps an elliptical section, lower values flatten the side facing the surface. */
  underside?: number;
  /** Extra roll of the section around the path at `s`, in radians. */
  twist?: (s: number) => number;
}

const point = new Vector3();
const tangent = new Vector3();
const normal = new Vector3();
const binormal = new Vector3();
const rolledNormal = new Vector3();

/**
 * Sweeps a flattened, tapering section along a curve. Used for hair locks, brows and the mouth:
 * shapes that hug the head and end in rounded tips.
 */
export function sweepGeometry(curve: Curve<Vector3>, profile: SweepProfile) {
  const { segments, radialSegments, width, thickness, normalAt, underside = 1, twist } = profile;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= segments; i++) {
    const s = i / segments;
    curve.getPointAt(s, point);
    curve.getTangentAt(s, tangent);
    normalAt(point, normal);
    normal.addScaledVector(tangent, -normal.dot(tangent)).normalize();
    binormal.crossVectors(tangent, normal);
    if (twist) {
      const angle = twist(s);
      rolledNormal.copy(normal).multiplyScalar(Math.cos(angle)).addScaledVector(binormal, Math.sin(angle));
      binormal.crossVectors(tangent, rolledNormal);
      normal.copy(rolledNormal);
    }
    const halfWidth = width(s);
    const halfThickness = thickness(s);
    for (let j = 0; j < radialSegments; j++) {
      const angle = (j / radialSegments) * Math.PI * 2;
      const across = Math.cos(angle) * halfWidth;
      const sine = Math.sin(angle);
      const up = sine * halfThickness * (sine < 0 ? underside : 1);
      positions.push(
        point.x + binormal.x * across + normal.x * up,
        point.y + binormal.y * across + normal.y * up,
        point.z + binormal.z * across + normal.z * up,
      );
    }
  }

  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * radialSegments + j;
      const b = i * radialSegments + ((j + 1) % radialSegments);
      const c = a + radialSegments;
      const d = b + radialSegments;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** Width profile that swells from a buried root to its widest at `peak`, then closes in a round tip. */
export function lockTaper(peak = 0.35, tipRoundness = 0.5) {
  return (s: number) => {
    if (s <= peak) return 0.55 + 0.45 * Math.sin((s / peak) * Math.PI * 0.5);
    const u = (s - peak) / (1 - peak);
    return Math.pow(Math.max(0, 1 - Math.pow(u, 2 + tipRoundness * 2)), 0.5 + tipRoundness * 0.3) * (1 - u * 0.25);
  };
}

/** Width profile for small strokes: round caps at both ends. */
export function strokeTaper(capLength = 0.2) {
  return (s: number) => {
    const edge = Math.min(s, 1 - s) / capLength;
    return edge >= 1 ? 1 : Math.sqrt(Math.max(0, 1 - (1 - edge) ** 2));
  };
}
