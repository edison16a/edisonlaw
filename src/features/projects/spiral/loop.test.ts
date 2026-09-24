import { describe, expect, it } from 'vitest';
import { MAX_LEAD, projectAt, stepTarget } from './loop';

describe('projectAt', () => {
  it('wraps the index onto the projects in both directions', () => {
    expect(projectAt(0, 12)).toBe(0);
    expect(projectAt(11, 12)).toBe(11);
    expect(projectAt(12, 12)).toBe(0);
    expect(projectAt(-1, 12)).toBe(11);
    expect(projectAt(-13, 12)).toBe(11);
    expect(projectAt(1205, 12)).toBe(5);
  });

  it('counts a continuous index as its nearest card', () => {
    expect(projectAt(3.4, 12)).toBe(3);
    expect(projectAt(-0.6, 12)).toBe(11);
  });

  it('survives an empty deck', () => {
    expect(projectAt(4, 0)).toBe(0);
  });
});

describe('stepTarget', () => {
  it('moves one card from rest', () => {
    expect(stepTarget(3, 3, 1)).toBe(4);
    expect(stepTarget(3, 3, -1)).toBe(2);
    expect(stepTarget(-5, -5, -1)).toBe(-6);
  });

  it('wraps from the last project to the first and back', () => {
    expect(projectAt(stepTarget(11, 11, 1), 12)).toBe(0);
    expect(projectAt(stepTarget(0, 0, -1), 12)).toBe(11);
  });

  it('goes round forever in either direction', () => {
    let forward = 0;
    let back = 0;
    for (let press = 0; press < 1000; press++) {
      forward = stepTarget(forward, forward, 1);
      back = stepTarget(back, back, -1);
    }
    expect(projectAt(forward, 12)).toBe(1000 % 12);
    expect(projectAt(back, 12)).toBe(12 - (1000 % 12));
  });

  it('queues quick presses on top of the card it is heading for', () => {
    expect(stepTarget(5, 4.3, 1)).toBe(6);
    expect(stepTarget(6, 4.6, 1)).toBe(7);
  });

  it('turns round smoothly when a press goes the other way mid move', () => {
    expect(stepTarget(7, 4.5, -1)).toBe(6);
    expect(stepTarget(4, 3.8, -1)).toBe(3);
  });

  it('never queues more than the lead ahead of the cards', () => {
    expect(stepTarget(4 + MAX_LEAD, 4, 1)).toBe(4 + MAX_LEAD);
    expect(stepTarget(4 - MAX_LEAD, 4, -1)).toBe(4 - MAX_LEAD);
  });

  it('never pulls back a click on a card further away than the lead', () => {
    expect(stepTarget(10, 4, 1)).toBe(10);
    expect(stepTarget(10, 4, -1)).toBe(9);
    expect(stepTarget(-3, 4, -1)).toBe(-3);
    expect(stepTarget(-3, 4, 1)).toBe(-2);
  });

  it('always lands on a whole card', () => {
    expect(stepTarget(2.7, 2.2, 1)).toBe(4);
    expect(Number.isInteger(stepTarget(2.7, 2.2, -1))).toBe(true);
  });
});
