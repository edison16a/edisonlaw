import { describe, expect, it } from 'vitest';
import { selectPicture, NO_SELECTION, shownPicture } from './selection';

describe('gallery selection', () => {
  it('shows the thumbnail of every project until a screenshot is picked', () => {
    expect(shownPicture(NO_SELECTION, 0)).toBe(0);
    expect(shownPicture(NO_SELECTION, 8)).toBe(0);
  });

  it('shows the picked screenshot on its own project only', () => {
    const picked = selectPicture(8, 3, 5);
    expect(shownPicture(picked, 8)).toBe(3);
    expect(shownPicture(picked, 7)).toBe(0);
  });

  it('keeps the pick within the pictures the project has', () => {
    expect(selectPicture(8, 9, 5)).toEqual({ project: 8, picture: 4 });
    expect(selectPicture(8, -2, 5)).toBe(NO_SELECTION);
    expect(selectPicture(2, 1, 1)).toBe(NO_SELECTION);
  });

  it('goes back to no pick at all when the thumbnail is chosen again', () => {
    expect(selectPicture(8, 0, 5)).toBe(NO_SELECTION);
  });
});
