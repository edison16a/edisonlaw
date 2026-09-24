/**
 * A terminal window with panes side by side, for showing real command line output.
 * The text is set in Geist Mono from the site's own dependencies.
 */
import { readFileSync } from 'node:fs';

const FONT_DIR = new URL('../../../../node_modules/geist/dist/fonts/geist-mono/', import.meta.url);

function fontFace(weight, file) {
  const data = readFileSync(new URL(file, FONT_DIR)).toString('base64');
  return `@font-face { font-family: 'Geist Mono'; font-weight: ${weight}; src: url(data:font/woff2;base64,${data}) format('woff2'); }`;
}

const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const TERMINAL_CSS = `
${fontFace(400, 'GeistMono-Regular.woff2')}
${fontFace(600, 'GeistMono-SemiBold.woff2')}
.term { position: absolute; display: flex; flex-direction: column; overflow: hidden; border-radius: 16px;
  background: #0b0e14; border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 50px 90px -30px rgba(0, 0, 0, 0.6), 0 18px 36px -12px rgba(0, 0, 0, 0.4); }
.term .bar { position: relative; flex: none; height: 44px; display: flex; align-items: center; gap: 9px; padding: 0 18px;
  background: #161b24; border-bottom: 1px solid rgba(255, 255, 255, 0.07); }
.term .bar i { width: 13px; height: 13px; border-radius: 50%; background: #3a404b; }
.term .bar span { position: absolute; left: 0; right: 0; text-align: center; color: #8b93a3;
  font: 600 14px 'Geist Mono', monospace; }
.term .panes { flex: 1; display: flex; min-height: 0; }
.term section { flex: var(--grow, 1); display: flex; flex-direction: column; min-width: 0; overflow: hidden; padding: 22px 26px;
  font: 400 16px/1.5 'Geist Mono', monospace; color: #d6dbe4; }
.term section + section { border-left: 1px solid rgba(255, 255, 255, 0.08); }
.term section.tail { justify-content: flex-end; color: #9aa3b2;
  mask-image: linear-gradient(to bottom, transparent 0, #000 96px); }
.term pre { margin: 0; font: inherit; white-space: pre; }
.term .prompt { color: #7ee787; }
.term .path { color: #79c0ff; }
`;

/**
 * `panes` is a list of { command, output, grow, tail }. A tail pane is anchored to the bottom,
 * like a terminal that has scrolled; the others read from the top, like a dashboard that
 * clears the screen.
 */
export function terminal({ title, cwd, panes, left, top, width, height }) {
  const sections = panes
    .map(({ command, output, grow = 1, tail = false }) => {
      const prompt = `<span class="path">${escape(cwd)}</span> <span class="prompt">$</span> ${escape(command)}`;
      return `<section class="${tail ? 'tail' : ''}" style="--grow: ${grow}"><pre>${prompt}\n${escape(output.trimEnd())}</pre></section>`;
    })
    .join('');

  return `<div class="term" style="left: ${left}px; top: ${top}px; width: ${width}px; height: ${height}px;">
<div class="bar"><i></i><i></i><i></i><span>${escape(title)}</span></div>
<div class="panes">${sections}</div>
</div>`;
}
