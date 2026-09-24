import { Color } from 'three';
import { clamp, lerp, smoothstep } from '@/lib/math';

/** The two ends of the gradient as sRGB values, blended in sRGB so the middle reads as an even blue. */
const NAVY = new Color().setRGB(0x0a / 255, 0x2b / 255, 0xb8 / 255);
const SKY = new Color().setRGB(0x8a / 255, 0xd8 / 255, 0xff / 255);
/** Navy is far darker than sky blue, so it glows harder to stay readable at the same strength. */
const NAVY_GAIN = 2.2;
/** How far the shimmer slides the gradient, as a share of the board. */
const DRIFT = 0.1;

/** A struck key flashes this pale, almost white blue. */
export const FLASH_BLUE = new Color('#e6f5ff');

/**
 * Writes the keyboard's blue at `across` (0 at the left edge, 1 at the right) into `target`, as linear light
 * scaled by `glow`. A slow shimmer slides the gradient back and forth and a soft band of brightness rolls
 * across the board, but the colour always stays between the navy and the sky blue.
 */
export function writeKeyboardBlue(target: Color, across: number, elapsed: number, glow: number) {
  const drift = DRIFT * (0.65 * Math.sin(elapsed * 0.55 + across * 4.2) + 0.35 * Math.sin(elapsed * 0.23 - across * 2.1));
  const t = smoothstep(0, 1, clamp(across + drift));
  const band = 0.84 + 0.16 * Math.sin((across * 1.3 - elapsed * 0.28) * Math.PI * 2);
  return target
    .copy(NAVY)
    .lerp(SKY, t)
    .convertSRGBToLinear()
    .multiplyScalar(glow * band * lerp(NAVY_GAIN, 1, t));
}
