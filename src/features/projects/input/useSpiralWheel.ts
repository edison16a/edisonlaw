'use client';

import { useEffect, type RefObject } from 'react';
import { isZoomWheel } from '@/lib/zoomWheel';
import { SIDE_PANEL_QUERY } from '../hooks/useStageMetrics';
import { WHEEL_LEAD } from '../spiral/loop';
import { useSpiralStore } from '../state/spiralStore';
import { stepSpiral } from './steering';
import { createWheelGesture } from './wheelGesture';
import { sampleOf } from './wheelSample';
import { overSpiral, stageInFullView, type Box } from './wheelZone';

/** The navbar's bottom edge. The page keeps that much clear at the top as scroll padding. */
function navBottom() {
  return parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
}

/**
 * The mouse wheel and trackpad turn the spiral while the pointer is over it:
 * one project per stroke, round and round forever, and the page stays put.
 * Every notch of a quick spin counts, up to WHEEL_LEAD projects ahead.
 * Down, or a swipe to the left, brings the next project. Over the detail
 * panel, and whenever the stage is not in full view, the wheel scrolls the
 * page as usual. Pinches, and the wheel with ctrl or Cmd held, still zoom.
 *
 * It listens on the window before anything else, so it also sees page scrolls
 * that begin elsewhere and glide up to the spiral, and it stops the events it
 * takes before Lenis, which listens on the window too, can scroll with them.
 */
export function useSpiralWheel(stage: RefObject<HTMLElement | null>, column: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const gesture = createWheelGesture();
    const beside = window.matchMedia(SIDE_PANEL_QUERY);
    // How far the panel below the spiral rises from the bottom of the stage. It is
    // kept for the moments between two projects, when the panel is empty.
    let panelRise: number | null = null;

    const panelBox = (stageBox: Box): Box | null => {
      const node = column.current;
      if (!node) return null;
      if (beside.matches) return node.getBoundingClientRect();
      const content = node.firstElementChild;
      if (content) panelRise = stageBox.bottom - content.getBoundingClientRect().top;
      return panelRise === null ? null : { ...stageBox, top: stageBox.bottom - panelRise };
    };

    const capturable = (event: WheelEvent) => {
      const node = stage.current;
      if (!node || !useSpiralStore.getState().ready) return false;
      if (!(event.target instanceof Node) || !node.contains(event.target)) return false;
      const box = node.getBoundingClientRect();
      if (!stageInFullView(box, navBottom(), window.innerHeight)) return false;
      return overSpiral(event.clientX, event.clientY, box, panelBox(box), beside.matches);
    };

    const onWheel = (event: WheelEvent) => {
      if (isZoomWheel(event)) return;
      const read = gesture.read(sampleOf(event), () => capturable(event));
      if (!read.capture) return;
      event.preventDefault();
      event.stopPropagation();
      if (read.step !== 0) stepSpiral(read.step, WHEEL_LEAD);
    };

    window.addEventListener('wheel', onWheel, { passive: false, capture: true });
    return () => window.removeEventListener('wheel', onWheel, { capture: true });
  }, [stage, column]);
}
