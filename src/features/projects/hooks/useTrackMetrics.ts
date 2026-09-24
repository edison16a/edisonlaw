'use client';

import { useEffect, type RefObject } from 'react';
import { trackSpan } from '../spiral/track';
import { setStageMetrics } from '../state/stageMetrics';

/** Screens this wide show the panel beside the spiral, so the scene slides left to make room. */
const SIDE_PANEL_QUERY = '(min-width: 1024px)';

interface TrackRefs {
  track: RefObject<HTMLElement | null>;
  stage: RefObject<HTMLElement | null>;
  /** The detail panel's column on the right of the stage. */
  column: RefObject<HTMLElement | null>;
}

/**
 * Measures the scroll track and the sticky stage on mount and on every resize,
 * and publishes where the track starts, how much scroll one card takes and how
 * far the scene slides aside for the panel.
 */
export function useTrackMetrics({ track, stage, column }: TrackRefs, count: number) {
  useEffect(() => {
    const trackNode = track.current;
    const stageNode = stage.current;
    if (!trackNode || !stageNode) return;
    const sidePanel = window.matchMedia(SIDE_PANEL_QUERY);

    const measure = () => {
      const stickyTop = parseFloat(getComputedStyle(stageNode).top) || 0;
      const top = trackNode.getBoundingClientRect().top + window.scrollY - stickyTop;
      const perCard = (trackNode.offsetHeight - stageNode.offsetHeight) / trackSpan(count);
      const columnNode = column.current;
      // Centre the focused card in the space left of the panel.
      const focusShift = sidePanel.matches && columnNode ? (stageNode.clientWidth - columnNode.offsetLeft) / 2 : 0;
      setStageMetrics({ top, perCard, count, focusShift });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(trackNode);
    observer.observe(stageNode);
    sidePanel.addEventListener('change', measure);
    return () => {
      observer.disconnect();
      sidePanel.removeEventListener('change', measure);
    };
  }, [track, stage, column, count]);
}
