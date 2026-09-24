import { drawGlyph } from '../../../draw/glyphs';
import { drawIcon, type IconName } from '../../../draw/icons';
import { fillRect, fillRound, strokeRound } from '../../../draw/shapes';
import { text } from '../../../draw/text';
import { VIEW_HEIGHT } from '../../../draw/view';
import { avatar } from '../../../draw/widgets';
import { OPTAGON_THEME as T } from './theme';

export const SIDEBAR_WIDTH = 172;

const NAV: { icon: IconName; label: string }[] = [
  { icon: 'home', label: 'Overview' },
  { icon: 'folder', label: 'Projects' },
  { icon: 'play', label: 'Runs' },
  { icon: 'chart', label: 'Usage' },
  { icon: 'users', label: 'Members' },
  { icon: 'gear', label: 'Settings' },
];
const ACTIVE = 3;

/** Two overlapping rounded squares, a stand in brand mark. */
function logo(ctx: CanvasRenderingContext2D, x: number, y: number) {
  fillRound(ctx, x, y, 15, 15, 4, T.violet);
  ctx.globalAlpha = 0.9;
  fillRound(ctx, x + 7, y + 7, 15, 15, 4, T.teal);
  ctx.globalAlpha = 1;
  text(ctx, 'Backbond', x + 31, y + 12, { size: 16, weight: 700, family: 'sans', color: T.text });
}

export function drawSidebar(ctx: CanvasRenderingContext2D) {
  fillRect(ctx, 0, 0, SIDEBAR_WIDTH, VIEW_HEIGHT, T.sidebar);
  fillRect(ctx, SIDEBAR_WIDTH - 1, 0, 1, VIEW_HEIGHT, T.panelBorder);
  logo(ctx, 18, 16);

  // Organization switcher.
  fillRound(ctx, 12, 52, SIDEBAR_WIDTH - 24, 38, 8, T.panel);
  strokeRound(ctx, 12, 52, SIDEBAR_WIDTH - 24, 38, 8, T.panelBorder);
  fillRound(ctx, 20, 61, 20, 20, 5, '#134e4a');
  text(ctx, 'DO', 30, 72, { size: 9, weight: 700, family: 'sans', color: T.teal, align: 'center' });
  text(ctx, 'Demo org', 48, 66, { size: 12, weight: 600, family: 'sans', color: T.text });
  text(ctx, 'Sandbox', 48, 80, { size: 10.5, family: 'sans', color: T.muted });
  drawGlyph(ctx, 'chevronDown', SIDEBAR_WIDTH - 28, 71, 12, T.muted);

  text(ctx, 'WORKSPACE', 20, 112, { size: 9.5, weight: 600, family: 'sans', color: T.faint });
  NAV.forEach((item, index) => {
    const y = 122 + index * 32;
    const active = index === ACTIVE;
    if (active) {
      fillRound(ctx, 8, y, SIDEBAR_WIDTH - 16, 28, 6, T.hover);
      fillRound(ctx, 8, y + 6, 3, 16, 2, T.teal);
    }
    drawIcon(ctx, item.icon, 30, y + 14, 15, active ? T.text : T.muted, 1.5);
    text(ctx, item.label, 48, y + 15, { size: 13, weight: active ? 600 : 500, family: 'sans', color: active ? T.text : T.muted });
  });

  const bottom = VIEW_HEIGHT - 44;
  fillRect(ctx, 12, bottom - 12, SIDEBAR_WIDTH - 24, 1, T.panelBorder);
  avatar(ctx, 'EL', 30, bottom + 14, 13, '#4c3f99');
  text(ctx, 'Edison Law', 50, bottom + 8, { size: 12, weight: 600, family: 'sans', color: T.text });
  text(ctx, 'Engineer', 50, bottom + 22, { size: 10.5, family: 'sans', color: T.muted });
}
