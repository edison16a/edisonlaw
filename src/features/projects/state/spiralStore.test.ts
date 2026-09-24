import { beforeEach, describe, expect, it } from 'vitest';
import { useSpiralStore } from './spiralStore';

describe('spiral store', () => {
  beforeEach(() => useSpiralStore.getState().resetSpiral());

  it('keeps the controls hidden until the canvas shows the focused card', () => {
    const store = useSpiralStore.getState();
    store.syncFocus({ panel: 3, settled: null });
    expect(useSpiralStore.getState().ready).toBe(false);
    store.markReady();
    expect(useSpiralStore.getState().ready).toBe(true);
  });

  it('hides the controls and forgets the focus again when the canvas goes away', () => {
    const store = useSpiralStore.getState();
    store.syncFocus({ panel: 2, settled: 2 });
    store.setHovered(5);
    store.markReady();
    store.resetSpiral();
    const { ready, panel, settled, hovered } = useSpiralStore.getState();
    expect({ ready, panel, settled, hovered }).toEqual({ ready: false, panel: null, settled: null, hovered: null });
  });

  it('only updates when the focus changes', () => {
    const store = useSpiralStore.getState();
    store.syncFocus({ panel: 1, settled: 1 });
    const before = useSpiralStore.getState();
    store.syncFocus({ panel: 1, settled: 1 });
    expect(useSpiralStore.getState()).toBe(before);
  });
});
