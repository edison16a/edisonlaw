import { clamp } from '@/lib/math';
import type { BodyPose } from './bodyPose';

/** Share of a look carried by the neck, the head takes the rest. */
const NECK_SHARE = 0.38;

/**
 * Turns the neck and head so the face points along `yaw` (toward his left) and `pitch` (up),
 * in the character's own space, after whatever the pelvis, spine and chest already turn and lean.
 * `tilt` rolls the head toward his right shoulder.
 */
export function aimHead(pose: BodyPose, yaw: number, pitch: number, tilt = 0) {
  const turn = yaw - pose.pelvis.y - pose.spine.y - pose.chest.y;
  const down = -pitch - pose.pelvis.x - pose.spine.x - pose.chest.x;
  const roll = tilt - pose.spine.z - pose.chest.z - pose.pelvis.z;
  pose.neck.set(down * NECK_SHARE, turn * NECK_SHARE, roll * NECK_SHARE);
  pose.head.set(down * (1 - NECK_SHARE), turn * (1 - NECK_SHARE), roll * (1 - NECK_SHARE));
}

/** Angle, in radians, that moves the eyes all the way to the side of their sockets. */
const EYE_RANGE = { yaw: 0.16, pitch: 0.14 } as const;

/**
 * Points the eyes at `eyeYaw` and `eyePitch` while the head is aimed at `headYaw` and `headPitch`.
 * The eyes cover whatever the head has not turned yet, so they lead a glance and settle after it.
 */
export function aimEyes(pose: BodyPose, eyeYaw: number, eyePitch: number, headYaw: number, headPitch: number) {
  pose.gaze.x = clamp((eyeYaw - headYaw) / EYE_RANGE.yaw, -1, 1);
  pose.gaze.y = clamp((eyePitch - headPitch) / EYE_RANGE.pitch, -1, 1);
}
