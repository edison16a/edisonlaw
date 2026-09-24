import { describe, expect, it } from 'vitest';
import { hasGallery, MAX_PICTURES, projectPictures } from './pictures';

describe('projectPictures', () => {
  it('puts the thumbnail first, then the screenshots', () => {
    expect(projectPictures({ image: '/a.webp', screenshots: ['/b.webp', '/c.webp'] })).toEqual(['/a.webp', '/b.webp', '/c.webp']);
  });

  it('is just the thumbnail for a project without screenshots', () => {
    expect(projectPictures({ image: '/a.webp' })).toEqual(['/a.webp']);
    expect(hasGallery({ image: '/a.webp' })).toBe(false);
    expect(hasGallery({ image: '/a.webp', screenshots: [] })).toBe(false);
    expect(hasGallery({ image: '/a.webp', screenshots: ['/b.webp'] })).toBe(true);
  });

  it('never shows more than the limit', () => {
    const screenshots = Array.from({ length: 8 }, (_, index) => `/${index}.webp`);
    expect(projectPictures({ image: '/a.webp', screenshots })).toHaveLength(MAX_PICTURES);
  });
});
