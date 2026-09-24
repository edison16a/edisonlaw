import { describe, expect, it } from 'vitest';
import { readFocus } from './focus';

const snapshot = () => ({ focused: 0, panel: null as number | null, settled: null as number | null, inIntro: true });

describe('readFocus', () => {
  it('opens the panel near a slow card and keeps it shut while travelling', () => {
    expect(readFocus(3.05, 0.2, 0, 12, snapshot()).panel).toBe(3);
    expect(readFocus(3.05, 4, 0, 12, snapshot()).panel).toBeNull();
    expect(readFocus(3.4, 0.2, 0, 12, snapshot()).panel).toBeNull();
  });

  it('keeps the panel shut for the intro and opens it on the last card', () => {
    expect(readFocus(-0.5, 0, 0, 12, snapshot()).panel).toBeNull();
    expect(readFocus(11, 0, 0, 12, snapshot()).panel).toBe(11);
  });

  it('reports a settled card only once the spiral rests', () => {
    expect(readFocus(3, 0, 0.2, 12, snapshot()).settled).toBeNull();
    expect(readFocus(3, 0, 0.9, 12, snapshot()).settled).toBe(3);
  });

  it('knows when the spiral has left the intro, and that the end is not the intro', () => {
    expect(readFocus(-0.5, 0, 0, 12, snapshot()).inIntro).toBe(true);
    expect(readFocus(0, 0, 0, 12, snapshot()).inIntro).toBe(false);
    expect(readFocus(11, 0, 0, 12, snapshot()).inIntro).toBe(false);
  });

  it('keeps the nearest card inside the deck', () => {
    expect(readFocus(-0.5, 0, 0, 12, snapshot()).focused).toBe(0);
    expect(readFocus(12, 0, 0, 12, snapshot()).focused).toBe(11);
  });
});
