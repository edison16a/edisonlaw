import { describe, expect, it } from 'vitest';
import { INTRO_INDEX, nearestCardOf, projectAt, stepFrom } from './loop';

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
    expect(projectAt(INTRO_INDEX, 12)).toBe(0);
  });

  it('survives an empty deck', () => {
    expect(projectAt(4, 0)).toBe(0);
  });
});

describe('nearestCardOf', () => {
  it('finds the closest card showing a project, whichever way round', () => {
    expect(nearestCardOf(3, 0, 12)).toBe(3);
    expect(nearestCardOf(11, 0, 12)).toBe(-1);
    expect(nearestCardOf(0, 23, 12)).toBe(24);
    expect(nearestCardOf(5, -30, 12)).toBe(-31);
  });

  it('always lands on a card that shows the project', () => {
    for (const from of [-17.3, -1, 0, 6.5, 40]) {
      for (let project = 0; project < 12; project++) {
        const card = nearestCardOf(project, from, 12);
        expect(projectAt(card, 12)).toBe(project);
        expect(Math.abs(card - Math.round(from))).toBeLessThanOrEqual(6);
      }
    }
  });
});

describe('stepFrom', () => {
  it('moves one card from a whole card', () => {
    expect(stepFrom(3, 1)).toBe(4);
    expect(stepFrom(3, -1)).toBe(2);
    expect(stepFrom(-5, -1)).toBe(-6);
  });

  it('moves to the next card in that direction from between two', () => {
    expect(stepFrom(INTRO_INDEX, 1)).toBe(0);
    expect(stepFrom(INTRO_INDEX, -1)).toBe(-1);
    expect(stepFrom(3.4, 1)).toBe(4);
    expect(stepFrom(3.4, -1)).toBe(3);
  });

  it('treats a value a hair off a card as that card', () => {
    expect(stepFrom(2.9999999, 1)).toBe(4);
    expect(stepFrom(3.0000001, -1)).toBe(2);
  });
});
