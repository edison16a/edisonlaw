import { createWheelStrokes, type WheelSample } from './wheelStrokes';

export interface GestureRead {
  /** True when the spiral takes the event, so the page must not scroll. */
  capture: boolean;
  /** The projects the spiral should turn: positive on, negative back, 0 for none. */
  step: number;
}

const PASS: GestureRead = { capture: false, step: 0 };

/**
 * Decides whether each wheel event belongs to the spiral or to the page. Pure,
 * so it is unit tested.
 *
 * Every stroke asks `capturable` once, as it starts, whether the spiral may
 * take it: the pointer is over the spiral and the stage is in full view. A
 * stroke the spiral took stays with it to the end of its momentum, even if
 * the pointer drifts onto the panel. A gesture that starts as a page scroll
 * stays one until the wheel goes idle, so a page scroll that glides up to the
 * top of the page never turns the spiral.
 */
export function createWheelGesture() {
  const strokes = createWheelStrokes();
  let owner: 'page' | 'spiral' | null = null;

  return {
    read(sample: WheelSample, capturable: () => boolean): GestureRead {
      const stroke = strokes.read(sample);
      if (stroke.idle) owner = null;
      if (owner === 'page') return PASS;
      if (owner === null || stroke.begins) owner = capturable() ? 'spiral' : 'page';
      if (owner === 'page') return PASS;
      return { capture: true, step: stroke.step };
    },
  };
}

export type WheelGesture = ReturnType<typeof createWheelGesture>;
