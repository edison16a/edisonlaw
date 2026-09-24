import type { TrackMetrics } from '../spiral/track';

/**
 * Measurements of the sticky stage, written by the stage on resize and read by
 * the scene every frame. Mutable on purpose, like the spiral motion.
 */
export interface StageMetrics extends TrackMetrics {
  /** How far left the scene slides so the detail panel fits on the right, in CSS pixels. */
  focusShift: number;
  /** How far up the scene slides when the panel sits below it instead, in CSS pixels. */
  focusLift: number;
}

export const stageMetrics: StageMetrics = {
  top: 0,
  perCard: 0,
  count: 0,
  focusShift: 0,
  focusLift: 0,
};

export function setStageMetrics(next: Partial<StageMetrics>) {
  Object.assign(stageMetrics, next);
}
