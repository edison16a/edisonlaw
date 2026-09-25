import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three';
import type { Vec3 } from '../../layout';

/** Thickness of the lip line at its middle, and how much of its length each end takes to taper away. */
const LIP = { radius: 0.0019, taper: 0.12 } as const;
const SEGMENTS = { along: 120, round: 10 } as const;

/** A tube along the line of the mouth that swells from nothing at each corner, lying in the crease. */
export function lipGeometry(line: Vec3[]) {
  const curve = new CatmullRomCurve3(
    line.map((point) => new Vector3(...point)),
    false,
    'centripetal',
  );
  const geometry = new TubeGeometry(curve, SEGMENTS.along, LIP.radius, SEGMENTS.round, false);
  const position = geometry.attributes.position;
  const center = new Vector3();
  const vertex = new Vector3();
  // TubeGeometry lays out one ring of round + 1 vertices per step along the curve.
  for (let ring = 0; ring <= SEGMENTS.along; ring++) {
    const t = ring / SEGMENTS.along;
    const end = Math.min(t, 1 - t) / LIP.taper;
    const scale = end >= 1 ? 1 : Math.sin((end * Math.PI) / 2);
    curve.getPointAt(t, center);
    for (let k = 0; k <= SEGMENTS.round; k++) {
      const index = ring * (SEGMENTS.round + 1) + k;
      vertex.fromBufferAttribute(position, index).sub(center).multiplyScalar(Math.max(scale, 0.05)).add(center);
      position.setXYZ(index, vertex.x, vertex.y, vertex.z);
    }
  }
  geometry.computeVertexNormals();
  return geometry;
}
