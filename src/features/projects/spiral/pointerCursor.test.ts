import { afterAll, describe, expect, it } from 'vitest';
import { createCards } from './cardFrame';
import { createPointerCursor } from './pointerCursor';

const canvas = () => ({ style: { cursor: '' } }) as unknown as HTMLElement;

describe('createPointerCursor', () => {
  const cards = createCards(12);
  const [focused, neighbour] = cards;
  focused.offset = 0;
  neighbour.offset = 1;

  it('shows a pointer over the cards beside the focused one only', () => {
    const cursor = createPointerCursor();
    const element = canvas();
    cursor.enter(focused);
    cursor.update(0, element);
    expect(element.style.cursor).toBe('');
    cursor.enter(neighbour);
    cursor.update(0, element);
    expect(element.style.cursor).toBe('pointer');
    cursor.leave(neighbour);
    cursor.update(0, element);
    expect(element.style.cursor).toBe('');
  });

  it('forgets the card once the spiral turns quickly under the pointer', () => {
    const cursor = createPointerCursor();
    const element = canvas();
    cursor.enter(neighbour);
    cursor.update(4, element);
    expect(element.style.cursor).toBe('');
    cursor.update(0, element);
    expect(element.style.cursor).toBe('');
  });

  it('ignores leaving a card the pointer already moved off', () => {
    const cursor = createPointerCursor();
    const element = canvas();
    cursor.enter(focused);
    cursor.enter(neighbour);
    cursor.leave(focused);
    cursor.update(0, element);
    expect(element.style.cursor).toBe('pointer');
  });

  afterAll(() => cards.forEach((card) => card.material.dispose()));
});
