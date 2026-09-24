import { describe, expect, it } from 'vitest';
import { overSpiral, stageInFullView, type Box } from './wheelZone';

const box = (left: number, top: number, right: number, bottom: number): Box => ({ left, top, right, bottom });

describe('overSpiral', () => {
  // A 1440 by 900 window: the stage fills it under a 64 pixel navbar.
  const stage = box(0, 64, 1440, 900);

  it('takes everything left of a panel beside the spiral', () => {
    const panel = box(1022, 64, 1392, 900);
    expect(overSpiral(500, 400, stage, panel, true)).toBe(true);
    expect(overSpiral(1021, 880, stage, panel, true)).toBe(true);
    expect(overSpiral(1022, 400, stage, panel, true)).toBe(false);
    expect(overSpiral(1420, 400, stage, panel, true)).toBe(false);
  });

  it('takes everything above a panel below the spiral', () => {
    const tablet = box(0, 64, 768, 1024);
    const panel = box(0, 690, 768, 1024);
    expect(overSpiral(700, 300, tablet, panel, false)).toBe(true);
    expect(overSpiral(20, 689, tablet, panel, false)).toBe(true);
    expect(overSpiral(20, 700, tablet, panel, false)).toBe(false);
  });

  it('never takes a point off the stage, such as the navbar', () => {
    expect(overSpiral(500, 30, stage, null, true)).toBe(false);
    expect(overSpiral(500, 900, stage, null, true)).toBe(false);
  });

  it('takes the whole stage while there is no panel', () => {
    expect(overSpiral(1300, 400, stage, null, true)).toBe(true);
  });
});

describe('stageInFullView', () => {
  it('holds while the stage fills the window under the navbar, give or take a few pixels', () => {
    expect(stageInFullView(box(0, 64, 1440, 900), 64, 900)).toBe(true);
    expect(stageInFullView(box(0, 61, 1440, 897), 64, 900)).toBe(true);
  });

  it('lets go as soon as the stage is partly scrolled away', () => {
    expect(stageInFullView(box(0, 40, 1440, 876), 64, 900)).toBe(false);
    expect(stageInFullView(box(0, 300, 1440, 1136), 64, 900)).toBe(false);
  });
});
