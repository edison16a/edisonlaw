import { Quaternion, Vector3 } from 'three';
import { lerp } from '@/lib/math';
import { BODY, HAND, HEAD_ABOVE_PELVIS, MUG } from '../dimensions';
import type { BodyPose } from './bodyPose';
import { aimRotation, jointFor, type LimbGoal } from './limbs';
import { footOnSurface } from './feet';
import { aimEyes, aimHead } from './look';
import { STANDING_TARGETS } from './targets';
import { breathAt, createOccurrence, noise, occurrence, type Recurring } from './timeline';
import type { LimbName, Side } from './types';

const TIMING = {
  glance: { period: 7, duration: 2.7, ease: 0.7, chance: 0.75 },
  /** Sips and thinking share one slot stream so they never overlap. */
  sip: { period: 7.5, duration: 3.8, ease: 0.95 },
  think: { period: 7.5, duration: 5.6, ease: 1.15 },
} satisfies Record<string, Recurring>;

/** What he does in each gesture slot, in order, so sips and thinking alternate with quiet moments. */
const GESTURES = ['sip', 'idle', 'think', 'idle', 'sip', 'idle', 'think', 'sip', 'idle'] as const;
const gestureIn = (slot: number) => GESTURES[((slot % GESTURES.length) + GESTURES.length) % GESTURES.length];

/** Skull centre height when standing, the reference for everything the hands bring to the face. */
const HEAD_Y = BODY.standingPelvisHeight + HEAD_ABOVE_PELVIS;

/** Mug positions in his own space: held at the belly, and raised to the lips. */
const MUG_REST = new Vector3(-0.075, 0.8, 0.175);
const MUG_SIP = new Vector3(-0.004, HEAD_Y - 0.103, 0.232);
const AXIS_REST = new Vector3(0.06, 1, 0.08).normalize();
const AXIS_SIP = new Vector3(0.03, 0.74, -0.67).normalize();
const MUG_OUTWARD = new Vector3(-1, 0.05, -0.3).normalize();
const MUG_IN_HAND = new Vector3(...MUG.centerInHand);

/** Left hand: hanging loose, or a soft fist under the chin. */
const HANG = new Vector3(0.195, 0.588, 0.03);
const CHIN = new Vector3(0.018, HEAD_Y - 0.145, 0.168);
const KNUCKLES = new Vector3(0, -HAND.palmLength - 0.012, -0.012);

/** Finger curls, index to little. */
const CURLS = { mug: [0.95, 1.05, 1.1, 1.15], loose: [0.3, 0.38, 0.45, 0.52], fist: 1.5 } as const;

const glance = createOccurrence();
const sipEvent = createOccurrence();
const thinkEvent = createOccurrence();
const point = new Vector3();
const axis = new Vector3();
const along = new Vector3();
const facing = new Vector3();
const hangRotation = new Quaternion();
const chinRotation = new Quaternion();

/** Planted feet, toes turned out, the right one a little behind. */
const FEET: Record<LimbName, { x: number; z: number; turn: number }> = {
  left: { x: 0.1, z: 0.035, turn: 0.18 },
  right: { x: -0.102, z: -0.01, turn: -0.26 },
};

function plantedFoot(side: Side, name: LimbName, out: LimbGoal) {
  const foot = FEET[name];
  footOnSurface(point.set(foot.x, 0, foot.z), foot.turn, 0, out);
  out.pole.set(side * 0.2, 0, 1);
}

/** Right hand wraps the mug: its axis is the thumb direction, the back of the hand faces outward. */
function mugHand(sip: number, tip: number, breath: number, out: LimbGoal) {
  point.lerpVectors(MUG_REST, MUG_SIP, sip);
  point.y += 0.004 * breath;
  axis.lerpVectors(AXIS_REST, AXIS_SIP, tip).normalize();
  along.crossVectors(axis, MUG_OUTWARD);
  aimRotation(along, MUG_OUTWARD, out.rotation);
  jointFor(point, out.rotation, MUG_IN_HAND, out.target);
  out.pole.set(lerp(-1, -0.45, sip), -1, lerp(-0.45, 0.2, sip));
}

/** Left hand hangs relaxed, or comes up to rest a loose fist under his chin. */
function thinkingHand(think: number, sway: number, out: LimbGoal) {
  aimRotation(along.set(0.08, -1, 0.1), facing.set(1, 0, 0.35), hangRotation);
  aimRotation(along.set(-0.55, 0.75, 0.25), facing.set(0.25, 0.1, 1), chinRotation);
  out.rotation.slerpQuaternions(hangRotation, chinRotation, think);
  point.lerpVectors(HANG, CHIN, think);
  point.x += sway * (1 - think);
  // For the hang the wrist sits at the point, for the chin pose the knuckles do.
  axis.set(0, 0, 0).lerp(KNUCKLES, think);
  jointFor(point, out.rotation, axis, out.target);
  out.pole.set(1, lerp(-0.4, -1, think), lerp(-0.4, 0.2, think));
}

/**
 * Standing a step back from the desk with a coffee: weight drifting between his feet, looking over the
 * screens, sipping now and then and sometimes thinking with a hand at his chin.
 * `motion` 0 gives a still, relaxed pose for reduced motion.
 */
export function standingPose(t: number, motion: number, seed: number, pose: BodyPose) {
  const breath = breathAt(t) * motion;
  const weight = lerp(0.45, Math.sin(t * 0.55 + seed) * 0.8 + noise(t * 0.2, seed + 1) * 0.3, motion);
  const looking = occurrence(t, TIMING.glance, seed + 31, glance).weight * motion;
  occurrence(t, TIMING.sip, seed + 41, sipEvent);
  occurrence(t, TIMING.think, seed + 41, thinkEvent);
  const sip = (gestureIn(sipEvent.index) === 'sip' ? sipEvent.weight : 0) * motion;
  const think = (gestureIn(thinkEvent.index) === 'think' ? thinkEvent.weight : 0) * motion;
  // The mug tips toward his lips only once it is up there.
  const tip = sip * sip;

  pose.pelvisPosition.set(weight * 0.016, BODY.standingPelvisHeight - 0.004 * Math.abs(weight), 0);
  pose.pelvis.set(0, weight * 0.05, weight * 0.035);
  pose.spine.set(-0.025 + 0.006 * breath + 0.03 * think, -weight * 0.03, -weight * 0.028);
  pose.chest.set(0.02 - 0.012 * breath + 0.02 * think, 0.04 * think, -weight * 0.012);
  pose.shrug.left = 0.004 * breath + 0.006 * think;
  pose.shrug.right = 0.004 * breath + 0.004 * sip;
  pose.reach.left = 0.012 * think;
  pose.reach.right = 0.006 * sip;

  // Head on the centre screen with glances to a side screen, eyes leading. While sipping he faces the mug.
  const { left, center, right } = STANDING_TARGETS.looks;
  const target = glance.roll < 0.5 ? left : right;
  const drift = noise(t * 0.21, seed + 3) * 0.06 * motion;
  const yaw = lerp(lerp(center.yaw, target.yaw, 0.8 * looking) + drift, 0, sip);
  const pitch = lerp(center.pitch, target.pitch, 0.8 * looking) + noise(t * 0.27, seed + 4) * 0.04 * motion + 0.16 * tip - 0.06 * think;
  aimHead(pose, yaw, pitch, noise(t * 0.15, seed + 5) * 0.05 * motion - 0.12 * think + 0.03);
  const lead = 1 - (1 - looking) ** 3;
  const eyeYaw = lerp(lerp(center.yaw, target.yaw, lead) + noise(t * 1.5, seed + 6) * 0.02 * motion, 0, sip);
  aimEyes(pose, eyeYaw, lerp(center.pitch, target.pitch, lead) - 0.1 * sip, yaw, pitch);

  mugHand(sip, tip, breath, pose.arms.right);
  thinkingHand(think, 0.004 * breath, pose.arms.left);
  for (let i = 0; i < 4; i++) {
    pose.fingers.right[i] = CURLS.mug[i];
    pose.fingers.left[i] = lerp(CURLS.loose[i] + 0.02 * breath, CURLS.fist, think);
  }
  pose.thumbs.right = 0.45;
  pose.thumbs.left = lerp(0.2, 0.9, think);

  plantedFoot(1, 'left', pose.legs.left);
  plantedFoot(-1, 'right', pose.legs.right);
}
