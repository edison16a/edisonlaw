import { Color } from 'three';
import { describe, expect, expectTypeOf, it } from 'vitest';
import type { WorkstationStageProps } from '../WorkstationStage';
import type { DeskSceneProps } from '../scene/DeskScene';
import { createRgbClock, FROZEN_HUE, luminance, writeRgb, writeSteadyRgb } from './rgbClock';
import { RGB_ROOM_LIGHTS, SCREEN_LIGHT, writeRoomLightColor } from './roomLights';

const HUES = Array.from({ length: 240 }, (_, step) => step / 240);

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

  it('keep each RGB light at one brightness through the whole hue cycle', () => {
    const color = new Color();
    for (const light of RGB_ROOM_LIGHTS) {
      for (const hue of HUES) {
        expect(luminance(writeRoomLightColor(color, light, hue))).toBeCloseTo(light.level, 6);
      }
    }
  });

  it('hold that brightness at the bright end: no hue of the plain cycle is brighter', () => {
    const color = new Color();
    for (const light of RGB_ROOM_LIGHTS) {
      for (const hue of HUES) {
        expect(light.level).toBeGreaterThanOrEqual(luminance(writeRgb(color, hue, 1, light.saturation)) - 1e-3);
      }
      // The resting violet, the dimmest part of the wheel, is lifted well above its plain strength.
      const violet = luminance(writeRgb(color, FROZEN_HUE + light.hueOffset, 1, light.saturation));
      expect(light.level).toBeGreaterThanOrEqual(violet * 1.8 - 1e-6);
    }
  });

  it('keep the wall and floor washes on one colour while the PC cycles', () => {
    const washes = RGB_ROOM_LIGHTS.filter((light) => !light.cycles);
    expect(washes).toHaveLength(2);
    for (const light of washes) {
      const rest = writeRoomLightColor(new Color(), light, FROZEN_HUE);
      for (const hue of HUES) expect(writeRoomLightColor(new Color(), light, hue).equals(rest)).toBe(true);
    }
  });

  it('let only the tower spill follow the hue, so it matches the fans', () => {
    const cycling = RGB_ROOM_LIGHTS.filter((light) => light.cycles);
    expect(cycling).toHaveLength(1);
    const [tower] = cycling;
    const red = writeRoomLightColor(new Color(), tower, 0 - tower.hueOffset);
    const blue = writeRoomLightColor(new Color(), tower, 2 / 3 - tower.hueOffset);
    expect(red.r).toBeGreaterThan(red.b);
    expect(blue.b).toBeGreaterThan(blue.r);
  });
});

describe('rgb clock', () => {
  it('only moves the hue, so it never makes anything brighter or dimmer', () => {
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

  it('writes a steady colour at exactly the asked luminance', () => {
    const color = new Color();
    for (const saturation of [0.2, 0.55, 1]) {
      for (const hue of HUES) expect(luminance(writeSteadyRgb(color, hue, saturation, 0.3))).toBeCloseTo(0.3, 6);
    }
  });
});
