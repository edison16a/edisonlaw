import { SRGBColorSpace, type Color } from 'three';
import { clamp, wrap } from '@/lib/math';

/** Full hue cycles per second. One lap takes about 26 seconds. */
const HUE_SPEED = 1 / 26;
/** Hue shown when motion is reduced: a calm violet. */
const FROZEN_HUE = 0.74;
/** The cycle lingers around this hue (violet) and hurries through the opposite side (green). */
const FAVOURED_HUE = 0.76;
/** 0 is an even cycle. 0.6 spends four times longer at the favoured hue than at its opposite. */
const LINGER = 0.6;
/** Length of the pulse surge, in seconds. */
export const PULSE_DURATION = 0.7;
/** Extra brightness at the peak of a pulse, so the peak reads 1.8x. */
export const PULSE_GAIN = 0.8;

/**
 * One hue clock shared by everything RGB in a scene (tower, strips, keyboard, lights),
 * so they all cycle together. Consumers call `sample` with the frame time first;
 * repeated calls in the same frame are free.
 */
export interface RgbClock {
  /** 0 to 1, the hue at the last sampled time. */
  readonly hue: number;
  /** Brightness multiplier. 1 at rest, up to 1 + PULSE_GAIN during a pulse. */
  readonly boost: number;
  sample(elapsed: number): void;
  /** True holds a still hue and ignores pulses, for reduced motion. */
  setFrozen(frozen: boolean): void;
  /** Starts a pulse at the next sampled frame. */
  pulse(): void;
}

/**
 * Maps an evenly advancing phase to a hue that still covers the whole wheel but slows down
 * around violet, blue and magenta, where the room looks best.
 */
export function warpHue(phase: number) {
  const offset = phase - FAVOURED_HUE;
  return wrap(phase - (LINGER * Math.sin(2 * Math.PI * offset)) / (2 * Math.PI), 0, 1);
}

/** Eased bump from 0 up to 1 and back to 0 over `progress` 0 to 1. */
export function pulseEnvelope(progress: number) {
  if (progress <= 0 || progress >= 1) return 0;
  const s = Math.sin(Math.PI * progress);
  return s * s;
}

export function createRgbClock(frozen = false): RgbClock {
  let lastElapsed = Number.NaN;
  let pulseStart = Number.NEGATIVE_INFINITY;
  let pulsePending = false;

  const clock = {
    hue: FROZEN_HUE,
    boost: 1,
    frozen,
    sample(elapsed: number) {
      if (elapsed === lastElapsed) return;
      lastElapsed = elapsed;
      if (pulsePending) {
        pulseStart = elapsed;
        pulsePending = false;
      }
      clock.hue = clock.frozen ? FROZEN_HUE : warpHue(0.62 + elapsed * HUE_SPEED);
      clock.boost = 1 + PULSE_GAIN * pulseEnvelope((elapsed - pulseStart) / PULSE_DURATION);
    },
    pulse() {
      if (!clock.frozen) pulsePending = true;
    },
    setFrozen(value: boolean) {
      clock.frozen = value;
    },
  };
  return clock;
}

/** Brightness every hue is balanced toward, as relative luminance. */
const BALANCE_TARGET = 0.25;
/** Keeps dark hues like blue from being boosted too far. */
const BALANCE_FLOOR = 0.1;

/**
 * Pure green and yellow look many times brighter than blue at the same strength.
 * This gain evens that out halfway (a square root), so the room keeps a similar mood
 * as the hue cycles without every colour looking the same.
 */
function perceptualGain(color: Color) {
  const luminance = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
  return Math.sqrt(BALANCE_TARGET / (luminance + BALANCE_FLOOR));
}

/**
 * Writes a saturated RGB colour for `hue` into `target`, scaled by `intensity` and balanced
 * for perceived brightness. `intensity` above 1 pushes the colour into bloom range.
 */
export function writeRgb(target: Color, hue: number, intensity = 1, saturation = 1, lightness = 0.5) {
  target.setHSL(wrap(hue, 0, 1), saturation, clamp(lightness), SRGBColorSpace);
  return target.multiplyScalar(intensity * perceptualGain(target));
}
