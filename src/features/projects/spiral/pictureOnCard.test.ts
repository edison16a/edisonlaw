import { describe, expect, it } from 'vitest';
import { NO_SELECTION, selectPicture } from '../gallery/selection';
import { pictureOnCard } from './pictureOnCard';

/** Twelve projects on a strand of 24 cards, so every project has two cards. */
const SLOTS = 24;
const card = (slot: number) => ({ slot, project: slot % 12 });

describe('pictureOnCard', () => {
  const picked = selectPicture(8, 3, 5);

  it('shows the picked screenshot on the card in the focus slot', () => {
    expect(pictureOnCard(card(8), 5, 8, SLOTS, picked)).toBe(3);
    expect(pictureOnCard(card(8), 5, 8.3, SLOTS, picked)).toBe(3);
  });

  it('keeps the thumbnail on every other card, the same project further along included', () => {
    expect(pictureOnCard(card(20), 5, 8, SLOTS, picked)).toBe(0);
    expect(pictureOnCard(card(9), 5, 8, SLOTS, selectPicture(9, 2, 5))).toBe(0);
  });

  it('puts the thumbnail back as the card leaves the slot', () => {
    expect(pictureOnCard(card(8), 5, 8.6, SLOTS, picked)).toBe(0);
    expect(pictureOnCard(card(8), 5, 7.4, SLOTS, picked)).toBe(0);
  });

  it('shows the thumbnail with nothing picked, and never a picture the project lacks', () => {
    expect(pictureOnCard(card(8), 5, 8, SLOTS, NO_SELECTION)).toBe(0);
    expect(pictureOnCard(card(8), 2, 8, SLOTS, picked)).toBe(1);
  });

  it('finds the slot across the seam where the strand wraps', () => {
    expect(pictureOnCard(card(0), 5, 24, SLOTS, selectPicture(0, 2, 5))).toBe(2);
  });
});
