/** One wheel event, as the wheel logic reads it. */
export interface WheelSample {
  /** Travel as the event reports it. Positive is to the right and down. */
  dx: number;
  dy: number;
  /** The event's deltaMode: 0 for pixels, 1 for lines, 2 for pages. */
  mode: number;
  /** When the event happened, in milliseconds. */
  time: number;
}

/**
 * The sample for a wheel event. Firefox keeps a mouse wheel's lines only for
 * a page that reads deltaMode before the deltas, and hands everyone else
 * pixels, so deltaMode comes first here.
 */
export function sampleOf(event: Pick<WheelEvent, 'deltaMode' | 'deltaX' | 'deltaY' | 'timeStamp'>): WheelSample {
  const mode = event.deltaMode;
  return { dx: event.deltaX, dy: event.deltaY, mode, time: event.timeStamp };
}
