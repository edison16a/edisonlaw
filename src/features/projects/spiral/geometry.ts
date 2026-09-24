/**
 * Pure helix math for the project spiral: where each card sits for a given
 * continuous index. No three.js and no DOM, so it runs in unit tests.
 *
 * The camera looks down -Z at the focus slot, which sits at the origin. The
 * helix axis runs through the slot, tilted a little. Upcoming cards wind away
 * into the distance and past cards sweep out toward the camera, like flying
 * along a strand of DNA.
 */

export interface Point3 {
  x: number;
  y: number;
  z: number;
}

export interface CardPose extends Point3 {
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scale: number;
  /** 1 in the focus slot, easing to 0 once the card is a full step away. */
  focus: number;
}

/** World size of a card at scale 1, which is its size in the focus slot (16:10). */
export const CARD_WIDTH = 3.2;
export const CARD_HEIGHT = 2;

export const HELIX = {
  /** Distance from the axis to the card strand. */
  radius: 3.5,
  /** Turn between neighbouring cards, in radians. */
  twist: (Math.PI * 2) / 5.2,
  /** Distance along the axis between neighbouring cards. */
  pitch: 2.5,
  /** Angle on the ring of the card in focus, measured from +X. */
  phase: -1.05,
  /** How far behind the focus slot the ring through the focused card sits. */
  depth: 1.4,
  /** Axis tilt, applied as a pitch around X and then a yaw around Y. */
  tiltX: 0.3,
  tiltY: -0.34,
  /**
   * Angle from the card strand to its partner strand. Less than half a turn,
   * so the pair shows a major and a minor groove like real DNA.
   */
  groove: Math.PI * 0.8,
  /** Card scale while riding the strand. */
  ringScale: 0.6,
  /** How strongly ring cards turn toward the axis, in radians per world unit. */
  lean: 0.075,
} as const;

/** Which strand a helix point belongs to. */
export type Strand = 0 | 1;

const cosTiltX = Math.cos(HELIX.tiltX);
const sinTiltX = Math.sin(HELIX.tiltX);
const cosTiltY = Math.cos(HELIX.tiltY);
const sinTiltY = Math.sin(HELIX.tiltY);

/** Angle around the axis of strand `strand` at helix parameter `u` (in cards). */
export function helixAngle(u: number, strand: Strand = 0) {
  return HELIX.phase + u * HELIX.twist + strand * HELIX.groove;
}

/**
 * Point on the untilted helix, where the axis is Z.
 * `u` is measured in cards from the focus slot, so u = 1 is the next card.
 */
export function helixLocal(u: number, strand: Strand, out: Point3) {
  const angle = helixAngle(u, strand);
  out.x = Math.cos(angle) * HELIX.radius;
  out.y = Math.sin(angle) * HELIX.radius;
  out.z = -HELIX.depth - u * HELIX.pitch;
  return out;
}

/** Applies the axis tilt: pitch around X first, then yaw around Y (three.js Euler order 'YXZ'). */
export function tilt(out: Point3) {
  const y = out.y * cosTiltX - out.z * sinTiltX;
  const z = out.y * sinTiltX + out.z * cosTiltX;
  const x = out.x * cosTiltY + z * sinTiltY;
  out.z = -out.x * sinTiltY + z * cosTiltY;
  out.x = x;
  out.y = y;
  return out;
}

/** World position of a point on either strand. */
export function helixPoint(u: number, strand: Strand, out: Point3) {
  return tilt(helixLocal(u, strand, out));
}

/** Smoothest step, zero first and second derivatives at both ends. */
function smootherstep(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * x * (x * (x * 6 - 15) + 10);
}

/** How much a card `offset` cards from focus is pulled into the focus slot. */
export function focusWeight(offset: number) {
  return 1 - smootherstep(Math.abs(offset));
}

/**
 * Full pose of the card `offset` cards away from focus (index minus the
 * continuous index). Writes into `out` so the render loop allocates nothing.
 */
export function cardPose(offset: number, out: CardPose) {
  helixPoint(offset, 0, out);
  const angle = helixAngle(offset, 0);
  const focus = focusWeight(offset);
  const rest = 1 - focus;

  // On the strand, cards lean toward the axis and roll a touch along the turn.
  const rotationX = out.y * HELIX.lean;
  const rotationY = -out.x * HELIX.lean;
  const rotationZ = Math.sin(angle) * 0.06;

  // A small lift toward the camera mid-transition keeps the moving card clear of the one leaving.
  const lift = Math.sin(focus * Math.PI) * 0.45;

  out.x *= rest;
  out.y *= rest;
  out.z = out.z * rest + lift;
  out.rotationX = rotationX * rest;
  out.rotationY = rotationY * rest;
  out.rotationZ = rotationZ * rest;
  out.scale = HELIX.ringScale + (1 - HELIX.ringScale) * focus;
  out.focus = focus;
  return out;
}

export function createPose(): CardPose {
  return { x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, rotationZ: 0, scale: 1, focus: 0 };
}
