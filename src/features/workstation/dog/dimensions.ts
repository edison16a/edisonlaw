import { DOG_PAT_POINT, type Vec3 } from '../layout';

/**
 * Measurements of the golden retriever in metres, in its own space: +Y up, facing +Z, its left is +X,
 * origin on the floor under the middle of its body. About 0.41 at the shoulder next to Edison's 1.41.
 */

/**
 * The head is sculpted in head space: origin on the crown where Edison's hand rests, +Z toward the nose.
 * It turns about that point, so the hand stays in contact however the head moves.
 */
export const HEAD = {
  /** The crown contact point in dog space: as high as DOG_PAT_POINT, since the dog stands on the floor. */
  top: [0, DOG_PAT_POINT[1], 0.19] as Vec3,
  /** Head space is sculpted at a real retriever's size; the chibi head is this much bigger. */
  scale: 1.18,
  /**
   * Resting pose of the head, in radians: turned toward its left (the about camera), nose lifted,
   * and the crown tilted a little toward its right, into Edison's hand.
   */
  rest: { yaw: 0.95, pitch: 0.2, tilt: 0.1 },
} as const;

/** Where each bone pivots, in dog space. */
export const JOINTS = {
  /** Middle of the rib cage, which swells with each breath. */
  chest: [0, 0.285, 0.055] as Vec3,
  /** Root of the tail on top of the rump. */
  tail: [0, 0.35, -0.2] as Vec3,
} as const;

/** Bone groups a coat shape can belong to, for skinning. */
export const PART = { body: 0, neck: 1, head: 2, jaw: 3, tail: 4 } as const;
export const PART_COUNT = 5;

/** Coat tones: 0 is the deep gold of the back, 1 the cream of the chest and feathering. */
export const TONE = { saddle: 0, coat: 0.3, light: 0.62, cream: 0.95 } as const;
