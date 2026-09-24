import { DOG_PAT_POINT, type Vec3 } from '../layout';

/**
 * Measurements of the golden retriever in metres, in its own space: +Y up, facing +Z, its left is +X,
 * origin on the floor under the middle of its body. A grown retriever about 0.52 at the shoulder next
 * to Edison's 1.45: long in the leg, deep in the chest and level along the back.
 */

/**
 * The head is sculpted in head space: origin on the crown where Edison's hand rests, +Z toward the nose.
 * It turns about that point, so the hand stays in contact however the head moves.
 */
export const HEAD = {
  /**
   * The crown contact point in dog space: as high as DOG_PAT_POINT, since the dog stands on the floor,
   * a neck's length ahead of the shoulders and a little to the dog's right, toward Edison's hand.
   */
  top: [-0.018, DOG_PAT_POINT[1], 0.3] as Vec3,
  /** Head space is sculpted at a real retriever's size; the clay head is this much bigger. */
  scale: 1.1,
  /**
   * Resting pose of the head, in radians: turned toward its left (the about camera), nose lifted a
   * touch, and the crown tilted a little toward its right, into Edison's hand.
   */
  rest: { yaw: 1.2, pitch: 0.1, tilt: 0.08 },
  /**
   * The palm meets the head on the upper slope of its right side, toward Edison, rather than dead on
   * top, so the round skull sits a little toward the camera and clear of his leg. Radians from vertical.
   */
  contactLean: 0.3,
} as const;

/** Where each bone pivots, in dog space. */
export const JOINTS = {
  /** Middle of the rib cage, which swells with each breath. */
  chest: [0, 0.4, 0.08] as Vec3,
  /** Root of the tail at the top of the croup. */
  tail: [0, 0.482, -0.27] as Vec3,
} as const;

/** Half sizes of the rib cage around JOINTS.chest, which the breathing skin follows. */
export const RIBS: Vec3 = [0.1, 0.125, 0.17];

/** Paw centres of the left legs on the floor plan, as X and Z. The right paws mirror them. */
export const PAWS = {
  front: [0.066, 0.2] as const,
  rear: [0.07, -0.232] as const,
} as const;

/** Bone groups a coat shape can belong to, for skinning. */
export const PART = { body: 0, neck: 1, head: 2, tail: 3 } as const;
export const PART_COUNT = 4;

/** Coat tones: 0 is the deep red gold of the back, 1 the cream of the chest and feathering. */
export const TONE = { saddle: 0, coat: 0.3, light: 0.62, cream: 0.95 } as const;
