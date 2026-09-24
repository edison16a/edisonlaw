import { describe, expect, it } from 'vitest';
import { createCards, focusCardShown, slotCount } from './cardFrame';

describe('slotCount', () => {
  it('repeats the projects to fill the strand', () => {
    expect(slotCount(12)).toBe(24);
    expect(slotCount(5)).toBe(25);
    expect(slotCount(0)).toBe(0);
  });
});

describe('focusCardShown', () => {
  it('waits for the card in the slot, not just any card, to get its picture', () => {
    const cards = createCards(12);
    cards.forEach((card, slot) => {
      card.offset = slot - 4;
    });
    expect(focusCardShown(cards)).toBe(false);
    cards[6].shownFor = 0.2;
    expect(focusCardShown(cards)).toBe(false);
    cards[4].shownFor = 0;
    expect(focusCardShown(cards)).toBe(true);
    cards.forEach((card) => card.material.dispose());
  });
});
