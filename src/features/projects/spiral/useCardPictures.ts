'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import type { WebGLRenderer } from 'three';
import type { Project } from '@/content/types';
import { loadCardPicture, type CardPicture } from '../media/cardPicture';
import { showPicture, type CardRuntime } from './cardFrame';

interface Loaded {
  project: number;
  picture: CardPicture;
}

/**
 * Loads every project's picture and returns a function that hands the next
 * one to its cards. Call it once per frame so a dozen texture uploads never
 * land in the same frame. It returns true while more are waiting. Each arrival
 * wakes the canvas, and textures are disposed when the scene goes away.
 */
export function useCardPictures(projects: Project[], cards: CardRuntime[], gl: WebGLRenderer, startAt: number) {
  const queue = useRef<Loaded[]>([]);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    let cancelled = false;
    const loaded: CardPicture[] = [];
    const anisotropy = gl.capabilities.getMaxAnisotropy();
    const count = projects.length;
    // Cards around the opening slot ask for their photos first. The strand wraps, so distance does too.
    const distance = (index: number) => Math.min(Math.abs(index - startAt), count - Math.abs(index - startAt));
    const order = projects.map((_, index) => index).sort((a, b) => distance(a) - distance(b));

    order.forEach((index) => {
      void loadCardPicture(projects[index], anisotropy).then((picture) => {
        if (cancelled) {
          picture.dispose();
          return;
        }
        loaded.push(picture);
        queue.current.push({ project: index, picture });
        invalidate();
      });
    });

    return () => {
      cancelled = true;
      queue.current = [];
      loaded.forEach((picture) => picture.dispose());
    };
  }, [projects, gl, startAt, invalidate]);

  return useCallback(() => {
    const next = queue.current.shift();
    if (!next) return false;
    gl.initTexture(next.picture.texture);
    for (const card of cards) {
      if (card.project === next.project) showPicture(card, next.picture);
    }
    return queue.current.length > 0;
  }, [cards, gl]);
}
