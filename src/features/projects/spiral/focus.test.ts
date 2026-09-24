import { describe, expect, it } from 'vitest';
import { readFocus } from './focus';

const snapshot = () => ({ focused: 0, panel: null as number | null, settled: null as number | null, inIntro: true });

describe('readFocus', () => {
  it('opens the panel near a slow card and keeps it shut while travelling', () => {
    expect(readFocus(3.05, 0.2, 0, 12, false, snapshot()).panel).toBe(3);
    expect(readFocus(3.05, 4, 0, 12, false, snapshot()).panel).toBeNull();
    expect(readFocus(3.4, 0.2, 0, 12, false, snapshot()).panel).toBeNull();
  });

  it('keeps the panel shut in the intro', () => {
    expect(readFocus(-0.5, 0, 0, 12, true, snapshot()).panel).toBeNull();
    expect(readFocus(-0.1, 0, 0, 12, true, snapshot()).panel).toBeNull();
    expect(readFocus(-0.1, 0, 0, 12, false, snapshot()).panel).toBe(0);
  });

  it('reports a settled card only once the spiral rests', () => {
    expect(readFocus(3, 0, 0.2, 12, false, snapshot()).settled).toBeNull();
    expect(readFocus(3, 0, 0.9, 12, false, snapshot()).settled).toBe(3);
  });

  it('names projects past either end of the list by wrapping round', () => {
    const after = readFocus(12, 0, 1, 12, false, snapshot());
    expect(after.focused).toBe(0);
    expect(after.panel).toBe(0);
    expect(after.settled).toBe(0);
    expect(readFocus(-1, 0, 1, 12, false, snapshot()).panel).toBe(11);
    expect(readFocus(-26, 0, 1, 12, false, snapshot()).settled).toBe(10);
  });

  it('passes the intro flag through', () => {
    expect(readFocus(-0.5, 0, 0, 12, true, snapshot()).inIntro).toBe(true);
    expect(readFocus(0, 0, 0, 12, false, snapshot()).inIntro).toBe(false);
  });
});
