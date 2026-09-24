'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import type { Texture } from 'three';
import { ScreenBinding } from './ScreenBinding';
import type { ScreenId } from './types';

interface Options {
  /** Keep repainting (typing, cursor blink). False paints one still frame. The stage passes false while off screen. */
  animate?: boolean;
}

export interface ScreenTextures {
  /** The picture, for the monitor face. */
  texture: Texture;
  /** A small copy of the picture for sampling its colour on the CPU. Never bind it to a material. */
  glow: Texture;
}

/**
 * Returns textures showing `id`. Screens are painted once per id and shared, so this hook only
 * owns light textures over the shared canvas. Call inside an R3F Canvas.
 */
export function useScreenTexture(id: ScreenId, { animate = true }: Options = {}): ScreenTextures {
  const anisotropy = useThree((state) => state.gl.capabilities.getMaxAnisotropy());
  const invalidate = useThree((state) => state.invalidate);

  const binding = useMemo(() => new ScreenBinding(id, anisotropy), [id, anisotropy]);
  const animateRef = useRef(animate);

  useEffect(() => {
    // Demand mode canvases only render when asked, so each repaint asks for a frame.
    binding.connect(animateRef.current, () => invalidate());
    return () => binding.disconnect();
  }, [binding, invalidate]);

  useEffect(() => {
    animateRef.current = animate;
    binding.setAnimate(animate);
  }, [binding, animate]);

  // A repaint that has to wait for the upload slot asks for another frame to try again.
  useFrame(() => {
    if (binding.update()) invalidate();
  });

  return binding;
}
