/** How far, in pixels, the section may sit from the top of the page and still count as in place. */
const TOLERANCE = 2;

/**
 * True while the spiral stage fills the viewport under the navbar: its
 * section starts at the top of the viewport and the stage is on screen. Only
 * then do the wheel, touch drags and arrow keys turn the spiral instead of the page.
 */
export function isStageHome(stage: HTMLElement | null) {
  const section = stage?.closest('section');
  if (!stage || !section || stage.offsetHeight === 0) return false;
  return Math.abs(section.getBoundingClientRect().top) <= TOLERANCE;
}
