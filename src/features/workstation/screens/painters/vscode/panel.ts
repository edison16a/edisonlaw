import { drawGlyph } from '../../draw/glyphs';
import { drawIcon, type IconName } from '../../draw/icons';
import { fillRect, type Rect } from '../../draw/shapes';
import { measure, text } from '../../draw/text';
import { VSCODE_THEME as T } from './theme';

/** The terminal panel under the editor, running the dev server. */

/** The tabs a narrow panel keeps in view. */
const TABS = ['PROBLEMS', 'OUTPUT', 'TERMINAL'];
const LINE = 18;

type OutputLine = { mark?: 'triangle' | 'check'; text: string; dim?: string };

const BOOT: OutputLine[] = [
  { mark: 'triangle', text: 'Next.js 16.3.6', dim: ' (Turbopack)' },
  { text: '  Local:        http://localhost:3000' },
  { text: '' },
  { mark: 'check', text: 'Ready in 1412ms' },
  { text: 'GET / 200 in 812ms' },
];

function triangle(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath();
  ctx.moveTo(x, y - 5);
  ctx.lineTo(x + 5.5, y + 4.5);
  ctx.lineTo(x - 5.5, y + 4.5);
  ctx.closePath();
  ctx.fillStyle = T.text;
  ctx.fill();
}

/** `recompiles` adds a hot reload line for each save so far in the loop. */
export function drawPanel(ctx: CanvasRenderingContext2D, area: Rect, recompiles: number) {
  fillRect(ctx, area.x, area.y, area.w, area.h, T.chrome);
  fillRect(ctx, area.x, area.y, area.w, 1, T.border);

  let x = area.x + 20;
  const tabY = area.y + 18;
  for (const tab of TABS) {
    const active = tab === 'TERMINAL';
    const style = { size: 11, family: 'sans', color: active ? '#e7e7e7' : T.muted } as const;
    text(ctx, tab, x, tabY, style);
    const width = measure(ctx, tab, style);
    if (active) fillRect(ctx, x, tabY + 11, width, 1, T.accent);
    x += width + 24;
  }
  const tools: IconName[] = ['split', 'close'];
  text(ctx, 'zsh', area.x + area.w - 150, tabY, { size: 12, family: 'sans', color: T.text });
  tools.forEach((icon, index) => drawIcon(ctx, icon, area.x + area.w - 90 + index * 28, tabY, 15, T.icon, 1.2));

  const lines: OutputLine[] = [...BOOT];
  for (let i = 0; i < recompiles; i++) lines.push({ mark: 'check', text: `Compiled in ${[164, 138][i % 2]}ms` });
  const visible = Math.floor((area.h - 44) / LINE);
  // The newest lines, without a blank one left hanging at the top.
  const shown = lines.slice(-visible);
  if (!shown[0]?.text) shown.shift();
  shown.forEach((line, index) => {
    const y = area.y + 44 + index * LINE;
    const style = { size: 12.5, color: T.text } as const;
    if (line.mark === 'triangle') triangle(ctx, area.x + 26, y);
    if (line.mark === 'check') drawGlyph(ctx, 'check', area.x + 26, y, 14, '#2ea043');
    const textX = area.x + (line.mark ? 40 : 20);
    text(ctx, line.text, textX, y + 1, { ...style, weight: line.mark === 'triangle' ? 600 : 400 });
    if (line.dim) text(ctx, line.dim, textX + measure(ctx, line.text, style), y + 1, { ...style, color: T.muted });
  });
}
