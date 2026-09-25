import { Vector3 } from 'three';
import { HAND } from '../dimensions';
import { aimRotation, jointFor, type LimbGoal } from './limbs';
import { STANDING_TARGETS } from './targets';
import { createOccurrence, occurrence, smootherstep, type Recurring } from './timeline';

const TIMING = {
  /** Strokes come in unhurried bouts with a quiet rest between them. */
  bout: { period: 8.5, duration: 6.6, ease: 0.9 },
  /** While resting, the fingers now and then give a little scratch. */
  scratch: { period: 4.6, duration: 1.4, ease: 0.25, chance: 0.65 },
} satisfies Record<string, Recurring>;

/** Seconds per stroke, back over the head and forward again. */
const STROKE_PERIOD = 1.8;
/** How far the palm slides each way from the pat point, in metres. */
const STROKE_REACH = 0.024;
/** Radius of the dome the palm rides over on the dog's crown. */
const HEAD_CURVE = 0.1;
/** The palm sinks this far into the fur, so it never floats above it. */
const PRESS = 0.0015;
/**
 * The palm meets the head on the side of its crown nearest him, where the surface leans his way by
 * this much, in radians. The dog is sculpted to match (its HEAD.contactLean).
 */
const LEAN = 0.3;

/** Middle of the palm's skin in the hand bone's space, the point that rests on the head. */
const PALM = new Vector3(0, -HAND.palmLength * 0.56, -0.0156);
const UP = new Vector3(0, 1, 0);
const { pat: PAT, dogHeading: HEADING } = STANDING_TARGETS;
/** Out of the back of the hand at the pat point: up, leaning toward him. */
const NORMAL = UP.clone()
  .multiplyScalar(Math.cos(LEAN))
  .addScaledVector(new Vector3(-PAT.x, 0, -PAT.z).normalize(), Math.sin(LEAN))
  .normalize();
/**
 * Fingers reach over the crown toward the dog's brow, turned this far toward his own front, in radians,
 * so the hand runs on from his forearm. Each stroke pushes the other way, toward the dog's neck.
 */
const FINGER_TURN = 0.45;
const FINGERS = HEADING.clone().applyAxisAngle(UP, -FINGER_TURN).projectOnPlane(NORMAL).normalize();
const BACK = FINGERS.clone().negate();
/** Centre of the dome that touches the pat point there. */
const DOME = PAT.clone().addScaledVector(NORMAL, -HEAD_CURVE);

const bout = createOccurrence();
const scratch = createOccurrence();
const normal = new Vector3();
const along = new Vector3();
const contact = new Vector3();

/** What the petting hand is doing this frame, for the fingers and the rest of the body. */
export interface Petting {
  /** -1 to 1, where the palm is along the stroke: negative toward the dog's brow, positive toward its neck. */
  stroke: number;
  /** -1 to 1, which way the palm is moving: positive while it pushes back toward the neck. */
  push: number;
  /** 0 to 1, a scratch of the fingertips while the hand rests. */
  scratch: number;
}

export const createPetting = (): Petting => ({ stroke: 0, push: 0, scratch: 0 });

/**
 * Left hand on the dog's head, stroking from its brow back toward its neck and forward again. The palm
 * rides a dome through the pat point, pressed a hair into the fur and tilted to match the curve, so it
 * never floats or sinks, while the fingers curl over the crown. `motion` 0 rests it on the pat point.
 */
export function pettingHand(t: number, motion: number, seed: number, out: LimbGoal, state: Petting) {
  const strokes = occurrence(t, TIMING.bout, seed, bout).weight * motion;
  const phase = (t / STROKE_PERIOD) * Math.PI * 2 + 0.5 * Math.sin(t * 0.41 + seed);
  state.stroke = Math.sin(phase) * strokes;
  state.push = Math.cos(phase) * strokes;
  const resting = occurrence(t, TIMING.scratch, seed + 3, scratch).weight * motion * (1 - smootherstep(0, 0.4, strokes));
  state.scratch = resting * (0.5 + 0.5 * Math.sin(t * 19));

  // Where on the dome the palm is, and the dome's outward normal there.
  const angle = (state.stroke * STROKE_REACH) / HEAD_CURVE;
  normal.copy(NORMAL).multiplyScalar(Math.cos(angle)).addScaledVector(BACK, Math.sin(angle));
  contact.copy(DOME).addScaledVector(normal, HEAD_CURVE - PRESS);

  // Back of the hand along the normal, fingers laid along the surface toward the brow.
  along.copy(FINGERS).addScaledVector(normal, -FINGERS.dot(normal)).normalize();
  aimRotation(along, normal, out.rotation);
  jointFor(contact, out.rotation, PALM, out.target);
  // The sitting dog's head is at his waist, so the upper arm hangs down by his side and the elbow bends
  // down and a little back, with the forearm reaching out across to the head.
  out.pole.set(0.2, -1, -0.5);
}

/** Finger curls while petting: curled over the crown, pressing a touch on the push, scratching at rest. */
export function pettingFingers(state: Petting, out: [number, number, number, number]) {
  const drape = 0.42 + 0.08 * state.push + 0.3 * state.scratch;
  out[0] = drape - 0.02;
  out[1] = drape;
  out[2] = drape + 0.02;
  out[3] = drape + 0.06;
}
