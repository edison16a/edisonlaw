import type { Group } from 'three';

/** 1 is his left (+X in his own space), -1 is his right. */
export type Side = 1 | -1;

export type LimbName = 'left' | 'right';

/** A two bone chain. Every bone hangs along its own -Y and bends around its own X. */
export interface LimbRig {
  /** Shoulder or hip joint. Only ever moved, never rotated, so IK can work in its space. */
  base: Group;
  upper: Group;
  lower: Group;
  /** Hand or foot, pivoting at the wrist or ankle. */
  end: Group;
}

export interface ArmRig extends LimbRig {
  /** Knuckles of the index, middle, ring and little fingers. Positive X rotation curls toward the palm. */
  fingers: Group[];
  /** Middle joint of each finger, a child of its knuckle, curling the same way. */
  fingerTips: Group[];
  thumb: Group;
  /** Which way the thumb sits in the hand bone's space: 1 is +X. */
  thumbSide: Side;
}

export interface Rig {
  pelvis: Group;
  /** Bends at the waist. */
  spine: Group;
  /** Upper body: shirt, shoulders and neck ride on it. */
  chest: Group;
  neck: Group;
  head: Group;
  /** Left then right. Scaled on Y to blink. */
  eyes: [Group, Group];
  /** Slides each eye across the face to show where he looks. */
  gazes: [Group, Group];
  /** Catch lights of each eye, hidden while the eye is shut. */
  shines: [Group, Group];
  /** Blend shape weights of the brows, shared with their mesh. See BROW_SHAPES in expression.ts. */
  brows: number[];
  /** Blend shape weights of the mouth, shared with its mesh. See MOUTH_SHAPES in expression.ts. */
  mouth: number[];
  arms: Record<LimbName, ArmRig>;
  legs: Record<LimbName, LimbRig>;
}
