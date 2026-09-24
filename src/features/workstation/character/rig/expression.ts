import type { LimbName, Rig } from './types';

/** Blend shapes of the brow mesh, in the order of its morph targets. */
export const BROW_SHAPES = ['leftLift', 'rightLift', 'leftInner', 'rightInner'] as const;

/** Blend shapes of the mouth mesh, in the order of its morph targets. */
export const MOUTH_SHAPES = ['hmm', 'smile'] as const;

/** What the face is doing this frame, on top of blinking and gaze. */
export interface Expression {
  /** How far each brow lifts, 0 at rest to 1 fully raised. Negative values lower it a little. */
  browLift: Record<LimbName, number>;
  /** Inner ends of both brows up (positive, soft and pensive) or down (negative, focused). */
  browInner: number;
  /** 0 the resting smile, 1 a small flat "hmm" pulled toward his left. */
  hmm: number;
  /** 0 the resting smile, 1 a wider, happier one. */
  smile: number;
  /** Eyelids lowered a little, 0 to 1, on top of blinking. */
  squint: number;
}

export function createExpression(): Expression {
  return { browLift: { left: 0, right: 0 }, browInner: 0, hmm: 0, smile: 0, squint: 0 };
}

/** Writes the brow and mouth blend weights. Eyelids are handled with the blink. */
export function applyExpression(rig: Rig, expression: Expression) {
  rig.brows[0] = expression.browLift.left;
  rig.brows[1] = expression.browLift.right;
  rig.brows[2] = expression.browInner;
  rig.brows[3] = expression.browInner;
  rig.mouth[0] = expression.hmm;
  rig.mouth[1] = expression.smile * (1 - expression.hmm);
}
