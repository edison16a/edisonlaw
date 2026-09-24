'use client';

import { useCallback, useEffect, useRef } from 'react';
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
 * land in the same frame. Textures are disposed when the scene goes away.
 */
export function useCardPictures(projects: Project[], cards: CardRuntime[], gl: WebGLRenderer, startAt: number) {
  const queue = useRef<Loaded[]>([]);

  useEffect(() => {
    let cancelled = false;
    const loaded: CardPicture[] = [];
    const anisotropy = gl.capabilities.getMaxAnisotropy();
    const count = projects.length;

    projects.forEach((project, index) => {
      // Cards around the opening slot paint first. The strand wraps, so distance does too.
      const distance = Math.abs(index - startAt);
      const priority = Math.min(distance, count - distance);
      void loadCardPicture(project, { priority, anisotropy }).then((picture) => {
        if (cancelled) {
          picture.dispose();
          return;
        }
        loaded.push(picture);
        queue.current.push({ project: index, picture });
      });
    });

    return () => {
      cancelled = true;
      queue.current = [];
      loaded.forEach((picture) => picture.dispose());
    };
  }, [projects, gl, startAt]);

  return useCallback(() => {
    const next = queue.current.shift();
    if (!next) return;
    gl.initTexture(next.picture.texture);
    for (const card of cards) {
      if (card.project === next.project) showPicture(card, next.picture);
    }
  }, [cards, gl]);
}
