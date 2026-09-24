'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import type { WebGLRenderer } from 'three';
import type { Project } from '@/content/types';
import { projectPictures } from '../gallery/pictures';
import { shownPicture, type GallerySelection } from '../gallery/selection';
import { createPictureBank, type PictureBank } from '../media/pictureBank';
import { showPicture, type CardRuntime } from './cardFrame';
import { FOCUS, slotOffset } from './geometry';

/**
 * Loads the pictures the cards show and returns a function that hands them
 * out, once per frame. Every card shows its project's thumbnail, except the
 * card in the focus slot, which shows the screenshot picked in the row. A
 * project's screenshots load as it comes into focus, so a pick swaps at once.
 * The function returns true while more pictures wait for the GPU. Each arrival
 * wakes the canvas, and textures are disposed when the scene goes away.
 */
export function useCardPictures(projects: Project[], cards: CardRuntime[], gl: WebGLRenderer, startAt: number) {
  const invalidate = useThree((state) => state.invalidate);
  const bank = useRef<PictureBank | null>(null);
  const preloaded = useRef<number | null>(null);
  const pictures = useMemo(() => projects.map(projectPictures), [projects]);

  useEffect(() => {
    const created = createPictureBank(gl, invalidate);
    bank.current = created;
    preloaded.current = null;
    // Cards around the opening slot ask for their thumbnails first. The strand wraps, so distance does too.
    const count = projects.length;
    const distance = (index: number) => Math.min(Math.abs(index - startAt), count - Math.abs(index - startAt));
    const order = projects.map((_, index) => index).sort((a, b) => distance(a) - distance(b));
    order.forEach((index) => created.request(projects[index].image));

    return () => {
      created.dispose();
      if (bank.current === created) bank.current = null;
    };
  }, [projects, gl, startAt, invalidate]);

  /** `value` is the spiral's continuous index and `panel` the project in focus, or null. */
  return useCallback(
    (value: number, panel: number | null, selection: GallerySelection) => {
      const current = bank.current;
      if (!current) return false;
      if (panel !== null && panel !== preloaded.current) {
        preloaded.current = panel;
        pictures[panel].forEach(current.request);
      }

      const waiting = current.uploadNext();
      for (const card of cards) {
        const list = pictures[card.project];
        const inSlot = Math.abs(slotOffset(card.slot, value, cards.length)) < FOCUS.reach;
        const index = inSlot ? Math.min(shownPicture(selection, card.project), list.length - 1) : 0;
        // A screenshot still on its way leaves the card on what it shows until it lands.
        const picture = current.ready(list[index]);
        if (picture) showPicture(card, picture);
      }
      return waiting;
    },
    [cards, pictures],
  );
}
