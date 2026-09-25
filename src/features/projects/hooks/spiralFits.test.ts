import { describe, expect, it } from 'vitest';
import { CAROUSEL_ONLY, CAROUSEL_QUERY, STAGE_ONLY, STAGE_QUERY } from './useSpiralFits';

/** Evaluates the plain media queries used here: lists of (min or max width or height) joined by "and". */
function matches(query: string, width: number, height: number) {
  return query.split(',').some((alternative) =>
    [...alternative.matchAll(/\((min|max)-(width|height):\s*(\d+)px\)/g)].every(([, bound, side, value]) => {
      const size = side === 'width' ? width : height;
      return bound === 'min' ? size >= Number(value) : size <= Number(value);
    }),
  );
}

/** The media queries behind a list of `...:hidden` classes, one per class. */
function hiddenBy(classes: string) {
  return classes.split(' ').map((name) =>
    name === 'max-md:hidden' ? '(max-width: 767px)' : name.replace(/^\[@media(.*)\]:hidden$/, '$1').replaceAll('_', ' '),
  );
}

const SIZES: [number, number][] = [];
for (const width of [320, 390, 767, 768, 900, 1023, 1024, 1440, 2560]) {
  for (const height of [400, 520, 521, 600, 699, 700, 900, 1400]) SIZES.push([width, height]);
}

describe('where the spiral stage fits', () => {
  it('gives each screen the stage or the carousel, never both', () => {
    for (const [width, height] of SIZES) {
      expect(matches(STAGE_QUERY, width, height)).toBe(!matches(CAROUSEL_QUERY, width, height));
    }
  });

  it('has classes that hide the same things before the client knows the screen', () => {
    for (const [width, height] of SIZES) {
      const stage = matches(STAGE_QUERY, width, height);
      expect(hiddenBy(STAGE_ONLY).some((query) => matches(query, width, height))).toBe(!stage);
      expect(hiddenBy(CAROUSEL_ONLY).some((query) => matches(query, width, height))).toBe(stage);
    }
  });

  it('keeps the stage on tablets and wide windows, and hands short narrow windows to the carousel', () => {
    expect(matches(STAGE_QUERY, 768, 1024)).toBe(true);
    expect(matches(STAGE_QUERY, 1024, 768)).toBe(true);
    expect(matches(STAGE_QUERY, 1440, 600)).toBe(true);
    expect(matches(STAGE_QUERY, 900, 600)).toBe(false);
    expect(matches(STAGE_QUERY, 844, 390)).toBe(false);
  });
});
