'use client';

import { useEffect, type RefObject } from 'react';
import { setStageMetrics } from '../state/stageMetrics';
import { wakeSpiral } from '../state/spiralWake';

/** Screens this wide show the panel beside the spiral, so the scene slides left to make room. */
const SIDE_PANEL_QUERY = '(min-width: 1024px)';
/** Share of the way to the centre of the free space. A little less keeps the spiral from hugging the left. */
const SHIFT_SHARE = 0.8;
/** On narrower screens the panel sits at the bottom, so the scene rises by this share of the stage height. */
const LIFT_SHARE = 0.2;

/**
 * Measures the stage on mount and on every resize, and publishes how far the
 * scene slides aside, or up, to make room for the detail panel.
 */
export function useStageMetrics(stage: RefObject<HTMLElement | null>, column: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const stageNode = stage.current;
    if (!stageNode) return;
    const sidePanel = window.matchMedia(SIDE_PANEL_QUERY);

    const measure = () => {
      // The composition is centred, so half the panel's width puts the focused card
      // at the centre of the space left of the panel.
      const panelWidth = column.current?.offsetWidth ?? 0;
      setStageMetrics({
        focusShift: sidePanel.matches ? (panelWidth / 2) * SHIFT_SHARE : 0,
        focusLift: sidePanel.matches ? 0 : stageNode.clientHeight * LIFT_SHARE,
      });
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
