/**
 * Measurements of the stage, written by the stage on resize and read by the
 * scene every frame. Mutable on purpose, like the spiral motion.
 */
export interface StageMetrics {
  /** How far left the scene slides so the detail panel fits on the right, in CSS pixels. */
  focusShift: number;
  /** How far up the scene slides when the panel sits below it instead, in CSS pixels. */
  focusLift: number;
  /** How far the scene shrinks where the panel below it leaves too little room, 1 for not at all. */
  focusZoom: number;
}

export const stageMetrics: StageMetrics = {
  focusShift: 0,
  focusLift: 0,
  focusZoom: 1,
};

export function setStageMetrics(next: Partial<StageMetrics>) {
  Object.assign(stageMetrics, next);
}
