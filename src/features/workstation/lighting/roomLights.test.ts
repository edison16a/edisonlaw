import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Color } from 'three';
import { describe, expect, expectTypeOf, it } from 'vitest';
import type { WorkstationStageProps } from '../WorkstationStage';
import type { DeskSceneProps } from '../scene/DeskScene';
import { createRgbClock, FROZEN_HUE, luminance, writeRgb } from './rgbClock';
import { RGB_ROOM_LIGHTS, SCREEN_LIGHT } from './roomLights';

describe('room lights', () => {
  it('take nothing from the timeline: the only thing an entry changes on the stage is the centre picture', () => {
    expectTypeOf<keyof WorkstationStageProps>().toEqualTypeOf<'variant' | 'centerScreen' | 'className'>();
    expectTypeOf<DeskSceneProps>().not.toHaveProperty('pulseKey');
  });

  it('give every monitor one fixed cool white, whatever it shows', () => {
    expect(SCREEN_LIGHT.intensity).toBe(4);
    expect(SCREEN_LIGHT.color.b).toBeGreaterThan(SCREEN_LIGHT.color.r);
    expect(luminance(SCREEN_LIGHT.color) * SCREEN_LIGHT.intensity).toBeGreaterThan(3);
  });

  it('hold every RGB light on its resting violet, at the peak the old entry pulse reached', () => {
    for (const light of RGB_ROOM_LIGHTS) {
      const plain = writeRgb(new Color(), FROZEN_HUE + light.hueOffset, 1, light.saturation);
      expect(luminance(light.color)).toBeCloseTo(luminance(plain) * 1.8, 6);
      // The same tint as the plain violet, only stronger.
      expect(light.color.r / light.color.b).toBeCloseTo(plain.r / plain.b, 6);
      expect(light.color.g / light.color.b).toBeCloseTo(plain.g / plain.b, 6);
    }
  });

  it('tint the floor by the tower violet, the colour its fans rest at', () => {
    const [tower] = RGB_ROOM_LIGHTS;
    expect(tower.hueOffset).toBe(0);
    expect(tower.color.b).toBeGreaterThan(tower.color.g);
    expect(tower.color.r).toBeGreaterThan(tower.color.g);
  });

  it('never read the RGB clock, so the fans and strips cycling leaves the room alone', () => {
    for (const file of ['RgbLights.tsx', 'roomLights.ts']) {
      const source = readFileSync(join(__dirname, file), 'utf8');
      expect(source).not.toMatch(/useRgbClock|useFrame|\.hue\b/);
    }
  });
});

describe('rgb clock', () => {
  it('only moves the hue: it has no brightness of its own', () => {
    const clock = createRgbClock();
    expect(Object.keys(clock).sort()).toEqual(['frozen', 'hue', 'sample', 'setFrozen']);
  });

  it('holds the resting violet while frozen', () => {
    const clock = createRgbClock(true);
    for (const time of [0, 3.2, 17, 120]) {
      clock.sample(time);
      expect(clock.hue).toBe(FROZEN_HUE);
    }
  });

  it('covers the whole wheel over one lap', () => {
    const clock = createRgbClock();
    const seen = new Set<number>();
    for (let time = 0; time < 26; time += 0.05) {
      clock.sample(time);
      seen.add(Math.floor(clock.hue * 12));
    }
    expect(seen.size).toBe(12);
  });
});
