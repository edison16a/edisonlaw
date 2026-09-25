import { Color, SRGBColorSpace } from 'three';
import { describe, expect, it } from 'vitest';
import { RGB_ROOM_LIGHTS, SCREEN_LIGHT } from '../../lighting/roomLights';
import { TONE } from '../dimensions';
import { toneColor } from '../geometry/paint';
import type { CoatLight } from '../materials';
import { SLEEPING_PLACEMENT } from './placement';

/** Hue of a linear colour as shown on screen, in degrees from -180 to 180: below 0 is pink toward magenta. */
function hue(color: Color) {
  const hsl = { h: 0, s: 0, l: 0 };
  color.getHSL(hsl, SRGBColorSpace);
  return hsl.h > 0.5 ? (hsl.h - 1) * 360 : hsl.h * 360;
}

/** A coat tone lit by `light`, as the fur shades it: the colour times the light, and times the balance and fill when kept. */
function lit(tone: number, light: Color, coat?: CoatLight) {
  const color = toneColor(tone, new Color());
  if (!coat) return color.multiply(light);
  return color.multiply(new Color().setRGB(...coat.balance)).multiply(light.clone().add(new Color().setRGB(...coat.fill)));
}

describe("the sleeping dog's coat light", () => {
  const coat = SLEEPING_PLACEMENT.coatLight;
  // Where it lies: the tower's violet spill, with a little of the screens' cool white.
  const spill = RGB_ROOM_LIGHTS[0].color.clone().multiplyScalar(0.5).add(SCREEN_LIGHT.color.clone().multiplyScalar(0.15));

  it("keeps its gold warm in the tower's violet spill, where it would read pink", () => {
    expect(coat).toBeDefined();
    for (const tone of [TONE.saddle, TONE.coat, TONE.light]) {
      expect(hue(lit(tone, spill, coat))).toBeGreaterThan(hue(lit(tone, spill)) + 8);
      expect(hue(lit(tone, spill, coat))).toBeGreaterThan(0);
    }
  });

  it('never turns any tone green or pink in plain white light', () => {
    for (const tone of Object.values(TONE)) {
      const kept = hue(lit(tone, new Color(1, 1, 1), coat));
      expect(kept).toBeGreaterThan(25);
      expect(kept).toBeLessThan(60);
    }
  });
});
