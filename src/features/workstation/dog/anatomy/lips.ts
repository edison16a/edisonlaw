import { Vector3 } from 'three';
import type { Vec3 } from '../../layout';
import { PART_COUNT } from '../dimensions';
import { Field } from '../sdf/field';
import { FACE, headForms, lowerJaw, upperLips } from './head';

/**
 * The line of the closed mouth, in head space: the crease where the upper lips meet the chin, found on
 * the sculpted head, from the corner of the mouth on the dog's right round under the nose to the corner
 * on its left, where it lifts a little into a smile. A thin dark lip is laid along it.
 */

/** Angles round the chin, from straight ahead toward its left, at which the crease is found. */
const SWEEP = [0, 14, 28, 42, 56, 70, 84, 98, 110];
/** How far up and back each corner lifts past the end of the crease, in metres. */
const SMILE = { lift: 0.006, back: 0.009 } as const;
/**
 * How far the line stands out of the crease: the coat's triangles bridge a little across the hollow of
 * the crease, and the line must ride over them rather than dip in and out of sight.
 */
const STAND_OUT = 0.0012;

/** Where, going from under the chin up its side at `sweep` degrees, the surface stops being chin and starts being lip. */
function creaseAt(head: Field, lips: Field, chin: Field, sweep: number) {
  const [, cy, cz] = FACE.chin.center;
  const core = new Vector3(0, cy + 0.012, cz);
  const out = new Vector3(Math.sin((sweep * Math.PI) / 180), 0, Math.cos((sweep * Math.PI) / 180));
  const point = new Vector3();
  const direction = new Vector3();
  /** Surface point along the ray at `tilt` radians from straight down, and which of the two it belongs to. */
  const probe = (tilt: number) => {
    direction.set(0, -Math.cos(tilt), 0).addScaledVector(out, Math.sin(tilt));
    point.copy(core).addScaledVector(direction, 0.08);
    for (let i = 0; i < 200; i++) {
      const d = head.distance(point.x, point.y, point.z);
      if (Math.abs(d) < 1e-7) break;
      point.addScaledVector(direction, -d * 0.9);
    }
    return lips.distance(point.x, point.y, point.z) - chin.distance(point.x, point.y, point.z);
  };
  // Under the chin the chin is nearer; up the side the lips are. Halve the gap between the two.
  let low = 0;
  let high = Math.PI * 0.6;
  for (let i = 0; i < 40; i++) {
    const mid = (low + high) / 2;
    if (probe(mid) > 0) low = mid;
    else high = mid;
  }
  probe((low + high) / 2);
  // Out of the crease along the ray, which halves the angle between the chin and the lip.
  return point.clone().addScaledVector(direction, STAND_OUT);
}

/** The point on the left side of the head at height `y` and depth `z`, found by coming in from outside. */
function onSide(field: Field, y: number, z: number) {
  const point = new Vector3(0.12, y, z);
  for (let i = 0; i < 200; i++) {
    const d = field.distance(point.x, point.y, point.z);
    if (Math.abs(d) < 1e-7) break;
    point.x -= d * 0.9;
  }
  return point;
}

export function lipLine(): Vec3[] {
  const head = new Field(headForms(), PART_COUNT);
  const lips = new Field(upperLips(), PART_COUNT);
  const chin = new Field(lowerJaw().slice(-1), PART_COUNT);
  const left = SWEEP.map((sweep) => creaseAt(head, lips, chin, sweep));
  const corner = left[left.length - 1];
  const smile = onSide(head, corner.y + SMILE.lift, corner.z - SMILE.back).add(new Vector3(STAND_OUT, 0, 0));
  const side = [...left, smile];
  const mirror = (p: Vector3): Vec3 => [-p.x, p.y, p.z];
  return [...side.slice(1).reverse().map(mirror), ...side.map((p): Vec3 => [p.x, p.y, p.z])];
}
