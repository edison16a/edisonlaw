import { drawGlyph } from '../../../draw/glyphs';
import { drawIcon, type IconName } from '../../../draw/icons';
import { fillRect, fillRound, strokeRound } from '../../../draw/shapes';
import { text } from '../../../draw/text';
import { avatar } from '../../../draw/widgets';
import { SCREEN_HEIGHT } from '../../../types';
import { OPTAGON_THEME as T } from './theme';

export const SIDEBAR_WIDTH = 232;

const NAV: { icon: IconName; label: string }[] = [
  { icon: 'home', label: 'Overview' },
  { icon: 'folder', label: 'Projects' },
  { icon: 'play', label: 'Runs' },
  { icon: 'chart', label: 'Usage' },
  { icon: 'users', label: 'Members' },
  { icon: 'layers', label: 'Admin' },
  { icon: 'gear', label: 'Settings' },
];
const ACTIVE = 3;

/** Two overlapping rounded squares, a stand in brand mark. */
function logo(ctx: CanvasRenderingContext2D, x: number, y: number) {
  fillRound(ctx, x, y, 18, 18, 5, T.violet);
  ctx.globalAlpha = 0.9;
  fillRound(ctx, x + 8, y + 8, 18, 18, 5, T.teal);
  ctx.globalAlpha = 1;
  text(ctx, 'Backbond', x + 36, y + 14, { size: 18, weight: 700, family: 'sans', color: T.text });
}

export function drawSidebar(ctx: CanvasRenderingContext2D) {
  fillRect(ctx, 0, 0, SIDEBAR_WIDTH, SCREEN_HEIGHT, T.sidebar);
  fillRect(ctx, SIDEBAR_WIDTH - 1, 0, 1, SCREEN_HEIGHT, T.panelBorder);
  logo(ctx, 24, 22);

  // Organization switcher.
  fillRound(ctx, 16, 70, SIDEBAR_WIDTH - 32, 44, 9, T.panel);
  strokeRound(ctx, 16, 70, SIDEBAR_WIDTH - 32, 44, 9, T.panelBorder);
  fillRound(ctx, 26, 80, 24, 24, 6, '#134e4a');
  text(ctx, 'DO', 38, 93, { size: 10, weight: 700, family: 'sans', color: T.teal, align: 'center' });
  text(ctx, 'Demo org', 60, 86, { size: 13, weight: 600, family: 'sans', color: T.text });
  text(ctx, 'Sandbox workspace', 60, 102, { size: 11, family: 'sans', color: T.muted });
  drawGlyph(ctx, 'chevronDown', SIDEBAR_WIDTH - 36, 92, 14, T.muted);

  text(ctx, 'WORKSPACE', 26, 146, { size: 10.5, weight: 600, family: 'sans', color: T.faint });
  NAV.forEach((item, index) => {
    const y = 162 + index * 38;
    const active = index === ACTIVE;
    if (active) {
      fillRound(ctx, 12, y, SIDEBAR_WIDTH - 24, 32, 7, T.hover);
      fillRound(ctx, 12, y + 7, 3, 18, 2, T.teal);
    }
    drawIcon(ctx, item.icon, 38, y + 16, 17, active ? T.text : T.muted, 1.6);
    text(ctx, item.label, 58, y + 17, { size: 13.5, weight: active ? 600 : 500, family: 'sans', color: active ? T.text : T.muted });
  });

  const bottom = SCREEN_HEIGHT - 58;
  fillRect(ctx, 16, bottom - 14, SIDEBAR_WIDTH - 32, 1, T.panelBorder);
  avatar(ctx, 'EL', 38, bottom + 16, 16, '#4c3f99');
  text(ctx, 'Edison Law', 62, bottom + 9, { size: 13, weight: 600, family: 'sans', color: T.text });
  text(ctx, 'Engineer', 62, bottom + 25, { size: 11, family: 'sans', color: T.muted });
}
