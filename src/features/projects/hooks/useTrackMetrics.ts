'use client';

import { useEffect, type RefObject } from 'react';
import { useLenis } from 'lenis/react';
import { scrollFromIndex, trackSpan } from '../spiral/track';
import { useSpiralStore } from '../state/spiralStore';
import { setStageMetrics, stageMetrics } from '../state/stageMetrics';

/** Screens this wide show the panel beside the spiral, so the scene slides left to make room. */
const SIDE_PANEL_QUERY = '(min-width: 1024px)';
/** Share of the way to the centre of the free space. A little less keeps the spiral from hugging the left. */
const SHIFT_SHARE = 0.8;
/** On narrower screens the panel sits at the bottom, so the scene rises by this share of the stage height. */
const LIFT_SHARE = 0.15;

interface TrackRefs {
  track: RefObject<HTMLElement | null>;
  stage: RefObject<HTMLElement | null>;
  /** The detail panel's column on the right of the stage. */
  column: RefObject<HTMLElement | null>;
}

/**
 * Measures the scroll track and the sticky stage on mount and on every resize,
 * and publishes where the track starts, how much scroll one card takes and how
 * far the scene slides aside, or up, for the panel. When a resize changes the
 * scroll a card takes, the page jumps back onto the card that was in focus, so
 * the spiral never rests between two cards with the panel closed.
 */
export function useTrackMetrics({ track, stage, column }: TrackRefs, count: number) {
  const lenis = useLenis();

  useEffect(() => {
    const trackNode = track.current;
    const stageNode = stage.current;
    if (!trackNode || !stageNode) return;
    const sidePanel = window.matchMedia(SIDE_PANEL_QUERY);

    const measure = () => {
      const stickyTop = parseFloat(getComputedStyle(stageNode).top) || 0;
      const top = trackNode.getBoundingClientRect().top + window.scrollY - stickyTop;
      const perCard = (trackNode.offsetHeight - stageNode.offsetHeight) / trackSpan(count);
      // The composition is centred, so half the panel's width puts the focused card
      // at the centre of the space left of the panel.
      const panelWidth = column.current?.offsetWidth ?? 0;
      const focusShift = sidePanel.matches ? (panelWidth / 2) * SHIFT_SHARE : 0;
      const focusLift = sidePanel.matches ? 0 : stageNode.clientHeight * LIFT_SHARE;
      const moved =
        stageMetrics.perCard > 0 &&
        (Math.abs(stageMetrics.top - top) > 0.5 || Math.abs(stageMetrics.perCard - perCard) > 0.5);
      setStageMetrics({ top, perCard, count, focusShift, focusLift });

      const card = useSpiralStore.getState().settled;
      if (!moved || card === null) return;
      const destination = scrollFromIndex(card, { top, perCard, count });
      if (lenis) lenis.scrollTo(destination, { immediate: true, force: true });
      else window.scrollTo({ top: destination });
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
  }, [track, stage, column, count, lenis]);
}
