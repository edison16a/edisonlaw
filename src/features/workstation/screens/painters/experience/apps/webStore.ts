import { drawIcon, type IconName } from '../../../draw/icons';
import { fillRect, fillRound, strokeRound, type Rect } from '../../../draw/shapes';
import { text, textRun } from '../../../draw/text';
import { avatar, pill, progressBar } from '../../../draw/widgets';
import { EXTENSIONS, LISTING } from './data';
import { WEB_STORE_THEME as T } from './theme';

/** The Chrome Web Store developer console, zoomed in: the items list and one item's store listing. */

const NAV: IconName[] = ['grid', 'chart', 'card', 'user'];

const ROW_HEIGHT = 36;
/** Width of the icon rail the zoomed console collapses its navigation into. */
const RAIL = 44;

function storeMark(ctx: CanvasRenderingContext2D, x: number, y: number) {
  fillRound(ctx, x, y + 5, 22, 17, 4, '#1a73e8');
  ctx.strokeStyle = '#8ab4f8';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(x + 11, y + 5, 5, Math.PI, 0);
  ctx.stroke();
  fillRound(ctx, x + 7, y + 10, 8, 8, 4, '#ffffff');
}

function rail(ctx: CanvasRenderingContext2D, rect: Rect) {
  NAV.forEach((icon, index) => {
    const y = rect.y + 62 + index * 36;
    const active = index === 0;
    if (active) fillRound(ctx, rect.x + 6, y - 14, RAIL - 12, 28, 14, 'rgba(138,180,248,0.16)');
    drawIcon(ctx, icon, rect.x + RAIL / 2, y, 15, active ? T.blue : T.muted, 1.5);
  });
  avatar(ctx, 'EL', rect.x + RAIL / 2, rect.y + rect.h - 26, 12, '#5f6368');
}

function itemsTable(ctx: CanvasRenderingContext2D, x: number, top: number, w: number) {
  fillRound(ctx, x, top, w, 30 + EXTENSIONS.length * ROW_HEIGHT, 7, T.surface);
  const statusX = 214;
  text(ctx, 'Item', x + 12, top + 16, { size: 11, weight: 600, family: 'sans', color: T.muted });
  text(ctx, 'Status', x + statusX, top + 16, { size: 11, weight: 600, family: 'sans', color: T.muted });
  EXTENSIONS.forEach((item, index) => {
    const y = top + 30 + index * ROW_HEIGHT + ROW_HEIGHT / 2;
    fillRect(ctx, x, y - ROW_HEIGHT / 2, w, 1, T.border);
    fillRound(ctx, x + 12, y - 11, 22, 22, 5, item.color);
    text(ctx, item.initials, x + 23, y + 1, { size: 9.5, weight: 700, family: 'sans', color: '#ffffff', align: 'center' });
    text(ctx, item.name, x + 42, y + 1, { size: 12.5, weight: 600, family: 'sans', color: T.text });
    pill(ctx, 'Published', x + statusX, y, { bg: 'rgba(129,201,149,0.14)', color: T.green, size: 10 });
    drawIcon(ctx, 'more', x + w - 18, y, 15, T.muted, 1.6);
  });
}

/** Dashed drop zone with a package upload part way through. */
function dropZone(ctx: CanvasRenderingContext2D, rect: Rect, upload: number) {
  ctx.setLineDash([5, 4]);
  strokeRound(ctx, rect.x, rect.y, rect.w, rect.h, 6, T.border, 1.3);
  ctx.setLineDash([]);
  // The download arrow turned upside down reads as upload.
  ctx.save();
  ctx.translate(0, rect.y * 2 + 26);
  ctx.scale(1, -1);
  drawIcon(ctx, 'download', rect.x + 20, rect.y + 13, 14, T.blue, 1.5);
  ctx.restore();
  text(ctx, 'Drop a package to update', rect.x + 36, rect.y + 14, { size: 11, family: 'sans', color: T.text });
  const barY = rect.y + rect.h - 12;
  text(ctx, LISTING.file, rect.x + 12, barY - 11, { size: 10.5, family: 'sans', color: T.muted });
  text(ctx, `${Math.round(upload * 100)}%`, rect.x + rect.w - 12, barY - 11, { size: 10.5, weight: 600, family: 'sans', color: T.text, align: 'right' });
  progressBar(ctx, rect.x + 12, barY, rect.w - 24, 4, upload, T.blue, T.border);
}

function storeListing(ctx: CanvasRenderingContext2D, rect: Rect, upload: number) {
  fillRound(ctx, rect.x, rect.y, rect.w, rect.h, 7, T.surface);
  strokeRound(ctx, rect.x, rect.y, rect.w, rect.h, 7, T.border);
  text(ctx, 'Store listing', rect.x + 12, rect.y + 18, { size: 12.5, weight: 600, family: 'sans', color: T.text });
  text(ctx, LISTING.item.name, rect.x + rect.w - 12, rect.y + 18, { size: 11, family: 'sans', color: T.muted, align: 'right' });
  fillRect(ctx, rect.x, rect.y + 34, rect.w, 1, T.border);

  const x = rect.x + 12;
  const w = rect.w - 24;
  text(ctx, 'Summary', x, rect.y + 48, { size: 10.5, weight: 600, family: 'sans', color: T.muted });
  fillRound(ctx, x, rect.y + 56, w, 26, 5, T.field);
  strokeRound(ctx, x, rect.y + 56, w, 26, 5, T.border);
  text(ctx, LISTING.summary, x + 9, rect.y + 70, { size: 11.5, family: 'sans', color: T.text });
  text(ctx, 'Package', x, rect.y + 96, { size: 10.5, weight: 600, family: 'sans', color: T.muted });
  dropZone(ctx, { x, y: rect.y + 104, w, h: 58 }, upload);

  const buttonY = rect.y + rect.h - 34;
  fillRound(ctx, rect.x + rect.w - 124, buttonY, 112, 24, 12, T.blue);
  text(ctx, 'Submit for review', rect.x + rect.w - 68, buttonY + 12, { size: 11, weight: 600, family: 'sans', color: '#202124', align: 'center' });
  strokeRound(ctx, rect.x + rect.w - 208, buttonY, 76, 24, 12, T.border);
  text(ctx, 'Save draft', rect.x + rect.w - 170, buttonY + 12, { size: 11, weight: 600, family: 'sans', color: T.blue, align: 'center' });
}

export function drawWebStore(ctx: CanvasRenderingContext2D, rect: Rect, upload: number) {
  fillRect(ctx, rect.x, rect.y, rect.w, rect.h, T.background);
  storeMark(ctx, rect.x + 12, rect.y + 8);
  const after = textRun(ctx, 'Chrome Web Store', rect.x + 42, rect.y + 20, { size: 14.5, weight: 700, family: 'sans', color: T.text });
  text(ctx, 'Developer Dashboard', after + 8, rect.y + 20, { size: 14.5, family: 'sans', color: T.muted });
  fillRect(ctx, rect.x, rect.y + 40, rect.w, 1, T.border);
  rail(ctx, rect);

  const x = rect.x + RAIL + 8;
  const w = rect.w - RAIL - 8 - 14;
  text(ctx, 'Items', x, rect.y + 62, { size: 18, family: 'sans', color: T.text });
  fillRound(ctx, x + w - 80, rect.y + 50, 80, 24, 12, T.blue);
  text(ctx, 'New item', x + w - 40, rect.y + 62, { size: 11.5, weight: 600, family: 'sans', color: '#202124', align: 'center' });

  const top = rect.y + 84;
  itemsTable(ctx, x, top, w);
  const listingY = top + 30 + EXTENSIONS.length * ROW_HEIGHT + 12;
  storeListing(ctx, { x, y: listingY, w, h: rect.y + rect.h - 12 - listingY }, upload);
}
