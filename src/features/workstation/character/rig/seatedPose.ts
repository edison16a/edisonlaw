import { Quaternion, Vector3 } from 'three';
import { lerp } from '@/lib/math';
import { BODY, HAND } from '../dimensions';
import type { BodyPose } from './bodyPose';
import { aimRotation, createLimbGoal, jointFor, type LimbGoal } from './limbs';
import { aimHead } from './look';
import { SEATED_TARGETS } from './targets';
import { breathAt, createOccurrence, noise, occurrence, type Recurring } from './timeline';
import { createKeystroke, keystrokeAt, type Keystroke } from './typing';
import type { LimbName, Side } from './types';

const TIMING = {
  /** Typing comes in long bursts with short pauses to think. */
  burst: { period: 7.5, duration: 5.8, ease: 0.45 },
  /** Now and then the right hand goes to the mouse. */
  mouse: { period: 15, duration: 4, ease: 0.6, chance: 0.85 },
  /** Eased glances at the side monitors. */
  glance: { period: 6.4, duration: 2.4, ease: 0.55, chance: 0.8 },
  click: { period: 0.9, duration: 0.18, ease: 0.06, chance: 0.55 },
} satisfies Record<string, Recurring>;

/** Hand and foot reference points, in their own bone's space. */
const KNUCKLES = new Vector3(0, -HAND.palmLength, 0);
const PALM = new Vector3(0, -HAND.palmLength * 0.55, -HAND.palmThickness * 0.5);
const SOLE_MIDDLE = new Vector3(0, -BODY.ankle, 0.046);
const Y_AXIS = new Vector3(0, 1, 0);

const burst = createOccurrence();
const mouse = createOccurrence();
const glance = createOccurrence();
const click = createOccurrence();
const strokes: Record<LimbName, Keystroke> = { left: createKeystroke(), right: createKeystroke() };
const typingGoal = createLimbGoal();
const mouseGoal = createLimbGoal();
const point = new Vector3();
const along = new Vector3();
const facing = new Vector3();
const footTurn = new Quaternion();

/** Hand hovering over the home row, knuckles up, fingers reaching down to the keys. */
function typingHand(side: Side, stroke: Keystroke, typing: number, out: LimbGoal) {
  const keys = SEATED_TARGETS.keyboard;
  point.set(
    keys.x + side * 0.072 + stroke.across * typing,
    keys.y + 0.037 - 0.005 * stroke.press * typing,
    keys.z - 0.03 + stroke.along * typing,
  );
  along.set(-side * 0.22, -0.4, 1);
  facing.set(side * 0.3, 1, 0.1);
  aimRotation(along, facing, out.rotation);
  jointFor(point, out.rotation, KNUCKLES, out.target);
  out.pole.set(side, -0.8, -0.3);
}

/** Right hand cupped over the mouse, drifting a little as he moves the pointer. */
function mouseHand(t: number, seed: number, out: LimbGoal) {
  const target = SEATED_TARGETS.mouse;
  point.set(target.x + noise(t * 0.9, seed + 5) * 0.012, target.y + 0.036, target.z - 0.014 + noise(t * 0.7, seed + 6) * 0.01);
  along.set(0.12, -0.22, 1);
  facing.set(-0.22, 1, 0);
  aimRotation(along, facing, out.rotation);
  jointFor(point, out.rotation, PALM, out.target);
  out.pole.set(-1, -0.7, -0.4);
}

function blendGoal(from: LimbGoal, to: LimbGoal, weight: number, out: LimbGoal) {
  out.target.lerpVectors(from.target, to.target, weight);
  out.rotation.slerpQuaternions(from.rotation, to.rotation, weight);
  out.pole.lerpVectors(from.pole, to.pole, weight);
}

function typingFingers(stroke: Keystroke, typing: number, out: [number, number, number, number]) {
  const curl = lerp(0.38, 0.55, typing);
  for (let i = 0; i < 4; i++) out[i] = curl + (i === stroke.finger ? 0.55 : -0.06) * stroke.press * typing;
}

/** Feet resting flat on the footrest, toes turned out a touch. */
function seatedFoot(side: Side, name: LimbName, out: LimbGoal) {
  footTurn.setFromAxisAngle(Y_AXIS, side * 0.1);
  out.rotation.copy(footTurn);
  jointFor(SEATED_TARGETS.feet[name], out.rotation, SOLE_MIDDLE, out.target);
  out.pole.set(side * 0.15, 0.3, 1);
}

/**
 * Seated at the desk: leaning in, typing in bursts, glancing at the side screens and reaching for
 * the mouse now and then. `motion` 0 gives the still home row pose used for reduced motion.
 */
export function seatedPose(t: number, motion: number, seed: number, pose: BodyPose) {
  const breath = breathAt(t) * motion;
  const typing = occurrence(t, TIMING.burst, seed, burst).weight * motion;
  const onMouse = occurrence(t, TIMING.mouse, seed + 7, mouse).weight * motion;
  const looking = occurrence(t, TIMING.glance, seed + 13, glance).weight * motion;
  const clicking = occurrence(t, TIMING.click, seed + 17, click).weight * onMouse;
  keystrokeAt(t, seed, 1, strokes.left);
  keystrokeAt(t, seed, -1, strokes.right);
  const rightTyping = typing * (1 - onMouse);

  pose.pelvisPosition.set(0, BODY.seatedPelvisHeight, 0);
  pose.pelvis.set(0, 0, 0);
  pose.spine.set(0.13 + 0.008 * breath, -0.07 * onMouse, 0.035 * onMouse);
  const sway = 0.012 * (strokes.left.press * typing - strokes.right.press * rightTyping);
  pose.chest.set(0.07 - 0.014 * breath + 0.012 * typing, -0.1 * onMouse + sway, 0);
  pose.shrug.left = 0.004 * breath + 0.003 * typing;
  pose.shrug.right = 0.004 * breath + 0.003 * rightTyping + 0.006 * onMouse;

  // Head: on the centre screen, turning to a side screen during a glance, and toward the right while mousing.
  const { left, center, right } = SEATED_TARGETS.looks;
  const toRight = 0.85 * Math.max(glance.roll < 0.45 ? looking : 0, onMouse * 0.5);
  const toLeft = 0.85 * (glance.roll < 0.45 ? 0 : looking) * (1 - onMouse);
  const yaw = center.yaw + (right.yaw - center.yaw) * toRight + (left.yaw - center.yaw) * toLeft;
  const pitch = center.pitch + (right.pitch - center.pitch) * toRight + (left.pitch - center.pitch) * toLeft;
  const drift = noise(t * 0.23, seed + 3) * 0.05 * motion;
  const nod = noise(t * 0.31, seed + 4) * 0.035 * motion - 0.02 * typing;
  aimHead(pose, yaw + drift, pitch + nod, noise(t * 0.17, seed + 9) * 0.05 * motion + (1 - typing) * 0.04 * motion);

  typingHand(1, strokes.left, typing, pose.arms.left);
  typingHand(-1, strokes.right, rightTyping, typingGoal);
  mouseHand(t, seed, mouseGoal);
  blendGoal(typingGoal, mouseGoal, onMouse, pose.arms.right);

  typingFingers(strokes.left, typing, pose.fingers.left);
  typingFingers(strokes.right, rightTyping, pose.fingers.right);
  const fingers = pose.fingers.right;
  for (let i = 0; i < 4; i++) fingers[i] = lerp(fingers[i], 0.3 + (i === 0 ? 0.3 * clicking : 0), onMouse);
  pose.thumbs.left = 0.35;
  pose.thumbs.right = lerp(0.35, 0.15, onMouse);

  seatedFoot(1, 'left', pose.legs.left);
  seatedFoot(-1, 'right', pose.legs.right);
}
