/**
 * A screenshot of a whole app window shown as the window itself, with its own rounded corners
 * and a soft shadow, on a backdrop in the app's tones. The screenshot keeps its shape: it is
 * wider than 16:10, so the backdrop fills the rest.
 */
import { CARD_HEIGHT, CARD_WIDTH } from '../encode.mjs';
import { shell } from './base.mjs';

/**
 * `src` is the screenshot, `aspect` its width over height, `margin` the space at its sides,
 * `radius` its corners and `background` any CSS background for the backdrop.
 */
export function appWindow({ src, aspect, margin = 48, radius = 22, background, edge = '#fafbf8' }) {
  const width = CARD_WIDTH - 2 * margin;
  const height = width / aspect;
  const css = `
body { display: grid; place-items: center; }
.window { width: ${width}px; height: ${height}px; border-radius: ${radius}px; overflow: hidden; background: ${edge};
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.7) inset, 0 0 0 1px rgba(60, 30, 40, 0.1),
    0 30px 70px -20px rgba(80, 30, 45, 0.28), 0 10px 24px -12px rgba(40, 20, 25, 0.18); }
.window img { display: block; width: 100%; height: 100%; }`;
  return shell({ background, css, body: `<div class="window"><img src="${src}"></div>` });
}

export { CARD_HEIGHT, CARD_WIDTH };
