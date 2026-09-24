import { drawGlyph } from '../../draw/glyphs';
import { drawIcon, type IconName } from '../../draw/icons';
import { circle, fillRect, fillRound, strokeRound } from '../../draw/shapes';
import { measure, text } from '../../draw/text';
import { trafficLights } from '../../draw/window';
import { VIEW_HEIGHT, VIEW_WIDTH } from './layout';
import { VSCODE_THEME as T } from './theme';

/** Title bar, activity bar and status bar around the workbench. */

export const TITLE_HEIGHT = 35;
export const STATUS_HEIGHT = 22;
export const ACTIVITY_WIDTH = 48;

export function drawTitleBar(ctx: CanvasRenderingContext2D) {
  fillRect(ctx, 0, 0, VIEW_WIDTH, TITLE_HEIGHT, T.chrome);
  fillRect(ctx, 0, TITLE_HEIGHT - 1, VIEW_WIDTH, 1, T.border);
  trafficLights(ctx, 20, TITLE_HEIGHT / 2, 6);

  const boxWidth = 300;
  const boxX = (VIEW_WIDTH - boxWidth) / 2;
  drawGlyph(ctx, 'chevron', boxX - 52, TITLE_HEIGHT / 2, 16, T.icon);
  ctx.save();
  ctx.translate(boxX - 76, TITLE_HEIGHT / 2);
  ctx.scale(-1, 1);
  drawGlyph(ctx, 'chevron', 0, 0, 16, T.icon);
  ctx.restore();
  fillRound(ctx, boxX, 6, boxWidth, TITLE_HEIGHT - 12, 6, T.commandCenter);
  strokeRound(ctx, boxX, 6, boxWidth, TITLE_HEIGHT - 12, 6, '#353535');
  const label = 'edisonlaw';
  const labelWidth = measure(ctx, label, { size: 12.5, family: 'sans' });
  drawIcon(ctx, 'search', VIEW_WIDTH / 2 - labelWidth / 2 - 12, TITLE_HEIGHT / 2, 14, T.text);
  text(ctx, label, VIEW_WIDTH / 2 + 6, TITLE_HEIGHT / 2 + 1, { size: 12.5, family: 'sans', color: T.text, align: 'center' });

  const layout: IconName[] = ['split', 'layers', 'grid'];
  layout.forEach((icon, index) => drawIcon(ctx, icon, VIEW_WIDTH - 90 + index * 28, TITLE_HEIGHT / 2, 16, T.icon, 1.3));
}

export function drawActivityBar(ctx: CanvasRenderingContext2D) {
  const top = TITLE_HEIGHT;
  const height = VIEW_HEIGHT - TITLE_HEIGHT - STATUS_HEIGHT;
  fillRect(ctx, 0, top, ACTIVITY_WIDTH, height, T.chrome);
  fillRect(ctx, ACTIVITY_WIDTH - 1, top, 1, height, T.border);

  const icons: IconName[] = ['files', 'search', 'branch', 'debug', 'extensions'];
  icons.forEach((icon, index) => {
    const y = top + 26 + index * 48;
    const active = index === 0;
    if (active) fillRect(ctx, 0, y - 24, 2, 48, T.accent);
    drawIcon(ctx, icon, ACTIVITY_WIDTH / 2, y, 24, active ? '#d7d7d7' : T.icon, 1.4);
    if (icon === 'branch') {
      circle(ctx, ACTIVITY_WIDTH / 2 + 9, y + 9, 8, T.accent);
      text(ctx, '4', ACTIVITY_WIDTH / 2 + 9, y + 10, { size: 10, weight: 600, family: 'sans', color: T.bright, align: 'center' });
    }
  });
  const bottom = top + height;
  drawIcon(ctx, 'user', ACTIVITY_WIDTH / 2, bottom - 74, 24, T.icon, 1.4);
  drawIcon(ctx, 'gear', ACTIVITY_WIDTH / 2, bottom - 28, 24, T.icon, 1.4);
}

interface StatusInfo {
  line: number;
  col: number;
}

export function drawStatusBar(ctx: CanvasRenderingContext2D, { line, col }: StatusInfo) {
  const top = VIEW_HEIGHT - STATUS_HEIGHT;
  const middle = top + STATUS_HEIGHT / 2;
  fillRect(ctx, 0, top, VIEW_WIDTH, STATUS_HEIGHT, T.chrome);
  fillRect(ctx, 0, top, VIEW_WIDTH, 1, T.border);

  // Remote indicator, the one splash of accent colour in the bar.
  fillRect(ctx, 0, top, 36, STATUS_HEIGHT, T.accent);
  drawGlyph(ctx, 'chevron', 14, middle, 14, T.bright);
  ctx.save();
  ctx.translate(22, middle);
  ctx.scale(-1, 1);
  drawGlyph(ctx, 'chevron', 0, 0, 14, T.bright);
  ctx.restore();

  const style = { size: 12, family: 'sans', color: T.text } as const;
  let x = 48;
  drawIcon(ctx, 'branch', x, middle, 14, T.text, 1.2);
  text(ctx, 'feat/spiral-weight*', x + 12, middle + 1, style);
  x += 22 + measure(ctx, 'feat/spiral-weight*', style);
  drawIcon(ctx, 'sync', x, middle, 14, T.text, 1.2);
  x += 22;
  drawIcon(ctx, 'error', x, middle, 14, T.text, 1.2);
  text(ctx, '0', x + 10, middle + 1, style);
  drawIcon(ctx, 'warning', x + 30, middle, 14, T.text, 1.2);
  text(ctx, '0', x + 40, middle + 1, style);

  // The narrow zoomed window leaves room for the items VS Code keeps longest.
  const right = [`Ln ${line}, Col ${col}`, 'UTF-8', '{ } TypeScript JSX', 'Prettier'];
  let rx = VIEW_WIDTH - 40;
  drawIcon(ctx, 'bell', VIEW_WIDTH - 20, middle, 14, T.text, 1.2);
  for (const item of [...right].reverse()) {
    const width = measure(ctx, item, style);
    text(ctx, item, rx - width, middle + 1, style);
    rx -= width + 18;
  }
}
