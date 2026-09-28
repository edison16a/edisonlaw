/**
 * Body measurements in metres, in the character's own space (+Y up, facing +Z, his left is +X).
 * Standing he is about 1.76 tall and roughly 6.5 heads tall, a college student's build: long legs
 * and arms, broad shoulders and a head a little larger than life, so his face still reads from afar.
 */
export const BODY = {
  /** Pelvis joint above the floor when standing, a touch under the straight leg length so the knees stay soft. */
  standingPelvisHeight: 0.905,
  /** Pelvis joint above the seat contact point when seated. */
  seatedPelvisHeight: 0.13,

  /** Hip joints relative to the pelvis joint. */
  hip: { x: 0.088, y: -0.036 },
  thigh: 0.43,
  shin: 0.41,
  /** Height of the ankle joint above the sole. */
  ankle: 0.077,

  /** Waist pivot above the pelvis joint. */
  spine: 0.071,
  /** Chest pivot above the waist pivot. */
  chest: 0.178,
  /** Shoulder joints relative to the chest pivot. */
  shoulder: { x: 0.174, y: 0.216, z: -0.006 },
  /** Base of the neck above the chest pivot. */
  neck: 0.27,
  /** Head pivot above the base of the neck. */
  headPivot: 0.05,
  /** Centre of the skull relative to the head pivot. */
  headCenter: { y: 0.122, z: 0.012 },

  upperArm: 0.31,
  forearm: 0.27,
} as const;

/**
 * The trunk's sculpted shapes (shirt, trousers seat and neck) were drawn at a smaller scale. These stretch
 * them to the adult build above: wider, much longer and a little deeper. The spine, chest, neck and
 * shoulder measurements above are the originals stretched the same way, so every seam still meets.
 */
export const TRUNK_SCALE = [1.15, 1.42, 1.0] as const;
/** The trouser seat is stretched less in height, so he sits on the chair rather than floating over it. */
export const SEAT_SCALE = [1.18, 1.2, 1.08] as const;
/** The head and everything on it (face, hair, ears) is modelled large and shrunk to this size. */
export const HEAD_SCALE = 0.62;
/** The sneaker is modelled small and stretched to an adult foot about 26 cm long. */
export const SHOE_SCALE = [1.5, 1.13, 1.62] as const;

/** Height of the skull centre above the pelvis joint with the spine upright. */
export const HEAD_ABOVE_PELVIS = BODY.spine + BODY.chest + BODY.neck + BODY.headPivot + BODY.headCenter.y;

/** Hand proportions, in the hand's own space: the wrist is the origin and the fingers point down -Y. */
export const HAND = {
  palmLength: 0.075,
  palmWidth: 0.077,
  palmThickness: 0.026,
  fingerRadius: 0.0092,
  /** Index, middle, ring, little. */
  fingerLengths: [0.062, 0.07, 0.066, 0.052] as const,
  /** Share of each finger's length before its middle joint. */
  fingerSplit: 0.55,
  thumbLength: 0.05,
} as const;

/** The coffee mug and how the right hand wraps around it. */
export const MUG = {
  radius: 0.036,
  height: 0.082,
  /**
   * Centre of the mug in the right hand's space. Its axis runs along the hand's +X, the thumb side, and
   * it sits a little toward the thumb so the hand holds it below the middle and the thumb lands on its
   * side rather than over the rim.
   */
  centerInHand: [0.024, -0.05, -(HAND.palmThickness / 2 + 0.036 + 0.001)] as const,
} as const;

/** Where a two bone limb bends, measured along its bones. */
export const LIMBS = {
  arm: { upper: BODY.upperArm, lower: BODY.forearm },
  leg: { upper: BODY.thigh, lower: BODY.shin },
} as const;
