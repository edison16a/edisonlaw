/**
 * Font families the screens paint with. next/font gives the site fonts generated names,
 * so they are read from the CSS variables on the root element instead of hard coded.
 */

export type FontKind = 'mono' | 'sans';

const FALLBACKS: Record<FontKind, string> = {
  mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
  sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
};

const VARIABLES: Record<FontKind, string> = {
  mono: '--font-geist-mono',
  sans: '--font-geist-sans',
};

/** Weights the painters use. The Geist files are variable, so one load covers each family. */
const WEIGHTS = [400, 600, 700];

let families: Record<FontKind, string> | null = null;
let loading: Promise<void> | null = null;

function readFamily(kind: FontKind) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(VARIABLES[kind]).trim();
  return value ? `${value}, ${FALLBACKS[kind]}` : FALLBACKS[kind];
}

/** CSS font-family lists for canvas fonts. Only call in the browser. */
export function fontFamilies(): Record<FontKind, string> {
  families ??= { mono: readFamily('mono'), sans: readFamily('sans') };
  return families;
}

/**
 * Resolves once the site fonts can be drawn on a canvas. Canvas text never triggers a web font
 * load by itself, so every family and weight is requested up front. Never rejects.
 */
export function loadScreenFonts(): Promise<void> {
  loading ??= (async () => {
    // Read the variables again in case the stylesheet arrived after the first paint.
    families = null;
    const { mono, sans } = fontFamilies();
    const requests = WEIGHTS.flatMap((weight) => [`${weight} 16px ${mono}`, `${weight} 16px ${sans}`]);
    try {
      await Promise.all(requests.map((font) => document.fonts.load(font)));
      await document.fonts.ready;
    } catch {
      // A failed load leaves the fallback fonts in place, which still paint fine.
    }
  })();
  return loading;
}
