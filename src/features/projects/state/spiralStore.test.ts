import { beforeEach, describe, expect, it } from 'vitest';
import { NO_SELECTION, shownPicture } from '../gallery/selection';
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
    store.markReady();
    store.resetSpiral();
    const { ready, panel, settled } = useSpiralStore.getState();
    expect({ ready, panel, settled }).toEqual({ ready: false, panel: null, settled: null });
  });

  it('only updates when the focus changes', () => {
    const store = useSpiralStore.getState();
    store.syncFocus({ panel: 1, settled: 1 });
    const before = useSpiralStore.getState();
    store.syncFocus({ panel: 1, settled: 1 });
    expect(useSpiralStore.getState()).toBe(before);
  });

  it('shows a picked screenshot only on the settled project', () => {
    const store = useSpiralStore.getState();
    store.syncFocus({ panel: 8, settled: 8 });
    store.choosePicture(8, 2, 5);
    expect(shownPicture(useSpiralStore.getState().gallery, 8)).toBe(2);
    store.choosePicture(3, 1, 5);
    expect(shownPicture(useSpiralStore.getState().gallery, 3)).toBe(0);
  });

  it('puts the thumbnail back as soon as the spiral moves, so a project always opens on it', () => {
    const store = useSpiralStore.getState();
    store.syncFocus({ panel: 8, settled: 8 });
    store.choosePicture(8, 4, 5);
    store.syncFocus({ panel: 8, settled: null });
    expect(useSpiralStore.getState().gallery).toBe(NO_SELECTION);
    store.syncFocus({ panel: 8, settled: 8 });
    expect(shownPicture(useSpiralStore.getState().gallery, 8)).toBe(0);
  });

  it('keeps the pick while the spiral stays settled', () => {
    const store = useSpiralStore.getState();
    store.syncFocus({ panel: 8, settled: 8 });
    store.choosePicture(8, 3, 5);
    store.syncFocus({ panel: 8, settled: 8 });
    expect(shownPicture(useSpiralStore.getState().gallery, 8)).toBe(3);
  });
});
