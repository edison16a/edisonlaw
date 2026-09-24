'use client';

import { useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import type { CanvasTexture } from 'three';
import { ScreenBinding } from './ScreenBinding';
import type { ScreenId } from './types';
import { useCanvasVisible } from './useCanvasVisible';

interface Options {
  /** Keep repainting (typing, cursor blink). False paints one still frame. */
  animate?: boolean;
}

/**
 * Returns a texture showing `id`. Screens are painted once per id and shared, so this hook only
 * owns a light CanvasTexture over the shared canvas. Call inside an R3F Canvas.
 * Repaints stop while the canvas is off screen, even if `animate` stays true.
 */
export function useScreenTexture(id: ScreenId, { animate = true }: Options = {}): CanvasTexture {
  const anisotropy = useThree((state) => state.gl.capabilities.getMaxAnisotropy());
  const invalidate = useThree((state) => state.invalidate);
  const visible = useCanvasVisible();
  const live = animate && visible;

  const binding = useMemo(() => new ScreenBinding(id, anisotropy), [id, anisotropy]);
  const liveRef = useRef(live);

  useEffect(() => {
    // Demand mode canvases only render when asked, so each repaint asks for a frame.
    binding.connect(liveRef.current, () => invalidate());
    return () => binding.disconnect();
  }, [binding, invalidate]);

  useEffect(() => {
    liveRef.current = live;
    binding.setAnimate(live);
  }, [binding, live]);

  return binding.texture;
}
