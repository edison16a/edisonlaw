import { fillRect, type Rect } from '../../../draw/shapes';
import { text } from '../../../draw/text';
import { avatar, pill, progressBar } from '../../../draw/widgets';
import { card } from './card';
import { KPIS, PROJECTS, type ProjectStatus } from './data';
import { OPTAGON_THEME as T } from './theme';

/** Columns the zoomed page has room for, as offsets from the card's left edge. */
const COLUMNS = [
  { label: 'Project', x: 14 },
  { label: 'Runs', x: 186 },
  { label: 'Usage this month', x: 244 },
  { label: 'Last run', x: 412 },
  { label: 'Status', x: 496 },
];
const ROWS = 3;
const ROW_HEIGHT = 22;

const STATUS: Record<ProjectStatus, { bg: string; color: string }> = {
  Running: { bg: 'rgba(52,211,153,0.14)', color: T.green },
  Queued: { bg: 'rgba(245,181,68,0.14)', color: T.amber },
  Idle: { bg: 'rgba(138,148,166,0.14)', color: T.muted },
};

const AVATAR_COLORS = ['#4c3f99', '#115e59', '#1e3a8a', '#6b21a8', '#7c2d12'];

export function drawProjects(ctx: CanvasRenderingContext2D, rect: Rect) {
  card(ctx, rect, 'Projects');
  text(ctx, `${ROWS} of ${KPIS[2].value}`, rect.x + rect.w - 14, rect.y + 20, { size: 11, family: 'sans', color: T.muted, align: 'right' });
  const headerY = rect.y + 38;
  fillRect(ctx, rect.x + 1, headerY - 10, rect.w - 2, 20, '#0d1118');
  COLUMNS.forEach((column) => {
    text(ctx, column.label.toUpperCase(), rect.x + column.x, headerY + 1, { size: 9.5, weight: 600, family: 'sans', color: T.faint });
  });

  PROJECTS.slice(0, ROWS).forEach((project, index) => {
    const y = headerY + 22 + index * ROW_HEIGHT;
    if (index > 0) fillRect(ctx, rect.x + 14, y - ROW_HEIGHT / 2, rect.w - 28, 1, T.grid);
    const style = { size: 12, family: 'sans', color: T.text } as const;
    avatar(ctx, project.name[0], rect.x + 22, y, 8, AVATAR_COLORS[index]);
    text(ctx, project.name, rect.x + 36, y + 1, { ...style, weight: 600 });
    text(ctx, String(project.runs), rect.x + COLUMNS[1].x, y + 1, style);
    progressBar(ctx, rect.x + COLUMNS[2].x, y - 3, 110, 6, project.usage, project.usage > 0.9 ? T.amber : T.violet, '#1c2330');
    text(ctx, `${Math.round(project.usage * 100)}%`, rect.x + COLUMNS[2].x + 120, y + 1, { ...style, size: 11, color: T.muted });
    text(ctx, project.lastRun, rect.x + COLUMNS[3].x, y + 1, { ...style, size: 11.5, color: T.muted });
    const status = STATUS[project.status];
    pill(ctx, project.status, rect.x + COLUMNS[4].x, y, { ...status, size: 10, dot: status.color });
  });
}
