import { beforeEach, describe, expect, it } from 'vitest';
import { MAX_LEAD, WHEEL_LEAD } from '../spiral/loop';
import { spiralMotion } from '../state/spiralMotion';
import { moveSpiralTo, stepSpiral } from './steering';

beforeEach(() => {
  spiralMotion.target = 4;
  spiralMotion.value = 4;
  spiralMotion.held = false;
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

  it('leaves the spiral to the mouse while a drag holds it', () => {
    spiralMotion.held = true;
    spiralMotion.target = 4.4;
    stepSpiral(1, WHEEL_LEAD);
    stepSpiral(-1);
    expect(spiralMotion.target).toBe(4.4);
  });

  it('keeps presses to the shorter queue', () => {
    for (let press = 0; press < 5; press++) stepSpiral(1);
    expect(spiralMotion.target).toBe(4 + MAX_LEAD);
    expect(WHEEL_LEAD).toBeGreaterThan(MAX_LEAD);
  });
});

describe('moveSpiralTo', () => {
  it('heads straight for any card, however far', () => {
    moveSpiralTo(9);
    expect(spiralMotion.target).toBe(9);
    stepSpiral(-1);
    expect(spiralMotion.target).toBe(8);
  });
});
