import { describe, expect, it } from 'vitest';
import { createLensView, easeLensView } from './lensView';

const metrics = (focusLift: number, focusZoom: number) => ({ focusShift: 0, focusLift, focusZoom });

describe('easeLensView', () => {
  it('starts where the stage is', () => {
    expect(createLensView(metrics(120, 0.8))).toEqual({ lift: 120, zoom: 0.8 });
  });

  it('glides to a new lift and zoom, then rests exactly on them', () => {
    const view = createLensView(metrics(100, 1));
    const target = metrics(160, 0.8);
    expect(easeLensView(view, target, 1 / 60, false)).toBe(true);
    expect(view.lift).toBeGreaterThan(100);
    expect(view.lift).toBeLessThan(160);
    expect(view.zoom).toBeLessThan(1);
    expect(view.zoom).toBeGreaterThan(0.8);
    let frames = 0;
    while (easeLensView(view, target, 1 / 60, false) && frames < 600) frames++;
    expect(frames).toBeLessThan(120);
    expect(view).toEqual({ lift: 160, zoom: 0.8 });
  });

  it('jumps straight there when motion is reduced', () => {
    const view = createLensView(metrics(100, 1));
    expect(easeLensView(view, metrics(160, 0.8), 1 / 60, true)).toBe(false);
    expect(view).toEqual({ lift: 160, zoom: 0.8 });
  });

  it('says it is done when nothing changes', () => {
    const view = createLensView(metrics(100, 1));
    expect(easeLensView(view, metrics(100, 1), 1 / 60, false)).toBe(false);
  });
});
