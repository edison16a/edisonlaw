'use client';

import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { SCREEN_LIGHT } from './roomLights';

RectAreaLightUniformsLib.init();

interface ScreenLightProps {
  width: number;
  height: number;
}

/**
 * An area light the size of the panel, sitting just in front of it, so each monitor lights the
 * desk, keyboard and character. It holds one colour and strength whatever the screen shows, so a
 * new picture on the centre monitor never changes the room.
 */
export function ScreenLight({ width, height }: ScreenLightProps) {
  // Rect area lights shine along their local -Z, so turn it to face out of the screen.
  return (
    <rectAreaLight
      args={[SCREEN_LIGHT.color, SCREEN_LIGHT.intensity, width, height]}
      position-z={0.01}
      rotation-y={Math.PI}
    />
  );
}
