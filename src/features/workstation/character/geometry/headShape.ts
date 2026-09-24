import { Matrix4, Quaternion, Vector3 } from 'three';

/**
 * The skull as a radius per direction from the head centre, so the head, the hair and the face
 * features all sit on exactly the same surface.
 * Angles: `theta` is measured down from the crown (+Y), `phi` around from the face (+Z) toward his left (+X).
 */

/** Semi axes of the base ellipsoid: a wide, soft, slightly squashed chibi skull. */
const SKULL = { x: 0.206, y: 0.197, z: 0.19 } as const;

const DEG = Math.PI / 180;

interface Sculpt {
  direction: Vector3;
  /** Relative radius change at the centre of the bump. */
  amount: number;
  /** Angular falloff, larger is broader. */
  spread: number;
}

const sculpt = (x: number, y: number, z: number, amount: number, spread: number): Sculpt => ({
  direction: new Vector3(x, y, z).normalize(),
  amount,
  spread,
});

/** Soft bumps and dents on the ellipsoid: fuller cheeks, a narrower rounded jaw and a round back. */
const SCULPTS: Sculpt[] = [
  sculpt(0.78, -0.62, 0.05, -0.085, 0.16),
  sculpt(-0.78, -0.62, 0.05, -0.085, 0.16),
  sculpt(0.45, -0.42, 0.78, 0.035, 0.07),
  sculpt(-0.45, -0.42, 0.78, 0.035, 0.07),
  sculpt(0, -0.72, 0.7, -0.035, 0.1),
  sculpt(0, -1, 0, -0.06, 0.25),
  sculpt(0, 0.15, -1, 0.035, 0.3),
  sculpt(0, -0.75, -0.66, -0.05, 0.08),
  sculpt(0, 0.35, 0.94, -0.02, 0.12),
];

export function headRadius(dx: number, dy: number, dz: number) {
  const base = 1 / Math.sqrt((dx * dx) / SKULL.x ** 2 + (dy * dy) / SKULL.y ** 2 + (dz * dz) / SKULL.z ** 2);
  let scale = 1;
  for (const { direction, amount, spread } of SCULPTS) {
    const cos = dx * direction.x + dy * direction.y + dz * direction.z;
    scale += amount * Math.exp((cos - 1) / spread);
  }
  return base * scale;
}

/** Unit direction for crown angle `theta` and turn angle `phi`, both in radians. */
function directionAt(theta: number, phi: number, out = new Vector3()) {
  const sinTheta = Math.sin(theta);
  return out.set(sinTheta * Math.sin(phi), Math.cos(theta), sinTheta * Math.cos(phi));
}

/** Point on the skull (plus `lift` outward) for angles given in degrees. */
export function surfacePoint(thetaDeg: number, phiDeg: number, lift = 0, out = new Vector3()) {
  directionAt(thetaDeg * DEG, phiDeg * DEG, out);
  return out.multiplyScalar(headRadius(out.x, out.y, out.z) + lift);
}

const probeA = new Vector3();
const probeB = new Vector3();
const probeC = new Vector3();

/** Outward surface normal of the skull at angles given in degrees, found numerically. */
function surfaceNormal(thetaDeg: number, phiDeg: number, out = new Vector3()) {
  const step = 0.4;
  surfacePoint(thetaDeg, phiDeg, 0, probeA);
  surfacePoint(thetaDeg + step, phiDeg, 0, probeB).sub(probeA);
  surfacePoint(thetaDeg, phiDeg + step, 0, probeC).sub(probeA);
  out.crossVectors(probeB, probeC).normalize();
  // Near the crown the phi step collapses, fall back to the radial direction.
  if (!Number.isFinite(out.x) || out.lengthSq() < 0.5) directionAt(thetaDeg * DEG, phiDeg * DEG, out);
  return out;
}

const frameUp = new Vector3();
const frameSide = new Vector3();
const frameNormal = new Vector3();
const frameBasis = new Matrix4();

/**
 * Position and rotation for a feature stuck to the skull: local +Z along the surface normal,
 * local +Y as close to straight up as the surface allows.
 */
export function surfaceFrame(thetaDeg: number, phiDeg: number, lift: number) {
  const position = surfacePoint(thetaDeg, phiDeg, lift);
  surfaceNormal(thetaDeg, phiDeg, frameNormal);
  frameUp.set(0, 1, 0).addScaledVector(frameNormal, -frameNormal.y).normalize();
  frameSide.crossVectors(frameUp, frameNormal);
  frameBasis.makeBasis(frameSide, frameUp, frameNormal);
  return { position, quaternion: new Quaternion().setFromRotationMatrix(frameBasis) };
}

/** Crown and turn angles, in degrees, of the direction from the head centre to `point`. */
export function anglesOf(point: Vector3): [number, number] {
  const length = point.length();
  return [Math.acos(point.y / length) / DEG, Math.atan2(point.x, point.z) / DEG];
}
