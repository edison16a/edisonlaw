import { beforeEach, describe, expect, it, vi } from 'vitest';
import { soundMove } from '../sound/moveSound';
import { MAX_LEAD, WHEEL_LEAD } from '../spiral/loop';
import { spiralMotion } from '../state/spiralMotion';
import { moveSpiralTo, stepSpiral } from './steering';

vi.mock('../sound/moveSound', () => ({ soundMove: vi.fn() }));

beforeEach(() => {
  spiralMotion.target = 4;
  spiralMotion.value = 4;
  vi.mocked(soundMove).mockClear();
});

describe('stepSpiral', () => {
  it('turns one project on or back for a press', () => {
    stepSpiral(1);
    expect(spiralMotion.target).toBe(5);
    stepSpiral(-1);
    stepSpiral(-1);
    expect(spiralMotion.target).toBe(3);
  });

  it('turns a few projects at once for notches merged into one event', () => {
    stepSpiral(2, WHEEL_LEAD);
    expect(spiralMotion.target).toBe(6);
    stepSpiral(-3, WHEEL_LEAD);
    expect(spiralMotion.target).toBe(3);
  });

  it('lets a quick wheel spin queue up every notch, as far as the wheel lead', () => {
    for (let notch = 0; notch < 5; notch++) stepSpiral(1, WHEEL_LEAD);
    expect(spiralMotion.target).toBe(9);
    for (let notch = 0; notch < 5; notch++) stepSpiral(1, WHEEL_LEAD);
    expect(spiralMotion.target).toBe(4 + WHEEL_LEAD);
  });

  it('keeps presses to the shorter queue', () => {
    for (let press = 0; press < 5; press++) stepSpiral(1);
    expect(spiralMotion.target).toBe(4 + MAX_LEAD);
    expect(WHEEL_LEAD).toBeGreaterThan(MAX_LEAD);
  });
});

describe('the move sound', () => {
  it('sounds once when the spiral heads for another project, however far', () => {
    moveSpiralTo(9);
    expect(soundMove).toHaveBeenCalledTimes(1);
    stepSpiral(-1);
    expect(soundMove).toHaveBeenCalledTimes(2);
  });

  it('stays quiet when the spiral already heads for that card', () => {
    moveSpiralTo(4);
    expect(soundMove).not.toHaveBeenCalled();
  });

  it('stays quiet for a press that adds nothing at the lead limit', () => {
    for (let press = 0; press < 5; press++) stepSpiral(1);
    expect(soundMove).toHaveBeenCalledTimes(MAX_LEAD);
  });
});
