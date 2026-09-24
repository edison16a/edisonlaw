import { LatheGeometry, Vector2 } from 'three';

/**
 * Capsule hanging down -Y from the origin, with a different radius at each end.
 * Both ends are hemispheres centred on the joints, so neighbouring limbs rotate without seams.
 */
export function taperedCapsule(topRadius: number, bottomRadius: number, length: number, radialSegments = 24) {
  const points: Vector2[] = [];
  const capSteps = 8;
  for (let i = 0; i <= capSteps; i++) {
    const angle = -Math.PI / 2 + (i / capSteps) * (Math.PI / 2);
    points.push(new Vector2(Math.cos(angle) * bottomRadius, -length + Math.sin(angle) * bottomRadius));
  }
  const bodySteps = 6;
  for (let i = 1; i < bodySteps; i++) {
    const t = i / bodySteps;
    points.push(new Vector2(bottomRadius + (topRadius - bottomRadius) * t, -length * (1 - t)));
  }
  for (let i = 0; i <= capSteps; i++) {
    const angle = (i / capSteps) * (Math.PI / 2);
    points.push(new Vector2(Math.max(1e-5, Math.cos(angle) * topRadius), Math.sin(angle) * topRadius));
  }
  return new LatheGeometry(points, radialSegments);
}

/**
 * A short sleeve or trouser cuff: a dome centred on the joint so it turns in place with the limb,
 * a slightly flared tube below it, and a rolled hem. `capHeight` below `radius` flattens the dome
 * along the limb, so a sleeve cap sits level with the shoulder instead of rising above it.
 */
export function sleeveGeometry(radius: number, length: number, flare = 1.04, radialSegments = 28, capHeight = radius) {
  const points: Vector2[] = [];
  const hemRadius = radius * flare;
  points.push(new Vector2(hemRadius * 0.86, -length + 0.004));
  points.push(new Vector2(hemRadius * 0.97, -length - 0.002));
  points.push(new Vector2(hemRadius, -length + 0.004));
  const bodySteps = 6;
  for (let i = 1; i <= bodySteps; i++) {
    const t = i / bodySteps;
    points.push(new Vector2(hemRadius + (radius - hemRadius) * t, -length + 0.004 + (length - 0.004) * t));
  }
  const domeSteps = 10;
  for (let i = 1; i <= domeSteps; i++) {
    const angle = (i / domeSteps) * (Math.PI / 2);
    points.push(new Vector2(Math.max(1e-5, Math.cos(angle) * radius), Math.sin(angle) * capHeight));
  }
  return new LatheGeometry(points, radialSegments);
}
