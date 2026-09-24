import { describe, expect, it } from 'vitest';
import { readFocus } from './focus';

const snapshot = () => ({ focused: 0, panel: null as number | null, settled: null as number | null, inDeck: false });

describe('readFocus', () => {
  it('opens the panel near a slow card and keeps it shut while travelling', () => {
    expect(readFocus(3.05, 0.2, 0, 12, snapshot()).panel).toBe(3);
    expect(readFocus(3.05, 4, 0, 12, snapshot()).panel).toBeNull();
    expect(readFocus(3.4, 0.2, 0, 12, snapshot()).panel).toBeNull();
  });

  it('keeps the panel shut for the intro and the outro', () => {
    expect(readFocus(-0.5, 0, 0, 12, snapshot()).panel).toBeNull();
    expect(readFocus(11.5, 0, 0, 12, snapshot()).panel).toBeNull();
  });

  it('reports a settled card only once the spiral rests', () => {
    expect(readFocus(3, 0, 0.2, 12, snapshot()).settled).toBeNull();
    expect(readFocus(3, 0, 0.9, 12, snapshot()).settled).toBe(3);
  });

  it('knows when the spiral has left the intro and the outro', () => {
    expect(readFocus(-0.5, 0, 0, 12, snapshot()).inDeck).toBe(false);
    expect(readFocus(0, 0, 0, 12, snapshot()).inDeck).toBe(true);
    expect(readFocus(11, 0, 0, 12, snapshot()).inDeck).toBe(true);
    expect(readFocus(11.5, 0, 0, 12, snapshot()).inDeck).toBe(false);
  });

  it('keeps the nearest card inside the deck', () => {
    expect(readFocus(-0.5, 0, 0, 12, snapshot()).focused).toBe(0);
    expect(readFocus(11.5, 0, 0, 12, snapshot()).focused).toBe(11);
  });
});
