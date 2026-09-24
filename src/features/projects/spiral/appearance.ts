/**
 * How a card looks at a given distance from focus. Pure curves, read every frame.
 * `offset` is the card index minus the continuous index: negative cards have passed.
 */

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** 0 is sharp, 1 is the widest blur. Passed cards blur faster, they are close to the lens. */
export function cardBlur(offset: number) {
  return offset >= 0 ? smoothstep(0.04, 1.8, offset) : smoothstep(0.04, 1.1, -offset);
}

/** Brightness multiplier: full in focus, dimmer on the strand, fading into the distance. */
export function cardBrightness(offset: number) {
  const distance = Math.abs(offset);
  const strand = 1 - 0.58 * smoothstep(0, 1.1, distance);
  const fog = 1 - 0.55 * smoothstep(2, 8, offset);
  return strand * fog;
}

/** Fades cards out as they sweep past the camera and as they vanish into the distance. */
export function cardOpacity(offset: number) {
  return smoothstep(-2.5, -1.55, offset) * (1 - smoothstep(7.5, 10.5, offset));
}

/**
 * Bend of a card, in radians at its edge. Grows with distance from focus and
 * with speed, and relaxes flat in the focus slot.
 */
export function cardBend(offset: number, velocity: number) {
  const distance = smoothstep(0, 1.4, Math.abs(offset));
  const speed = Math.min(1, Math.abs(velocity) / 6);
  return 0.34 * distance + 0.3 * speed;
}
