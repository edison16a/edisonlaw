/**
 * Body measurements in metres, in the character's own space (+Y up, facing +Z, his left is +X).
 * Standing he is about 1.45 tall and roughly 3.4 heads tall.
 */
export const BODY = {
  /** Pelvis joint above the floor when standing, a touch under the straight leg length so the knees stay soft. */
  standingPelvisHeight: 0.592,
  /** Pelvis joint above the seat contact point when seated. */
  seatedPelvisHeight: 0.085,

  /** Hip joints relative to the pelvis joint. */
  hip: { x: 0.075, y: -0.03 },
  thigh: 0.26,
  shin: 0.24,
  /** Height of the ankle joint above the sole. */
  ankle: 0.068,

  /** Waist pivot above the pelvis joint. */
  spine: 0.05,
  /** Chest pivot above the waist pivot. */
  chest: 0.125,
  /** Shoulder joints relative to the chest pivot. */
  shoulder: { x: 0.15, y: 0.152, z: -0.006 },
  /** Base of the neck above the chest pivot. */
  neck: 0.2,
  /** Head pivot above the base of the neck. */
  headPivot: 0.03,
  /** Centre of the skull relative to the head pivot. */
  headCenter: { y: 0.196, z: 0.014 },

  upperArm: 0.185,
  forearm: 0.165,
} as const;

/** Hand proportions, in the hand's own space: the wrist is the origin and the fingers point down -Y. */
export const HAND = {
  palmLength: 0.052,
  palmWidth: 0.055,
  palmThickness: 0.026,
  fingerRadius: 0.0096,
  /** Index, middle, ring, little. */
  fingerLengths: [0.03, 0.033, 0.031, 0.025] as const,
  thumbLength: 0.03,
} as const;

/** The coffee mug and how the right hand wraps around it. */
export const MUG = {
  radius: 0.036,
  height: 0.082,
  /** Centre of the mug in the right hand's space. Its axis runs along the hand's +X, the thumb side. */
  centerInHand: [0, -0.036, -(HAND.palmThickness / 2 + 0.036 + 0.001)] as const,
} as const;

/** Where a two bone limb bends, measured along its bones. */
export const LIMBS = {
  arm: { upper: BODY.upperArm, lower: BODY.forearm },
  leg: { upper: BODY.thigh, lower: BODY.shin },
} as const;
