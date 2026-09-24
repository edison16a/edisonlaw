'use client';

import { useEffect, useMemo } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';
import { SCREEN_HEIGHT, SCREEN_WIDTH, type ScreenId } from './types';

interface Options {
  /** Keep repainting (typing, cursor blink). False paints one still frame. */
  animate?: boolean;
}

/**
 * Returns a texture showing `id`. Placeholder painter: a dark panel with the screen name.
 * The real painters replace this with the Claude Code, Codex, VS Code and experience screens.
 */
export function useScreenTexture(id: ScreenId, { animate = true }: Options = {}) {
  void animate;
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      ctx.fillStyle = '#c9d1d9';
      ctx.font = '48px monospace';
      ctx.fillText(id, 64, 120);
    }
    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    return result;
  }, [id]);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}
