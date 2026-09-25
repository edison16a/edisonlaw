'use client';

import { useEffect, type RefObject } from 'react';
import { rowSpace } from '../gallery/rowSize';
import { fitAbovePanel, focusCardRect, shiftForPanel } from '../spiral/anchor';
import { setStageMetrics } from '../state/stageMetrics';
import { wakeSpiral } from '../state/spiralWake';

/** Screens this wide show the panel beside the spiral, so the scene slides left to make room. */
export const SIDE_PANEL_QUERY = '(min-width: 1024px)';
/** Share of the way to the centre of the free space. A little less keeps the spiral from hugging the left. */
const SHIFT_SHARE = 0.8;
/** On narrower screens the panel sits at the bottom, so the scene rises by this share of the stage height. */
const LIFT_SHARE = 0.2;

/** Top of the panel's details in the stage, or null between two projects, while the panel is empty. */
function detailsTop(column: HTMLElement | null) {
  const details = column?.firstElementChild;
  return column && details instanceof HTMLElement ? column.offsetTop + details.offsetTop : null;
}

/**
 * Measures the stage on mount, on every resize and whenever the panel's
 * details change. It publishes how far the scene slides aside, or up, to make
 * room for the detail panel, and where the focused card lands as CSS
 * variables on the stage, so the step buttons can sit inside its sides and
 * the screenshot row right under it: --card-left, --card-right, --card-middle
 * and --card-bottom, in pixels.
 *
 * Where the panel stacks below the spiral, the focused card and the row have
 * to fit above it. Details differ in height from project to project, so the
 * scene makes room for the tallest seen at this stage size, rising and, on
 * short stages, shrinking to fit. It does not bob back between projects.
 */
export function useStageMetrics(stage: RefObject<HTMLElement | null>, column: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const stageNode = stage.current;
    if (!stageNode) return;
    const sidePanel = window.matchMedia(SIDE_PANEL_QUERY);
    let panelTop: number | null = null;
    let measuredFor = '';

    const measure = () => {
      const width = stageNode.clientWidth;
      const height = stageNode.clientHeight;
      if (width === 0 || height === 0) return;
      const panel = column.current;
      const layout = `${width}x${height}x${sidePanel.matches}`;
      if (layout !== measuredFor) panelTop = null;
      measuredFor = layout;

      // The composition is centred, so half the panel's width puts the focused card
      // at the centre of the space left of the panel. On short or narrow stages it
      // slides a little further, so the card never comes too close to the panel.
      let focusShift = 0;
      let focusLift = 0;
      let focusZoom = 1;
      if (sidePanel.matches) {
        if (panel) focusShift = shiftForPanel(width, height, panel.offsetLeft, (panel.offsetWidth / 2) * SHIFT_SHARE);
      } else {
        const top = detailsTop(panel);
        if (top !== null) panelTop = Math.min(panelTop ?? top, top);
        focusLift = height * LIFT_SHARE;
        if (panelTop !== null) {
          const room = (cardWidth: number) => rowSpace(cardWidth, window.innerHeight);
          ({ lift: focusLift, zoom: focusZoom } = fitAbovePanel(width, height, panelTop, focusLift, room));
        }
      }
      setStageMetrics({ focusShift, focusLift, focusZoom });

      const card = focusCardRect(width, height, focusShift, focusLift, focusZoom);
      stageNode.style.setProperty('--card-left', `${card.left.toFixed(1)}px`);
      stageNode.style.setProperty('--card-right', `${card.right.toFixed(1)}px`);
      stageNode.style.setProperty('--card-middle', `${((card.top + card.bottom) / 2).toFixed(1)}px`);
      stageNode.style.setProperty('--card-bottom', `${card.bottom.toFixed(1)}px`);
      wakeSpiral();
    };

    measure();
    // The column grows and shrinks as the details of each project come and go.
    const observer = new ResizeObserver(measure);
    observer.observe(stageNode);
    if (column.current) observer.observe(column.current);
    sidePanel.addEventListener('change', measure);
    return () => {
      observer.disconnect();
      sidePanel.removeEventListener('change', measure);
    };
  }, [stage, column]);
}
