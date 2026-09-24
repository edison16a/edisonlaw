import { sound } from '@/features/sound';

/** Hovers closer together than this share one tick, so sweeping across cards stays quiet. */
const GAP_MS = 90;

let lastAt = -Infinity;

/** The quiet hover tick, throttled. */
export function playHover() {
  const now = performance.now();
  if (now - lastAt < GAP_MS) return;
  lastAt = now;
  sound.play('hover');
}
