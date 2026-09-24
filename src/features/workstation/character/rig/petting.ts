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
/** Radius of the dome the palm rides over on top of the dog's head. */
const HEAD_CURVE = 0.1;
/** The palm sinks this far into the fur, so it never floats above it. */
const PRESS = 0.0015;
/** Fingers point along the dog's head, turned this far out toward his left, in radians. */
const SPLAY = 0.32;
/** The hand cups over the crown: fingers tipped down toward the dog's brow, heel of the palm a little up. */
const CUP = 0.3;

/** Palm skin just behind the knuckles in the hand bone's space, the point that rests on the head. */
const PALM = new Vector3(0, -HAND.palmLength * 0.68, -0.0148);
const UP = new Vector3(0, 1, 0);
/** Backward along the dog, the way each stroke pushes. */
const BACK = STANDING_TARGETS.dogForward.clone().negate();
/** Where the fingers point: along the dog's head, splayed outward. */
const FINGERS = STANDING_TARGETS.dogForward.clone().applyAxisAngle(UP, SPLAY);
/** Centre of the dome whose top is the pat point. */
const DOME = STANDING_TARGETS.pat.clone().addScaledVector(UP, -HEAD_CURVE);

const bout = createOccurrence();
const scratch = createOccurrence();
const normal = new Vector3();
const along = new Vector3();
const facing = new Vector3();
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
 * Left hand on top of the dog's head, stroking back and forth. The palm rides a dome through the
 * pat point, pressed a hair into the fur and tilted to match the curve, so it never floats or sinks.
 * `motion` 0 leaves it resting still in the middle of the head.
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
  normal.copy(UP).multiplyScalar(Math.cos(angle)).addScaledVector(BACK, Math.sin(angle));
  contact.copy(DOME).addScaledVector(normal, HEAD_CURVE - PRESS);

  // Fingers along the surface, then the whole hand tipped forward over the curve.
  along.copy(FINGERS).addScaledVector(normal, -FINGERS.dot(normal)).normalize();
  facing.copy(normal).multiplyScalar(Math.cos(CUP)).addScaledVector(along, Math.sin(CUP));
  along.multiplyScalar(Math.cos(CUP)).addScaledVector(normal, -Math.sin(CUP));
  aimRotation(along, facing, out.rotation);
  jointFor(contact, out.rotation, PALM, out.target);
  // The elbow bends back and out to his side, so the forearm reaches forward to the head.
  out.pole.set(0.45, -0.1, -0.9);
}

/** Finger curls while petting: draped over the curve, pressing a touch on the push, scratching at rest. */
export function pettingFingers(state: Petting, out: [number, number, number, number]) {
  const drape = 0.16 + 0.07 * state.push + 0.35 * state.scratch;
  out[0] = drape - 0.02;
  out[1] = drape;
  out[2] = drape + 0.02;
  out[3] = drape + 0.06;
}
