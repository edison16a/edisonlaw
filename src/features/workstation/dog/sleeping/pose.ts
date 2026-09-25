import { Euler, Quaternion, Vector3 } from 'three';
import { lerp } from '@/lib/math';
import { createOccurrence, noise, occurrence, smootherstep, type Recurring } from '../../character/rig/timeline';
import { HEAD_REST } from './dimensions';
import { SLEEP_TAIL_BONES, type SleepingRig } from './rig';

/** One frame of the sleeping dog's pose, as offsets from its resting sculpt. Angles in radians. */
export interface SleepPose {
  /** -1 to 1 through a breath. */
  breath: number;
  /** How far the head has lifted off the floor, 0 resting to 1 fully up. */
  lift: number;
  /** Turn of the head toward its left (yaw) and nose lift (pitch), on top of the lift. */
  look: { yaw: number; pitch: number };
  /** 0 open, 1 shut. */
  lids: number;
  /** Outward swing and forward swing of each ear, left then right. */
  ears: [{ out: number; forward: number }, { out: number; forward: number }];
  /** Turn of each tail joint about the upright, root first: positive swings the tail out, away from the face. */
  tail: number[];
}

export function createSleepPose(): SleepPose {
  return {
    breath: 0,
    lift: 0,
    look: { yaw: 0, pitch: 0 },
    lids: 1,
    ears: [
      { out: 0, forward: 0 },
      { out: 0, forward: 0 },
    ],
    tail: new Array(SLEEP_TAIL_BONES).fill(0),
  };
}

const TIMING = {
  /** Now and then it lifts its head a little, opens its eyes sleepily and looks up, then settles back. */
  lookUp: { period: 23, duration: 7, ease: 1.8, chance: 0.7 },
  /** Now and then the tail swishes a few times across the floor. */
  wag: { period: 12, duration: 3.2, ease: 0.6, chance: 0.65 },
  /** Small twitches in its sleep: an ear flicks and the lids stir. */
  twitch: { period: 4.2, duration: 0.9, ease: 0.25, chance: 0.6 },
} satisfies Record<string, Recurring>;

/** Slow, deep breaths while it sleeps, a little over a dozen a minute. */
const BREATH_RATE = 0.23;
/** How far the head turns up about the base of the neck when fully lifted. */
export const LIFT_ANGLE = 0.2;
/**
 * Where it looks once its head is up: at Edison, who sits above and behind its right shoulder, or at
 * whoever is watching, straight ahead. Either way the face stays turned to the camera.
 */
const LOOKS = [
  { yaw: -0.16, pitch: 0.2 },
  { yaw: 0.04, pitch: 0.12 },
] as const;
/** How far the lids open when it wakes a little: never wide, just a sleepy look. */
const SLEEPY = 0.58;
/** How much of the head's lift the ears undo, hanging back toward the floor. */
const EAR_GRAVITY = 0.25;
/** Tail swishes a second, how far each joint lags the one before, and how far each joint turns at full swing. */
const WAG = { rate: 1.3, lag: 0.5, reach: [0.05, 0.07, 0.08, 0.09, 0.1, 0.1] } as const;

const lookUp = createOccurrence();
const wag = createOccurrence();
const twitch = createOccurrence();

/** A bump from 0 up to 1 and back over [from, to], smooth at both ends. */
const bump = (x: number, from: number, to: number) => {
  const middle = (from + to) / 2;
  return smootherstep(from, middle, x) * (1 - smootherstep(middle, to, x));
};

/**
 * The sleeping dog's idle as a pure function of time. It always stays curled up: slow breathing, eyes
 * shut with small twitches, now and then a sleepy look up with half open eyes before it settles back,
 * and now and then a few swishes of the tail. `motion` 0 gives a calm sleeping pose, eyes shut.
 */
export function sleepPose(t: number, motion: number, seed: number, pose: SleepPose) {
  pose.breath = Math.sin(t * Math.PI * 2 * BREATH_RATE) * motion;

  const looking = occurrence(t, TIMING.lookUp, seed + 7, lookUp);
  const lift = looking.weight * motion;
  const look = LOOKS[looking.roll < 0.55 ? 0 : 1];
  pose.lift = lift;
  pose.look.yaw = look.yaw * lift + 0.02 * noise(t * 0.3, seed + 3) * lift;
  pose.look.pitch = look.pitch * lift;

  // The eyes open a moment after the head starts up and close again before it settles, with one slow
  // blink while it looks.
  const p = looking.progress;
  const awake = lift > 0 ? smootherstep(0.18, 0.34, p) * (1 - smootherstep(0.66, 0.82, p)) * (1 - bump(p, 0.46, 0.56)) : 0;
  const stir = occurrence(t, TIMING.twitch, seed + 11, twitch);
  const twitching = stir.weight * motion;
  pose.lids = 1 - SLEEPY * awake * motion - 0.08 * twitching * (1 - lift);

  for (let side = 0; side < 2; side++) {
    const flick = twitching * (Math.floor(stir.roll * 2) === side ? 1 : 0.2);
    pose.ears[side].out = 0.16 * flick + 0.02 * lift;
    pose.ears[side].forward = -(LIFT_ANGLE * lift + pose.look.pitch) * EAR_GRAVITY + 0.03 * flick;
  }

  const wagging = occurrence(t, TIMING.wag, seed + 17, wag).weight * motion;
  for (let i = 0; i < SLEEP_TAIL_BONES; i++) {
    const swing = 0.5 - 0.5 * Math.cos(t * Math.PI * 2 * WAG.rate - i * WAG.lag);
    pose.tail[i] = wagging * swing * WAG.reach[i];
  }
  return pose;
}

const euler = new Euler(0, 0, 0, 'YXZ');
const turn = new Quaternion();
const liftTurn = new Quaternion();
const axis = new Vector3();
const offset = new Vector3();
const UP = new Vector3(0, 1, 0);

/** Radians the lids turn through, from open (tucked up under the brow) to shut. See parts/Lids. */
export const LID_TURN = { open: -0.95, shut: 1.05 } as const;

/** Writes a pose onto the rig. */
export function applySleepPose(rig: SleepingRig, pose: SleepPose) {
  const b = pose.breath;
  rig.chest.scale.set(1 + 0.03 * b, 1 + 0.036 * b, 1 + 0.01 * b);

  // Lift the head by turning it up about the base of the neck, then turn it to look.
  offset.copy(rig.rest.headPosition).sub(rig.neckBase);
  axis.crossVectors(offset, UP).normalize();
  liftTurn.setFromAxisAngle(axis, LIFT_ANGLE * pose.lift);
  rig.head.position.copy(offset.applyQuaternion(liftTurn)).add(rig.neckBase);
  const { yaw, pitch, tilt } = HEAD_REST.rest;
  euler.set(-(pitch + pose.look.pitch), yaw + pose.look.yaw, lerp(tilt, tilt * 0.4, pose.lift));
  rig.head.quaternion.setFromEuler(euler).premultiply(liftTurn);

  for (let side = 0; side < 2; side++) {
    const sign = side === 0 ? 1 : -1;
    euler.set(-pose.ears[side].forward, 0, sign * pose.ears[side].out);
    rig.ears[side].quaternion.copy(rig.rest.ears[side]).multiply(turn.setFromEuler(euler));
    rig.lids[side].rotation.x = lerp(LID_TURN.open, LID_TURN.shut, pose.lids);
  }

  for (let i = 0; i < rig.tail.length; i++) rig.tail[i].rotation.set(0, pose.tail[i], 0);
}
