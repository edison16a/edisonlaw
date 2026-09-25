import { SRGBColorSpace, type Color } from 'three';
import { clamp, wrap } from '@/lib/math';

/** Full hue cycles per second. One lap takes about 26 seconds. */
const HUE_SPEED = 1 / 26;
/** Hue shown when motion is reduced, and the one the stills are captured at: a calm violet. */
export const FROZEN_HUE = 0.74;
/** The cycle lingers around this hue (violet) and hurries through the opposite side (green). */
const FAVOURED_HUE = 0.76;
/** 0 is an even cycle. 0.6 spends four times longer at the favoured hue than at its opposite. */
const LINGER = 0.6;

/**
 * One hue clock shared by every glowing RGB part in a scene (the tower's fans and light bars, the desk
 * strip), so they all cycle together. Consumers call `sample` with the frame time first; repeated calls
 * in the same frame are free.
 * The clock only moves the hue and has no brightness of its own. writeRgb only partly evens out
 * brightness between hues, so a glowing part still reads brighter at yellow than at blue. No room
 * light reads the clock.
 */
export interface RgbClock {
  /** 0 to 1, the hue at the last sampled time. */
  readonly hue: number;
  sample(elapsed: number): void;
  /** True holds a still hue, for reduced motion. */
  setFrozen(frozen: boolean): void;
}

/**
 * Maps an evenly advancing phase to a hue that still covers the whole wheel but slows down
 * around violet, blue and magenta, where the room looks best.
 */
function warpHue(phase: number) {
  const offset = phase - FAVOURED_HUE;
  return wrap(phase - (LINGER * Math.sin(2 * Math.PI * offset)) / (2 * Math.PI), 0, 1);
}

export function createRgbClock(frozen = false): RgbClock {
  let lastElapsed = Number.NaN;

  const clock = {
    hue: FROZEN_HUE,
    frozen,
    sample(elapsed: number) {
      if (elapsed === lastElapsed) return;
      lastElapsed = elapsed;
      clock.hue = clock.frozen ? FROZEN_HUE : warpHue(0.62 + elapsed * HUE_SPEED);
    },
    setFrozen(value: boolean) {
      clock.frozen = value;
    },
  };
  return clock;
}

/** Relative luminance of a linear colour. */
export function luminance(color: Color) {
  return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
}

/** Brightness every hue is balanced toward, as relative luminance. */
const BALANCE_TARGET = 0.25;
/** Keeps dark hues like blue from being boosted too far. */
const BALANCE_FLOOR = 0.1;

/**
 * Pure green and yellow look many times brighter than blue at the same strength.
 * This gain evens that out halfway (a square root), so the glowing parts keep a similar mood
 * as the hue cycles without every colour looking the same.
 */
function perceptualGain(color: Color) {
  return Math.sqrt(BALANCE_TARGET / (luminance(color) + BALANCE_FLOOR));
}

/**
 * Writes a saturated RGB colour for `hue` into `target`, scaled by `intensity` and balanced
 * for perceived brightness. `intensity` above 1 pushes the colour into bloom range.
 * The glowing parts call it with the clock's hue. The room lights call it once, at the resting violet.
 */
export function writeRgb(target: Color, hue: number, intensity = 1, saturation = 1, lightness = 0.5) {
  target.setHSL(wrap(hue, 0, 1), saturation, clamp(lightness), SRGBColorSpace);
  return target.multiplyScalar(intensity * perceptualGain(target));
}
