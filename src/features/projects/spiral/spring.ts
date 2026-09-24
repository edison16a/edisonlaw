/**
 * Critically damped spring (the classic SmoothDamp). It eases in and out and
 * never overshoots, which is what makes the spiral feel heavy but calm.
 */

export interface SpringState {
  value: number;
  /** Units per second. */
  velocity: number;
}

/**
 * Moves `state` toward `target` over roughly `smoothTime` seconds.
 * Mutates `state` in place so the render loop allocates nothing.
 */
export function stepSpring(state: SpringState, target: number, smoothTime: number, delta: number) {
  if (delta <= 0) return state;
  const omega = 2 / Math.max(0.0001, smoothTime);
  const x = omega * delta;
  const decay = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const change = state.value - target;
  const temp = (state.velocity + omega * change) * delta;
  let next = target + (change + temp) * decay;
  let velocity = (state.velocity - omega * temp) * decay;

  // Never pass the target: stop exactly on it instead.
  if (target - state.value > 0 === next > target) {
    next = target;
    velocity = 0;
  }

  state.value = next;
  state.velocity = velocity;
  return state;
}
