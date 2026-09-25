/**
 * How far, in pixels, an event may be off a whole number of notches and still
 * be notches. A mouse wheel moves the same amount every notch, and a busy page
 * that merges notches into one event adds them up exactly, however many, while
 * a trackpad's travel changes from event to event. So the slack stays this
 * small whatever the count: it only has to cover rounding.
 */
const NOTCH_SLACK = 0.1;

/**
 * How many whole notches of `notch` pixels an event of `size` pixels is, or 0
 * when it is not a whole number of them. Pure, so it is unit tested.
 */
export function notchesIn(size: number, notch: number) {
  const count = Math.round(size / notch);
  return count >= 1 && Math.abs(size - count * notch) <= NOTCH_SLACK ? count : 0;
}
