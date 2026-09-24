import { CatmullRomCurve3, Float32BufferAttribute, Vector3, type BufferGeometry } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { anglesOf, headRadius, surfacePoint } from './headShape';
import { hairOffsetAt, hairToneAt } from './hairShape';
import { lockTaper, sweepGeometry } from './sweep';

/** A chunky lock of hair laid over the cap, described on his left side and mirrored to the right. */
interface Lock {
  /** Root to tip: crown angle, turn angle, extra lift in metres over the cap surface. */
  path: [number, number, number][];
  /** Half width and half thickness at the widest point. */
  width: number;
  thickness: number;
  /** Where along the lock it is widest, 0 to 1. */
  peak: number;
}

/**
 * Curtain bangs: each side falls from the centre part over the forehead and sweeps out to the temple,
 * with a second layer outside it and a side piece running down in front of the ear.
 */
const LOCKS: Lock[] = [
  {
    path: [
      [8, 2.5, -0.008],
      [28, 5, -0.002],
      [47, 10, 0],
      [60, 18, -0.002],
      [69, 30, -0.006],
      [74, 42, -0.012],
    ],
    width: 0.027,
    thickness: 0.0105,
    peak: 0.4,
  },
  {
    path: [
      [16, 12, -0.008],
      [36, 19, -0.002],
      [54, 29, 0],
      [67, 42, -0.004],
      [78, 54, -0.01],
    ],
    width: 0.026,
    thickness: 0.01,
    peak: 0.45,
  },
  {
    path: [
      [30, 40, -0.008],
      [52, 53, -0.002],
      [72, 63, -0.002],
      [92, 70, -0.008],
    ],
    width: 0.021,
    thickness: 0.0085,
    peak: 0.4,
  },
];

const outward = (point: Vector3, out: Vector3) => out.copy(point).normalize();

/** A point on the cap surface (plus `extra`) at the given angles, so locks rest on the hair beneath. */
function onCap(thetaDeg: number, phiDeg: number, extra: number, halfThickness: number) {
  const point = surfacePoint(thetaDeg, phiDeg);
  const offset = hairOffsetAt(thetaDeg, phiDeg, point.x, point.y, point.z);
  const direction = point.clone().normalize();
  return direction.multiplyScalar(headRadius(direction.x, direction.y, direction.z) + offset + halfThickness * 0.45 + extra);
}

function lockGeometry(lock: Lock, side: number) {
  const curve = new CatmullRomCurve3(
    lock.path.map(([theta, phi, extra]) => onCap(theta, side * phi, extra, lock.thickness)),
    false,
    'centripetal',
  );
  const taper = lockTaper(lock.peak, 0.55);
  const geometry = sweepGeometry(curve, {
    segments: 48,
    radialSegments: 18,
    width: (s) => lock.width * taper(s),
    thickness: (s) => lock.thickness * taper(s),
    normalAt: outward,
    underside: 0.55,
  });
  paintTone(geometry);
  return geometry;
}

function paintTone(geometry: BufferGeometry) {
  const positions = geometry.getAttribute('position');
  const colors = new Float32Array(positions.count * 3);
  const point = new Vector3();
  for (let i = 0; i < positions.count; i++) {
    const [theta] = anglesOf(point.fromBufferAttribute(positions, i));
    colors.fill(hairToneAt(theta, 0, 0), i * 3, i * 3 + 3);
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
}

/** Every lock on both sides as one mesh, centred on the head centre. */
export function hairLocksGeometry() {
  const parts = LOCKS.flatMap((lock) => [lockGeometry(lock, 1), lockGeometry(lock, -1)]);
  const merged = mergeGeometries(parts);
  for (const part of parts) part.dispose();
  return merged;
}
