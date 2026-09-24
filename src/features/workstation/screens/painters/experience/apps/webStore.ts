import { drawGlyph } from '../../../draw/glyphs';
import { drawIcon, type IconName } from '../../../draw/icons';
import { fillRect, fillRound, strokeRound, type Rect } from '../../../draw/shapes';
import { text, textRun } from '../../../draw/text';
import { avatar, pill, progressBar } from '../../../draw/widgets';
import { EXTENSIONS, LISTING } from './data';
import { WEB_STORE_THEME as T } from './theme';

/** The Chrome Web Store developer console: the items list and one item's store listing. */

const NAV: { icon: IconName; label: string }[] = [
  { icon: 'grid', label: 'Items' },
  { icon: 'chart', label: 'Analytics' },
  { icon: 'card', label: 'Payments' },
  { icon: 'user', label: 'Account' },
];

const ROW_HEIGHT = 50;

function storeMark(ctx: CanvasRenderingContext2D, x: number, y: number) {
  fillRound(ctx, x, y + 6, 26, 20, 4, '#1a73e8');
  ctx.strokeStyle = '#8ab4f8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x + 13, y + 6, 6, Math.PI, 0);
  ctx.stroke();
  fillRound(ctx, x + 8, y + 12, 10, 10, 5, '#ffffff');
}

function sidebar(ctx: CanvasRenderingContext2D, rect: Rect) {
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
  text(ctx, 'Publisher account', rect.x + 24, cardY + 55, { size: 11.5, family: 'sans', color: T.muted });
}

function itemsTable(ctx: CanvasRenderingContext2D, x: number, top: number, w: number) {
  fillRound(ctx, x, top, w, 44 + EXTENSIONS.length * ROW_HEIGHT, 8, T.surface);
  const columns = [
    ['Item', 16],
    ['Status', 262],
    ['Visibility', 360],
  ] as const;
  columns.forEach(([label, offset]) => text(ctx, label, x + offset, top + 22, { size: 12, weight: 600, family: 'sans', color: T.muted }));
  EXTENSIONS.forEach((item, index) => {
    const y = top + 62 + index * ROW_HEIGHT;
    fillRect(ctx, x, y - 25, w, 1, T.border);
    fillRound(ctx, x + 16, y - 15, 30, 30, 7, item.color);
    text(ctx, item.initials, x + 31, y + 1, { size: 11, weight: 700, family: 'sans', color: '#ffffff', align: 'center' });
    text(ctx, item.name, x + 56, y + 1, { size: 13.5, weight: 600, family: 'sans', color: T.text });
    pill(ctx, 'Published', x + 262, y, { bg: 'rgba(129,201,149,0.14)', color: T.green, size: 11 });
    text(ctx, 'Public', x + 360, y + 1, { size: 13.5, family: 'sans', color: T.text });
    drawIcon(ctx, 'more', x + w - 26, y, 18, T.muted, 1.6);
  });
}

function field(ctx: CanvasRenderingContext2D, label: string, value: string, x: number, y: number, w: number) {
  text(ctx, label, x, y, { size: 12, weight: 600, family: 'sans', color: T.muted });
  fillRound(ctx, x, y + 12, w, 34, 6, T.field);
  strokeRound(ctx, x, y + 12, w, 34, 6, T.border);
  text(ctx, value, x + 12, y + 30, { size: 13, family: 'sans', color: T.text });
}

/** Dashed drop zone with a package upload part way through. */
function dropZone(ctx: CanvasRenderingContext2D, rect: Rect, upload: number) {
  ctx.setLineDash([6, 5]);
  strokeRound(ctx, rect.x, rect.y, rect.w, rect.h, 8, T.border, 1.5);
  ctx.setLineDash([]);
  // The download arrow turned upside down reads as upload.
  ctx.save();
  ctx.translate(0, rect.y * 2 + 30);
  ctx.scale(1, -1);
  drawIcon(ctx, 'download', rect.x + 28, rect.y + 15, 18, T.blue, 1.6);
  ctx.restore();
  text(ctx, 'Drop a new package here to update this item', rect.x + 48, rect.y + 16, { size: 12.5, family: 'sans', color: T.text });
  const barY = rect.y + rect.h - 22;
  text(ctx, LISTING.file, rect.x + 18, barY - 14, { size: 12, family: 'sans', color: T.muted });
  text(ctx, `${Math.round(upload * 100)}%`, rect.x + rect.w - 18, barY - 14, { size: 12, weight: 600, family: 'sans', color: T.text, align: 'right' });
  progressBar(ctx, rect.x + 18, barY, rect.w - 36, 5, upload, T.blue, T.border);
}

function storeListing(ctx: CanvasRenderingContext2D, rect: Rect, upload: number) {
  fillRound(ctx, rect.x, rect.y, rect.w, rect.h, 8, T.surface);
  strokeRound(ctx, rect.x, rect.y, rect.w, rect.h, 8, T.border);
  text(ctx, 'Store listing', rect.x + 16, rect.y + 24, { size: 13, weight: 600, family: 'sans', color: T.text });
  text(ctx, LISTING.item.name, rect.x + rect.w - 16, rect.y + 24, { size: 12.5, family: 'sans', color: T.muted, align: 'right' });
  fillRect(ctx, rect.x, rect.y + 44, rect.w, 1, T.border);

  const x = rect.x + 16;
  const w = rect.w - 32;
  field(ctx, 'Summary', LISTING.summary, x, rect.y + 66, w);
  field(ctx, 'Language', 'English', x, rect.y + 130, 180);
  drawGlyph(ctx, 'chevronDown', x + 162, rect.y + 160, 14, T.muted);
  text(ctx, 'Package', x, rect.y + 194, { size: 12, weight: 600, family: 'sans', color: T.muted });
  dropZone(ctx, { x, y: rect.y + 206, w, h: 86 }, upload);

  const buttonY = rect.y + rect.h - 46;
  fillRound(ctx, rect.x + rect.w - 150, buttonY, 134, 32, 16, T.blue);
  text(ctx, 'Submit for review', rect.x + rect.w - 83, buttonY + 16, { size: 12.5, weight: 600, family: 'sans', color: '#202124', align: 'center' });
  strokeRound(ctx, rect.x + rect.w - 256, buttonY, 94, 32, 16, T.border);
  text(ctx, 'Save draft', rect.x + rect.w - 209, buttonY + 16, { size: 12.5, weight: 600, family: 'sans', color: T.blue, align: 'center' });
}

export function drawWebStore(ctx: CanvasRenderingContext2D, rect: Rect, upload: number) {
  fillRect(ctx, rect.x, rect.y, rect.w, rect.h, T.background);
  storeMark(ctx, rect.x + 18, rect.y + 12);
  const after = textRun(ctx, 'Chrome Web Store', rect.x + 56, rect.y + 28, { size: 15, weight: 600, family: 'sans', color: T.text });
  text(ctx, 'Developer Dashboard', after + 10, rect.y + 28, { size: 15, family: 'sans', color: T.muted });
  avatar(ctx, 'EL', rect.x + rect.w - 30, rect.y + 28, 15, '#5f6368');
  fillRect(ctx, rect.x, rect.y + 56, rect.w, 1, T.border);
  sidebar(ctx, rect);

  const x = rect.x + 184;
  const w = rect.w - 184 - 20;
  text(ctx, 'Items', x, rect.y + 90, { size: 22, family: 'sans', color: T.text });
  fillRound(ctx, x + w - 108, rect.y + 74, 108, 34, 17, T.blue);
  text(ctx, 'New item', x + w - 54, rect.y + 92, { size: 13, weight: 600, family: 'sans', color: '#202124', align: 'center' });

  const top = rect.y + 126;
  itemsTable(ctx, x, top, w);
  const listingY = top + 44 + EXTENSIONS.length * ROW_HEIGHT + 16;
  storeListing(ctx, { x, y: listingY, w, h: rect.y + rect.h - 20 - listingY }, upload);
}
