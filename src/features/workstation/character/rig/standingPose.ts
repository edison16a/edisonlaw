import { Vector3 } from 'three';
import { lerp } from '@/lib/math';
import { BODY } from '../dimensions';
import type { BodyPose } from './bodyPose';
import { footOnSurface } from './feet';
import type { LimbGoal } from './limbs';
import { aimEyes, aimHead } from './look';
import { MUG_GRIP, mugHand } from './mugHand';
import { createPetting, pettingFingers, pettingHand } from './petting';
import { scanScreens, type Look } from './scan';
import { STANDING_TARGETS } from './targets';
import { breathAt, createOccurrence, noise, occurrence, type Occurrence, type Recurring } from './timeline';
import type { LimbName, Side } from './types';

/** Gestures share one slot stream, so a sip, a thought and a glance at the dog never overlap. */
const TIMING = {
  sip: { period: 7.5, duration: 3.8, ease: 0.95 },
  think: { period: 7.5, duration: 5.8, ease: 1.2 },
  dog: { period: 7.5, duration: 3.4, ease: 0.8 },
} satisfies Record<string, Recurring>;

type Gesture = keyof typeof TIMING | 'idle';

/** What he does in each gesture slot, in order, so the gestures alternate with quiet moments. */
const GESTURES: readonly Gesture[] = ['sip', 'think', 'dog', 'idle', 'think', 'sip', 'dog', 'think', 'idle', 'sip', 'think', 'dog'];
const gestureIn = (slot: number) => GESTURES[((slot % GESTURES.length) + GESTURES.length) % GESTURES.length];

/** Planted feet, toes turned out, the right one a little behind and carrying most of his weight. */
const FEET: Record<LimbName, { x: number; z: number; turn: number }> = {
  left: { x: 0.104, z: 0.035, turn: 0.2 },
  right: { x: -0.1, z: -0.01, turn: -0.26 },
};

const events: Record<keyof typeof TIMING, Occurrence> = { sip: createOccurrence(), think: createOccurrence(), dog: createOccurrence() };
const petting = createPetting();
const sole = new Vector3();
const eyes: Look = { yaw: 0, pitch: 0 };
const head: Look = { yaw: 0, pitch: 0 };

function plantedFoot(side: Side, name: LimbName, out: LimbGoal) {
  const foot = FEET[name];
  footOnSurface(sole.set(foot.x, 0, foot.z), foot.turn, 0, out);
  out.pole.set(side * 0.2, 0, 1);
}

/** Weight of a gesture if the current slot holds it. */
function gestureWeight(t: number, kind: keyof typeof TIMING, seed: number) {
  const event = occurrence(t, TIMING[kind], seed, events[kind]);
  return gestureIn(event.index) === kind ? event.weight : 0;
}

/**
 * Standing beside the desk with a coffee in his right hand and his left hand on the dog's head.
 * He strokes the dog while he reads the screens, sips now and then, stops to think with the mug under
 * his chin, and glances down at the dog. `motion` 0 gives a still frame of the same pose.
 */
export function standingPose(t: number, motion: number, seed: number, pose: BodyPose) {
  const breath = breathAt(t) * motion;
  const sway = (Math.sin(t * 0.5 + seed) * 0.7 + noise(t * 0.2, seed + 1) * 0.3) * motion;
  const sip = gestureWeight(t, 'sip', seed + 41) * motion;
  const think = gestureWeight(t, 'think', seed + 41) * motion;
  const dog = gestureWeight(t, 'dog', seed + 41) * motion;
  // The mug tips toward his lips only once it is up there.
  const tip = sip * sip;

  // Weight on his right leg, hip out that way, shoulders leaning toward the dog on his left so the
  // left arm reaches its head with a soft elbow. He turns a little toward the dog too.
  pose.pelvisPosition.set(-0.014 + 0.006 * sway, BODY.standingPelvisHeight - 0.003 - 0.002 * Math.abs(sway), 0.004);
  pose.pelvis.set(0.01, 0.07 + 0.02 * sway, -0.035 + 0.012 * sway);
  pose.spine.set(0.035 + 0.006 * breath + 0.02 * think + 0.03 * dog, 0.05 + 0.03 * dog, -0.062 - 0.008 * sway);
  pose.chest.set(0.02 - 0.012 * breath + 0.02 * think, 0.03 + 0.05 * dog - 0.04 * sip, -0.03);
  pose.shrug.left = -0.014 + 0.003 * breath;
  pose.shrug.right = 0.004 * breath + 0.004 * sip + 0.003 * think;
  pose.reach.left = 0.006;
  pose.reach.right = 0.006 * sip + 0.004 * think;

  // Reading the screens, eyes hopping between them and the head following. Sipping, he faces the
  // mug; glancing at the dog, he turns his head down to it and the eyes go the rest of the way.
  const { center } = STANDING_TARGETS.looks;
  if (motion > 0) scanScreens(t, seed + 7, STANDING_TARGETS.looks, eyes, head);
  else {
    eyes.yaw = head.yaw = center.yaw;
    eyes.pitch = head.pitch = center.pitch;
  }
  const toDog = STANDING_TARGETS.dog;
  const lead = 1 - (1 - dog) ** 3;
  const drift = noise(t * 0.21, seed + 3) * 0.04 * motion;
  const nod = noise(t * 0.27, seed + 4) * 0.03 * motion;
  // Thinking, he looks up a little, as if working something out.
  // Toward the dog the head turns most of the way but only tips part way down, so his face stays in
  // view from the about camera; the eyes look down the rest of the way.
  const headYaw = lerp(lerp(head.yaw + drift, 0, sip), toDog.yaw, 0.72 * dog);
  const headPitch = lerp(head.pitch + nod + 0.05 * think + 0.16 * tip, toDog.pitch, 0.42 * dog);
  const tilt = 0.035 - 0.13 * think - 0.08 * dog + noise(t * 0.15, seed + 5) * 0.04 * motion;
  aimHead(pose, headYaw, headPitch, tilt);
  const eyeYaw = lerp(lerp(eyes.yaw, 0, sip), toDog.yaw, lead);
  const eyePitch = lerp(eyes.pitch + 0.07 * think - 0.1 * sip, toDog.pitch, lead);
  aimEyes(pose, eyeYaw, eyePitch, headYaw, headPitch);

  // Face: a soft smile at rest, a pursed "hmm" with one brow up while thinking, a happy squint at the dog.
  const face = pose.expression;
  face.smile = 0.2 + 0.8 * dog;
  face.hmm = think;
  face.browInner = 0.5 * think + 0.25 * dog + 0.15 * sip;
  // The about camera sees his left side, so that is the brow he raises.
  face.browLift.left = 0.65 * think + 0.35 * dog + 0.2 * sip;
  face.browLift.right = 0.15 * think + 0.35 * dog + 0.2 * sip;
  face.squint = 0.55 * sip + 0.4 * dog + 0.15 * think;

  // Hands: the mug in the right, the dog's head under the left.
  mugHand(think, sip, tip, breath, pose.arms.right);
  pettingHand(t, motion * (1 - 0.6 * dog), seed + 51, pose.arms.left, petting);
  for (let i = 0; i < 4; i++) pose.fingers.right[i] = MUG_GRIP.curls[i];
  pose.fingerBend.right = MUG_GRIP.bend;
  pose.thumbs.right = MUG_GRIP.thumb;
  pettingFingers(petting, pose.fingers.left);
  pose.fingerBend.left = 0.72;
  pose.thumbs.left = 0.12;

  plantedFoot(1, 'left', pose.legs.left);
  plantedFoot(-1, 'right', pose.legs.right);
}
