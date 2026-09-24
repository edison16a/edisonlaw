import { Euler, Quaternion } from 'three';
import { lerp } from '@/lib/math';
import { blinkAt } from '../../character/rig/blink';
import { createOccurrence, noise, occurrence, type Recurring } from '../../character/rig/timeline';
import { HEAD } from '../dimensions';
import type { DogRig } from './createDogRig';
import { TAIL_BONES } from './createDogRig';

/** One frame of the dog's pose, as offsets from its resting sculpt. Angles in radians. */
export interface DogPose {
  /** Roll of the body toward its right, into Edison's leg. */
  lean: number;
  /** Body rocking forward (+) and back. */
  rock: number;
  /** -1 to 1 through a breath. */
  breath: number;
  /** Head turn toward its left, nose lift and crown tilt toward its right, in dog space (see HEAD.rest). */
  head: { yaw: number; pitch: number; tilt: number };
  /** How far the mouth is open. */
  jaw: number;
  /** Side to side swing of each tail joint, root first, and how high the whole tail is carried. */
  tail: number[];
  tailLift: number;
  /** Outward swing and forward swing of each ear, left then right. */
  ears: [{ out: number; forward: number }, { out: number; forward: number }];
  /** 0 open, 1 shut. */
  blink: number;
}

export function createDogPose(): DogPose {
  return {
    lean: 0,
    rock: 0,
    breath: 0,
    head: { yaw: 0, pitch: 0, tilt: 0 },
    jaw: 0,
    tail: new Array(TAIL_BONES).fill(0),
    tailLift: 0,
    ears: [
      { out: 0, forward: 0 },
      { out: 0, forward: 0 },
    ],
    blink: 0,
  };
}

const TIMING = {
  /** Now and then it looks up at Edison for a moment. */
  lookUp: { period: 9, duration: 3.2, ease: 0.8, chance: 0.85 },
  /** Leaning into the hand with its eyes half shut. */
  bliss: { period: 6.5, duration: 3.4, ease: 0.9, chance: 0.7 },
} satisfies Record<string, Recurring>;

/**
 * The head when it looks up at Edison. He stands just behind it and far above as the about camera sees
 * it, so lifting the chin while still facing the camera reads as looking up at him, and keeps the
 * neck from twisting.
 */
const LOOK_UP = { yaw: 0.9, pitch: 0.62, tilt: 0.02 } as const;

/** How much of the head's swing the ears undo, hanging back toward the floor. */
const EAR_GRAVITY = 0.55;

const lookUp = createOccurrence();
const bliss = createOccurrence();

/** Wag cycles a second, and how far each joint's swing lags the one before it, so the tail whips. */
const WAG = { rate: 2.3, lag: 0.55 } as const;

/**
 * The dog's idle as a pure function of time: a happy wag, quick breathing and light panting, leaning
 * into Edison's hand with little nuzzles, blinks, ear flops and now and then a look up at him.
 * `motion` 0 gives a lovely still pose for reduced motion.
 */
export function dogPose(t: number, motion: number, seed: number, pose: DogPose) {
  const breath = Math.sin(t * Math.PI * 2 * 0.62) * motion;
  const looking = occurrence(t, TIMING.lookUp, seed + 7, lookUp).weight * motion;
  const blissful = occurrence(t, TIMING.bliss, seed + 13, bliss).weight * motion * (1 - looking);

  pose.breath = breath;
  pose.lean = 0.02 + (0.018 * blissful + 0.008 * noise(t * 0.35, seed + 1)) * motion;
  pose.rock = 0.006 * noise(t * 0.5, seed + 2) * motion;

  // Nuzzling up into the hand while it pets, and looking up at him now and then.
  const nuzzle = Math.sin(t * 1.25 + seed) * 0.5 + 0.5;
  const rest = HEAD.rest;
  const idleYaw = rest.yaw + 0.05 * noise(t * 0.4, seed + 3) * motion;
  const idlePitch = rest.pitch + (0.04 * nuzzle + 0.03 * blissful) * motion;
  const idleTilt = rest.tilt + (0.05 * noise(t * 0.3, seed + 4) + 0.06 * blissful) * motion;
  pose.head.yaw = lerp(idleYaw, LOOK_UP.yaw, looking);
  pose.head.pitch = lerp(idlePitch, LOOK_UP.pitch, looking);
  pose.head.tilt = lerp(idleTilt, LOOK_UP.tilt, looking);

  // Light, happy panting, a little quicker than the breath.
  const pant = Math.sin(t * Math.PI * 2 * 1.7) * 0.5 + 0.5;
  pose.jaw = lerp(0.1, 0.08 + 0.05 * pant, motion) - 0.04 * blissful;

  // The wag grows and settles in waves, and the tail is carried a little higher while it looks up.
  const energy = lerp(0.62, 0.85 + 0.15 * noise(t * 0.25, seed + 5), motion) + 0.2 * looking;
  for (let i = 0; i < TAIL_BONES; i++) {
    const swing = motion > 0 ? Math.sin(t * Math.PI * 2 * WAG.rate - i * WAG.lag) : 0.55;
    pose.tail[i] = swing * energy * (0.22 + 0.1 * i);
  }
  pose.tailLift = 0.06 * looking + 0.02 * Math.sin(t * Math.PI * 2 * WAG.rate * 2) * motion;

  // Ears hang back toward the floor as the head swings, with a little bounce of their own.
  const lift = pose.head.pitch - rest.pitch;
  const roll = pose.head.tilt - rest.tilt;
  for (let side = 0; side < 2; side++) {
    const sign = side === 0 ? 1 : -1;
    const bounce = Math.sin(t * 3.1 + side * 1.7 + seed) * 0.03 * motion;
    pose.ears[side].out = 0.04 * blissful + bounce - sign * roll * EAR_GRAVITY;
    pose.ears[side].forward = -lift * EAR_GRAVITY + 0.02 * noise(t * 0.8, seed + 20 + side) * motion;
  }

  pose.blink = motion > 0 ? Math.max(blinkAt(t, seed), 0.55 * blissful) : 0;
  return pose;
}

const offset = new Quaternion();
const euler = new Euler(0, 0, 0, 'YXZ');

/** Writes a pose onto the rig. */
export function applyDogPose(rig: DogRig, pose: DogPose) {
  rig.body.rotation.set(pose.rock, 0, pose.lean);
  rig.chest.scale.set(1 + 0.014 * pose.breath, 1 + 0.02 * pose.breath, 1 + 0.008 * pose.breath);

  euler.set(-pose.head.pitch, pose.head.yaw, pose.head.tilt);
  rig.head.quaternion.setFromEuler(euler);
  rig.jaw.rotation.x = pose.jaw;

  for (let i = 0; i < rig.tail.length; i++) rig.tail[i].rotation.set(i === 0 ? pose.tailLift : 0, pose.tail[i], 0);

  for (let side = 0; side < 2; side++) {
    const sign = side === 0 ? 1 : -1;
    euler.set(-pose.ears[side].forward, 0, sign * pose.ears[side].out);
    rig.ears[side].quaternion.copy(rig.rest.ears[side]).multiply(offset.setFromEuler(euler));
    rig.eyes[side].scale.y = 1 - 0.92 * pose.blink;
  }
}
