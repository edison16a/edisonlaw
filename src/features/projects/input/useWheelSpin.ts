'use client';

import { useEffect, type RefObject } from 'react';
import { isStageHome } from './stageHome';
import { spinBy } from './steering';

/** Wheel travel, in pixels, that turns the spiral by one card. */
const PIXELS_PER_CARD = 420;
/** Pixels in one line, for mice that report the wheel in lines. */
const LINE_PIXELS = 16;
/** A pause this long between wheel events starts a new gesture. Trackpad momentum never pauses this long. */
const GESTURE_GAP_MS = 220;

function wheelPixels(event: WheelEvent) {
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return delta * LINE_PIXELS;
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return delta * window.innerHeight;
  return delta;
}

/**
 * While the stage fills the viewport, the wheel and the trackpad spin the
 * spiral and the page stands still. The listener runs first, in the capture
 * phase on the window, and stops the event there, so Lenis never scrolls the
 * page for it.
 *
 * Each gesture belongs to whoever it started with. Momentum from a scroll up
 * out of Work Experience carries the page home and stops there, and only the
 * next gesture spins the spiral.
 */
export function useWheelSpin(stage: RefObject<HTMLElement | null>) {
  useEffect(() => {
    let lastWheelAt = -Infinity;
    let spiralOwnsGesture = false;

    const onWheel = (event: WheelEvent) => {
      // A pinch on a trackpad arrives as a wheel with ctrl held. That is the browser's zoom.
      if (event.ctrlKey) return;
      const home = isStageHome(stage.current);
      if (event.timeStamp - lastWheelAt > GESTURE_GAP_MS) spiralOwnsGesture = home;
      lastWheelAt = event.timeStamp;
      if (!spiralOwnsGesture || !home) return;
      event.preventDefault();
      event.stopPropagation();
      spinBy(wheelPixels(event) / PIXELS_PER_CARD);
    };

    window.addEventListener('wheel', onWheel, { capture: true, passive: false });
    return () => window.removeEventListener('wheel', onWheel, { capture: true });
  }, [stage]);
}
