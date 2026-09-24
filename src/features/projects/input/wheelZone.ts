/**
 * Where the spiral may take the mouse wheel. Pure, so it is unit tested. All
 * boxes are in viewport pixels, as getBoundingClientRect reports them.
 */

export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** How far, in pixels, the stage may sit off its place under the navbar and still count as in full view. */
export const FULL_VIEW_SLACK = 4;

/**
 * True when the point `x`, `y` is over the spiral: on the stage and clear of
 * the detail panel. The panel sits `beside` the spiral on wide screens, so
 * everything from its left edge on is the panel's. Below the spiral, on
 * narrower screens, everything from its top edge down is. With no panel the
 * whole stage is the spiral.
 */
export function overSpiral(x: number, y: number, stage: Box, panel: Box | null, beside: boolean) {
  const onStage = x >= stage.left && x < stage.right && y >= stage.top && y < stage.bottom;
  if (!onStage || !panel) return onStage;
  return beside ? x < panel.left : y < panel.top;
}

/**
 * True when the whole stage is on screen between `top`, the navbar's bottom
 * edge, and `bottom`, the bottom of the window. Only then may the spiral take
 * the wheel, so it never holds the page while the stage is partly scrolled away.
 */
export function stageInFullView(stage: Box, top: number, bottom: number, slack = FULL_VIEW_SLACK) {
  return stage.top >= top - slack && stage.bottom <= bottom + slack;
}
