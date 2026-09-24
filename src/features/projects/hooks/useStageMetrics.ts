'use client';

import { useEffect, type RefObject } from 'react';
import { focusCardRect } from '../spiral/anchor';
import { setStageMetrics } from '../state/stageMetrics';
import { wakeSpiral } from '../state/spiralWake';

/** Screens this wide show the panel beside the spiral, so the scene slides left to make room. */
const SIDE_PANEL_QUERY = '(min-width: 1024px)';
/** Share of the way to the centre of the free space. A little less keeps the spiral from hugging the left. */
const SHIFT_SHARE = 0.8;
/** On narrower screens the panel sits at the bottom, so the scene rises by this share of the stage height. */
const LIFT_SHARE = 0.2;

/**
 * Measures the stage on mount and on every resize. It publishes how far the
 * scene slides aside, or up, to make room for the detail panel, and where the
 * focused card lands as CSS variables on the stage, so the arrows can sit
 * right beside it: --card-left, --card-right and --card-middle, in pixels.
 */
export function useStageMetrics(stage: RefObject<HTMLElement | null>, column: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const stageNode = stage.current;
    if (!stageNode) return;
    const sidePanel = window.matchMedia(SIDE_PANEL_QUERY);

    const measure = () => {
      const width = stageNode.clientWidth;
      const height = stageNode.clientHeight;
      if (width === 0 || height === 0) return;
      // The composition is centred, so half the panel's width puts the focused card
      // at the centre of the space left of the panel.
      const panelWidth = column.current?.offsetWidth ?? 0;
      const focusShift = sidePanel.matches ? (panelWidth / 2) * SHIFT_SHARE : 0;
      const focusLift = sidePanel.matches ? 0 : height * LIFT_SHARE;
      setStageMetrics({ focusShift, focusLift });

      const card = focusCardRect(width, height, focusShift, focusLift);
      stageNode.style.setProperty('--card-left', `${card.left.toFixed(1)}px`);
      stageNode.style.setProperty('--card-right', `${card.right.toFixed(1)}px`);
      stageNode.style.setProperty('--card-middle', `${((card.top + card.bottom) / 2).toFixed(1)}px`);
      wakeSpiral();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stageNode);
    sidePanel.addEventListener('change', measure);
    return () => {
      observer.disconnect();
      sidePanel.removeEventListener('change', measure);
    };
  }, [stage, column]);
}
