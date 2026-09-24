'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import type { RectAreaLight, Texture } from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { damp } from '@/lib/math';
import { ScreenGlowSampler } from './ScreenGlowSampler';

RectAreaLightUniformsLib.init();

/** Light output for a black screen, and how much a bright picture adds on top. */
const BASE_INTENSITY = 2.2;
const LUMINANCE_GAIN = 9;

interface ScreenLightProps {
  texture: Texture;
  width: number;
  height: number;
}

/**
 * An area light the size of the panel, sitting just in front of it, so each monitor
 * lights the desk, keyboard and character with the colour of what it shows.
 */
export function ScreenLight({ texture, width, height }: ScreenLightProps) {
  const light = useRef<RectAreaLight>(null);
  const [glow] = useState(() => new ScreenGlowSampler());

  useFrame((_, delta) => {
    glow.tick(texture, delta);
    const current = light.current;
    if (!current) return;
    current.color.lerp(glow.color, 1 - Math.exp(-3 * delta));
    current.intensity = damp(current.intensity, BASE_INTENSITY + glow.luminance * LUMINANCE_GAIN, 3, delta);
  });

  // Rect area lights shine along their local -Z, so turn it to face out of the screen.
  return (
    <rectAreaLight
      ref={light}
      args={[glow.color, BASE_INTENSITY, width, height]}
      position-z={0.01}
      rotation-y={Math.PI}
    />
  );
}
