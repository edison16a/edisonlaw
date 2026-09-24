import { Vector3 } from 'three';
import { DOG_PAT_POINT, KEYBOARD, MONITORS, MOUSE, type MonitorSlot, type Vec3 } from '../../layout';
import { BODY, HEAD_ABOVE_PELVIS } from '../dimensions';
import { SEATED_FOOT_REST, SEATED_PLACEMENT, STANDING_PLACEMENT, type Placement } from '../placement';

const UP = new Vector3(0, 1, 0);

/** A room point seen from inside the character's own space for a given placement. */
function toCharacterSpace(point: Vec3, placement: Placement) {
  return new Vector3(...point).sub(new Vector3(...placement.position)).applyAxisAngle(UP, -placement.rotationY);
}

/** Yaw (toward his left) and pitch (up) in radians to look from `from` at `to`. */
function lookAngles(from: Vector3, to: Vector3) {
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

/** Approximate eye position in each pose (a little below the skull centre), enough to aim the head at the screens. */
const SEATED_EYES = new Vector3(0, BODY.seatedPelvisHeight + HEAD_ABOVE_PELVIS - 0.03, 0.1);
const STANDING_EYES = new Vector3(0, BODY.standingPelvisHeight + HEAD_ABOVE_PELVIS - 0.02, 0.03);

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

const STANDING_PAT = toCharacterSpace(DOG_PAT_POINT, STANDING_PLACEMENT);

/**
 * The way the dog's head faces, as a horizontal unit vector in his own space: out from him past the pat
 * point and turned a little forward, toward the about camera. His fingers reach over its crown this way.
 */
const STANDING_DOG_HEADING = new Vector3(STANDING_PAT.x, 0, STANDING_PAT.z).normalize().applyAxisAngle(UP, -0.35);
/** The dog's eyes, ahead of and below the top of its head, where he looks when he glances down. */
const STANDING_DOG_FACE = STANDING_PAT.clone().addScaledVector(STANDING_DOG_HEADING, 0.09).add(new Vector3(0, -0.05, 0));

/** Screen directions and the dog for the standing pose, in his own space. */
export const STANDING_TARGETS = {
  looks: monitorLooks(STANDING_PLACEMENT, STANDING_EYES),
  /** Top of the dog's head, where his left palm rests (DOG_PAT_POINT). */
  pat: STANDING_PAT,
  dogHeading: STANDING_DOG_HEADING,
  dog: lookAngles(STANDING_EYES, STANDING_DOG_FACE),
};
