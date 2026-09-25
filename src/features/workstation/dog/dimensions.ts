import { DOG_PAT_POINT, type Vec3 } from '../layout';

/**
 * Measurements of the golden retriever in metres, in its own space: +Y up, facing +Z, its left is +X,
 * origin on the floor under the middle of its seat. A grown retriever about 0.53 at the shoulder next
 * to Edison's 1.45, sitting up: straight forelegs, a deep chest held high, the back sloping down to
 * haunches folded on the floor, and the tail lying round its left side.
 */

/**
 * The head is sculpted in head space: origin on the crown where Edison's hand rests, +Z toward the nose.
 * It turns about that point, so the hand stays in contact however the head moves.
 */
export const HEAD = {
  /**
   * The crown contact point in dog space: as high as DOG_PAT_POINT, since the dog sits on the floor,
   * held up on an upright neck above the chest, with the skull over the forepaws.
   */
  top: [-0.012, DOG_PAT_POINT[1], 0.13] as Vec3,
  /** Head space is sculpted at a real retriever's size; the clay head is this much bigger. */
  scale: 1.1,
  /**
   * Resting pose of the head, in radians: turned a little toward its left (the about camera) so the face
   * shows three quarters on, nose lifted a touch, and the crown tilted a little toward its right, into
   * Edison's hand.
   */
  rest: { yaw: 0.34, pitch: 0.14, tilt: 0.07 },
  /**
   * The palm meets the head on the upper slope of the side nearest Edison, rather than dead on top, so
   * it rests on the skull instead of the brow. Radians from vertical.
   */
  contactLean: 0.3,
  /**
   * Which way the palm leans in from, across the floor plan in radians: 0 is the dog's right (-X), and
   * positive turns toward its back. Edison stands behind its right shoulder.
   */
  contactFrom: 0.62,
} as const;

/** Where each bone pivots, in dog space. */
export const JOINTS = {
  /** Middle of the rib cage, which swells with each breath. */
  chest: [0, 0.37, 0.035] as Vec3,
  /** Between the hips, where the upper body rocks and leans over the haunches. */
  hips: [0, 0.14, -0.12] as Vec3,
  /** Root of the tail, low at the back of the seat. */
  tail: [0, 0.14, -0.235] as Vec3,
} as const;

/** Half sizes of the rib cage around JOINTS.chest, along the sloping body, which the breathing skin follows. */
export const RIBS: Vec3 = [0.1, 0.12, 0.165];
/** How far the rib cage and back rise from level, in radians, sitting up. */
export const BODY_RISE = 0.84;

/** Paw centres of the left legs on the floor plan, as X and Z. The right paws mirror them. */
export const PAWS = {
  front: [0.063, 0.165] as const,
  /** Hind paws lie a little outside and behind the forepaws, with the hocks flat on the floor behind them. */
  rear: [0.104, 0.052] as const,
  /** Points of the hocks, resting on the floor under the haunches. */
  hock: [0.094, -0.128] as const,
} as const;

/** Bone groups a coat shape can belong to, for skinning. */
export const PART = { body: 0, neck: 1, head: 2, tail: 3 } as const;
export const PART_COUNT = 4;

/** Coat tones: 0 is the deep red gold of the back, 1 the cream of the chest and feathering. */
export const TONE = { saddle: 0, coat: 0.3, light: 0.62, cream: 0.95 } as const;
