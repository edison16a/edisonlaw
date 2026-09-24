import { Vector3 } from 'three';
import { KEYBOARD, MONITORS, MOUSE, type MonitorSlot, type Vec3 } from '../../layout';
import { BODY } from '../dimensions';
import { SEATED_FOOT_REST, SEATED_PLACEMENT, STANDING_PLACEMENT, type Placement } from '../placement';

const UP = new Vector3(0, 1, 0);

/** A room point seen from inside the character's own space for a given placement. */
export function toCharacterSpace(point: Vec3, placement: Placement) {
  return new Vector3(...point).sub(new Vector3(...placement.position)).applyAxisAngle(UP, -placement.rotationY);
}

/** Yaw (toward his left) and pitch (up) in radians to look from `from` at `to`. */
export function lookAngles(from: Vector3, to: Vector3) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dz = to.z - from.z;
  return { yaw: Math.atan2(dx, dz), pitch: Math.atan2(dy, Math.hypot(dx, dz)) };
}

type LookSet = Record<MonitorSlot, { yaw: number; pitch: number }>;

function monitorLooks(placement: Placement, eyes: Vector3): LookSet {
  const looks = {} as LookSet;
  for (const monitor of MONITORS) looks[monitor.slot] = lookAngles(eyes, toCharacterSpace(monitor.position, placement));
  return looks;
}

/** Approximate eye height in each pose, enough to aim the head at the screens. */
const SEATED_EYES = new Vector3(0, BODY.seatedPelvisHeight + 0.6, 0.1);
const STANDING_EYES = new Vector3(0, BODY.standingPelvisHeight + 0.6, 0.03);

/** Desk targets for the seated pose, in his own space. */
export const SEATED_TARGETS = {
  keyboard: toCharacterSpace(KEYBOARD.position, SEATED_PLACEMENT),
  mouse: toCharacterSpace(MOUSE.position, SEATED_PLACEMENT),
  feet: {
    left: toCharacterSpace(SEATED_FOOT_REST.left, SEATED_PLACEMENT),
    right: toCharacterSpace(SEATED_FOOT_REST.right, SEATED_PLACEMENT),
  },
  looks: monitorLooks(SEATED_PLACEMENT, SEATED_EYES),
};

/** Screen directions for the standing pose, in his own space. */
export const STANDING_TARGETS = {
  looks: monitorLooks(STANDING_PLACEMENT, STANDING_EYES),
};
