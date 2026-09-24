import { lerp } from '@/lib/math';
import type { Look, LookSet } from './look';
import { hash01, smootherstep } from './timeline';

const SCAN = {
  /** Average seconds his eyes rest on one spot. */
  period: 1.9,
  /** Latest a hop can start within its slot, in seconds, so the rhythm is uneven. */
  jitter: 0.8,
  /** Seconds for the eyes to hop to a new spot, and for the head to follow. */
  eyeSettle: 0.16,
  headSettle: 1.1,
  /** How far a spot wanders from the middle of its screen, in radians. */
  spread: { yaw: 0.13, pitch: 0.08 },
} as const;

/** Share of each look the head turns through. */
const HEAD_SHARE = 0.75;

const from: Look = { yaw: 0, pitch: 0 };
const to: Look = { yaw: 0, pitch: 0 };

/** The spot on the screens he reads during hop `index`: mostly the centre screen, sometimes a side one. */
function spot(index: number, seed: number, looks: LookSet, out: Look) {
  const pick = hash01(index, seed);
  const screen = pick < 0.46 ? looks.center : pick < 0.76 ? looks.left : looks.right;
  out.yaw = screen.yaw + (hash01(index, seed + 1) - 0.5) * SCAN.spread.yaw;
  out.pitch = screen.pitch + (hash01(index, seed + 2) - 0.5) * SCAN.spread.pitch;
  return out;
}

const hopStart = (index: number, seed: number) => index * SCAN.period + hash01(index, seed + 3) * SCAN.jitter;

/**
 * Eyes hopping between spots on the monitors while the head follows more slowly.
 * Pure function of time. Writes where the eyes and the head point.
 */
export function scanScreens(t: number, seed: number, looks: LookSet, eyes: Look, head: Look) {
  let index = Math.floor(t / SCAN.period);
  if (t < hopStart(index, seed)) index -= 1;
  const since = t - hopStart(index, seed);
  spot(index - 1, seed, looks, from);
  spot(index, seed, looks, to);
  const eye = smootherstep(0, SCAN.eyeSettle, since);
  const follow = smootherstep(0, SCAN.headSettle, since);
  eyes.yaw = lerp(from.yaw, to.yaw, eye);
  eyes.pitch = lerp(from.pitch, to.pitch, eye);
  // The head turns most of the way from the centre screen toward the spot, the eyes do the rest.
  head.yaw = lerp(looks.center.yaw, lerp(from.yaw, to.yaw, follow), HEAD_SHARE);
  head.pitch = lerp(looks.center.pitch, lerp(from.pitch, to.pitch, follow), HEAD_SHARE);
}
