import { gridLines, lineChart, scaleOf } from '../../../draw/charts';
import { drawGlyph } from '../../../draw/glyphs';
import { drawIcon, type IconName } from '../../../draw/icons';
import { fillRect, fillRound, strokeRound, type Rect } from '../../../draw/shapes';
import { text, textRun } from '../../../draw/text';
import { avatar, pill } from '../../../draw/widgets';
import { EXTENSIONS, WEEKLY_USERS } from './data';
import { WEB_STORE_THEME as T } from './theme';

/** The Chrome Web Store developer console: items, their status and weekly users. */

const NAV: { icon: IconName; label: string }[] = [
  { icon: 'grid', label: 'Items' },
  { icon: 'chart', label: 'Analytics' },
  { icon: 'card', label: 'Payments' },
  { icon: 'user', label: 'Account' },
];

function storeMark(ctx: CanvasRenderingContext2D, x: number, y: number) {
  fillRound(ctx, x, y + 6, 26, 20, 4, '#1a73e8');
  ctx.strokeStyle = '#8ab4f8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x + 13, y + 6, 6, Math.PI, 0);
  ctx.stroke();
  fillRound(ctx, x + 8, y + 12, 10, 10, 5, '#ffffff');
}

function stars(ctx: CanvasRenderingContext2D, x: number, y: number, rating: number) {
  drawIcon(ctx, 'star', x, y, 14, T.star, 1.4);
  text(ctx, rating.toFixed(1), x + 12, y + 1, { size: 13, family: 'sans', color: T.text });
}

export function drawWebStore(ctx: CanvasRenderingContext2D, rect: Rect, liveUsers: number) {
  fillRect(ctx, rect.x, rect.y, rect.w, rect.h, T.background);
  storeMark(ctx, rect.x + 18, rect.y + 12);
  const after = textRun(ctx, 'Chrome Web Store', rect.x + 56, rect.y + 28, { size: 15, weight: 600, family: 'sans', color: T.text });
  text(ctx, 'Developer Dashboard', after + 10, rect.y + 28, { size: 15, family: 'sans', color: T.muted });
  avatar(ctx, 'EL', rect.x + rect.w - 30, rect.y + 28, 15, '#5f6368');
  fillRect(ctx, rect.x, rect.y + 56, rect.w, 1, T.border);

  NAV.forEach((item, index) => {
    const y = rect.y + 76 + index * 40;
    const active = index === 0;
    if (active) fillRound(ctx, rect.x + 8, y, 156, 34, 17, 'rgba(138,180,248,0.16)');
    drawIcon(ctx, item.icon, rect.x + 32, y + 17, 17, active ? T.blue : T.muted, 1.5);
    text(ctx, item.label, rect.x + 54, y + 18, { size: 13.5, weight: active ? 600 : 400, family: 'sans', color: active ? T.blue : T.text });
  });

  // Publisher card at the foot of the navigation.
  const cardY = rect.y + rect.h - 96;
  fillRound(ctx, rect.x + 12, cardY, 152, 76, 10, T.surface);
  avatar(ctx, 'EL', rect.x + 36, cardY + 26, 13, '#5f6368');
  text(ctx, 'Edison Law', rect.x + 56, cardY + 27, { size: 13, weight: 600, family: 'sans', color: T.text });
  drawGlyph(ctx, 'check', rect.x + 30, cardY + 54, 14, T.green);
  text(ctx, 'Verified publisher', rect.x + 42, cardY + 55, { size: 11.5, family: 'sans', color: T.muted });

  const x = rect.x + 184;
  const w = rect.w - 184 - 20;
  text(ctx, 'Items', x, rect.y + 90, { size: 22, family: 'sans', color: T.text });
  fillRound(ctx, x + w - 108, rect.y + 74, 108, 34, 17, T.blue);
  text(ctx, 'New item', x + w - 54, rect.y + 92, { size: 13, weight: 600, family: 'sans', color: '#202124', align: 'center' });

  const top = rect.y + 126;
  fillRound(ctx, x, top, w, 300, 8, T.surface);
  const columns = [
    ['Item', 16],
    ['Status', 262],
    ['Weekly users', 352],
    ['Rating', 440],
  ] as const;
  columns.forEach(([label, offset]) => text(ctx, label, x + offset, top + 22, { size: 12, weight: 600, family: 'sans', color: T.muted }));
  EXTENSIONS.forEach((item, index) => {
    const y = top + 62 + index * 50;
    fillRect(ctx, x, y - 25, w, 1, T.border);
    fillRound(ctx, x + 16, y - 15, 30, 30, 7, item.color);
    text(ctx, item.initials, x + 31, y + 1, { size: 11, weight: 700, family: 'sans', color: '#ffffff', align: 'center' });
    text(ctx, item.name, x + 56, item.featured ? y - 7 : y + 1, { size: 13.5, weight: 600, family: 'sans', color: T.text });
    if (item.featured) {
      // The featured badge Google gives hand picked extensions.
      fillRound(ctx, x + 56, y + 3, 70, 17, 8.5, 'rgba(138,180,248,0.16)');
      drawIcon(ctx, 'star', x + 67, y + 11.5, 10, T.blue, 1.4);
      text(ctx, 'Featured', x + 76, y + 12.5, { size: 10.5, weight: 600, family: 'sans', color: T.blue });
    }
    pill(ctx, 'Published', x + 262, y, { bg: 'rgba(129,201,149,0.14)', color: T.green, size: 11 });
    const users = index === 0 ? liveUsers : item.users;
    text(ctx, users.toLocaleString('en-US'), x + 352, y + 1, { size: 13.5, family: 'sans', color: T.text });
    stars(ctx, x + 446, y, item.rating);
  });

  const chart = { x, y: top + 316, w, h: rect.y + rect.h - top - 336 };
  fillRound(ctx, chart.x, chart.y, chart.w, chart.h, 8, T.surface);
  strokeRound(ctx, chart.x, chart.y, chart.w, chart.h, 8, T.border);
  text(ctx, 'Weekly users, all items', chart.x + 16, chart.y + 22, { size: 13, weight: 600, family: 'sans', color: T.text });
  const total = EXTENSIONS.reduce((sum, item) => sum + item.users, 0) + (liveUsers - EXTENSIONS[0].users);
  text(ctx, total.toLocaleString('en-US'), chart.x + chart.w - 16, chart.y + 22, { size: 13, weight: 600, family: 'sans', color: T.blue, align: 'right' });
  const plot = { x: chart.x + 16, y: chart.y + 40, w: chart.w - 32, h: chart.h - 56 };
  gridLines(ctx, plot, 3, T.border, [3, 4]);
  lineChart(ctx, plot, WEEKLY_USERS, scaleOf(WEEKLY_USERS), { color: T.blue, width: 2, fill: 'rgba(138,180,248,0.22)' });
}
