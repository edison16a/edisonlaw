import { damp } from '@/lib/math';
import type { StageMetrics } from '../state/stageMetrics';

/** The lift and zoom the lens draws with this frame. */
export interface LensView {
  lift: number;
  zoom: number;
}

/** How quickly the lens follows a new lift or zoom, roughly one over seconds. */
const EASE_RATE = 8;
/** Closer than these, the lens counts as there. */
const LIFT_CLOSE = 0.25;
const ZOOM_CLOSE = 0.0005;

export function createLensView(metrics: StageMetrics): LensView {
  return { lift: metrics.focusLift, zoom: metrics.focusZoom };
}

/**
 * Eases `view` toward the stage's lift and zoom, so the scene glides when a
 * taller panel below it makes it rise or shrink. With `instant`, for reduced
 * motion, it jumps. Mutates `view`. Returns true while it is still on its way.
 */
export function easeLensView(view: LensView, metrics: StageMetrics, delta: number, instant: boolean) {
  if (!instant) {
    view.lift = damp(view.lift, metrics.focusLift, EASE_RATE, delta);
    view.zoom = damp(view.zoom, metrics.focusZoom, EASE_RATE, delta);
  }
  const close = Math.abs(view.lift - metrics.focusLift) < LIFT_CLOSE && Math.abs(view.zoom - metrics.focusZoom) < ZOOM_CLOSE;
  if (!instant && !close) return true;
  view.lift = metrics.focusLift;
  view.zoom = metrics.focusZoom;
  return false;
}
