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
 * Moves `state` toward `target` over roughly `smoothTime` seconds, never
 * faster than about `maxSpeed` units per second, so a far target is reached at
 * a steady pace instead of in a rush. Mutates `state` in place so the render
 * loop allocates nothing.
 */
export function stepSpring(state: SpringState, target: number, smoothTime: number, delta: number, maxSpeed = Infinity) {
  if (delta <= 0) return state;
  const time = Math.max(0.0001, smoothTime);
  const omega = 2 / time;
  const x = omega * delta;
  const decay = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  // Chasing a point at most this far ahead is what caps the speed.
  const reach = maxSpeed * time;
  const change = Math.min(reach, Math.max(-reach, state.value - target));
  const goal = state.value - change;
  const temp = (state.velocity + omega * change) * delta;
  let next = goal + (change + temp) * decay;
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
