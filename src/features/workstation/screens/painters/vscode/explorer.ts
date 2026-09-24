import { drawGlyph } from '../../draw/glyphs';
import { drawIcon } from '../../draw/icons';
import { fillRect, type Rect } from '../../draw/shapes';
import { fitText, font, text } from '../../draw/text';
import { drawFileIcon } from './fileIcon';
import { VSCODE_THEME as T } from './theme';

/** The explorer side bar, showing this repo opened down to the spiral card. */

type GitState = 'M' | 'U';

interface TreeRow {
  depth: number;
  name: string;
  /** Folders get a chevron. True means expanded. */
  open?: boolean;
  git?: GitState;
  /** A folder holding changed files. */
  dirty?: boolean;
  active?: boolean;
}

/** Trimmed to what fits the zoomed side bar: the path down to the file being edited. */
const TREE: TreeRow[] = [
  { depth: 0, name: 'src', open: true, dirty: true },
  { depth: 1, name: 'app', open: false },
  { depth: 1, name: 'features', open: true, dirty: true },
  { depth: 2, name: 'experience', open: false },
  { depth: 2, name: 'projects', open: true, dirty: true },
  { depth: 3, name: 'spiral', open: true, dirty: true },
  { depth: 4, name: 'card.frag' },
  { depth: 4, name: 'layout.ts', git: 'M' },
  { depth: 4, name: 'SpiralCard.tsx', git: 'M', active: true },
  { depth: 4, name: 'SpiralScene.tsx' },
  { depth: 4, name: 'useSpiralMotion.ts', git: 'M' },
  { depth: 4, name: 'motion.test.ts', git: 'U' },
  { depth: 2, name: 'workstation', open: false },
];

const ROW = 22;
const INDENT = 8;
/** Room kept at the right of each row for the git letter. */
const BADGE_WIDTH = 34;

function sectionHeader(ctx: CanvasRenderingContext2D, x: number, y: number, label: string, open: boolean) {
  drawGlyph(ctx, open ? 'chevronDown' : 'chevron', x + 10, y + ROW / 2, 14, T.text);
  text(ctx, label, x + 20, y + ROW / 2 + 1, { size: 11, weight: 700, family: 'sans', color: T.text });
}

export function drawExplorer(ctx: CanvasRenderingContext2D, area: Rect) {
  fillRect(ctx, area.x, area.y, area.w, area.h, T.chrome);
  fillRect(ctx, area.x + area.w - 1, area.y, 1, area.h, T.border);
  text(ctx, 'EXPLORER', area.x + 20, area.y + 18, { size: 11, family: 'sans', color: T.text });
  drawIcon(ctx, 'more', area.x + area.w - 24, area.y + 18, 16, T.text);

  let y = area.y + 36;
  sectionHeader(ctx, area.x, y, 'EDISONLAW', true);
  y += ROW;

  for (const row of TREE) {
    const indentX = area.x + 12 + row.depth * INDENT;
    if (row.active) {
      fillRect(ctx, area.x, y, area.w - 1, ROW, T.selection);
    }
    // Indent guides for nested rows.
    for (let level = 1; level <= row.depth; level++) {
      fillRect(ctx, area.x + 18 + (level - 1) * INDENT, y, 1, ROW, '#303030');
    }
    const middle = y + ROW / 2;
    let labelX = indentX + 20;
    if (row.open !== undefined) {
      drawGlyph(ctx, row.open ? 'chevronDown' : 'chevron', indentX + 6, middle, 14, T.text);
    } else {
      drawFileIcon(ctx, row.name, indentX + 12, middle);
      labelX = indentX + 26;
    }
    const color = row.git === 'M' ? T.modified : row.git === 'U' ? T.untracked : row.dirty ? T.modified : T.text;
    const style = { size: 13, family: 'sans', color } as const;
    ctx.font = font(style.size, 400, style.family);
    text(ctx, fitText(ctx, row.name, area.x + area.w - BADGE_WIDTH - labelX), labelX, middle + 1, style);
    if (row.git) {
      text(ctx, row.git, area.x + area.w - 22, middle + 1, { size: 12, family: 'sans', weight: 600, color, align: 'center' });
    } else if (row.dirty) {
      ctx.beginPath();
      ctx.arc(area.x + area.w - 22, middle, 3, 0, Math.PI * 2);
      ctx.fillStyle = T.modified;
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    y += ROW;
  }

  // Collapsed sections pinned to the bottom of the side bar.
  const bottom = area.y + area.h;
  for (const [index, label] of ['OUTLINE', 'TIMELINE'].entries()) {
    const sectionY = bottom - ROW * (2 - index);
    fillRect(ctx, area.x, sectionY, area.w - 1, 1, T.border);
    sectionHeader(ctx, area.x, sectionY, label, false);
  }
}
