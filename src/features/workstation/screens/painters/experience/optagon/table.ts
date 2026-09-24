import { fillRect, type Rect } from '../../../draw/shapes';
import { text } from '../../../draw/text';
import { avatar, pill, progressBar } from '../../../draw/widgets';
import { card } from './card';
import { KPIS, PROJECTS, type ProjectStatus } from './data';
import { OPTAGON_THEME as T } from './theme';

const COLUMNS = [
  { label: 'Project', x: 18 },
  { label: 'Type', x: 280 },
  { label: 'Runs', x: 400 },
  { label: 'Usage this month', x: 480 },
  { label: 'Last run', x: 720 },
  { label: 'Status', x: 830 },
];

const STATUS: Record<ProjectStatus, { bg: string; color: string }> = {
  Running: { bg: 'rgba(52,211,153,0.12)', color: T.green },
  Queued: { bg: 'rgba(245,181,68,0.12)', color: T.amber },
  Idle: { bg: 'rgba(138,148,166,0.12)', color: T.muted },
};

const AVATAR_COLORS = ['#4c3f99', '#115e59', '#1e3a8a', '#6b21a8', '#7c2d12'];

export function drawProjects(ctx: CanvasRenderingContext2D, rect: Rect) {
  card(ctx, rect, 'Projects');
  text(ctx, `${PROJECTS.length} of ${KPIS[2].value}`, rect.x + rect.w - 18, rect.y + 24, { size: 12, family: 'sans', color: T.muted, align: 'right' });
  const headerY = rect.y + 52;
  fillRect(ctx, rect.x + 1, headerY - 12, rect.w - 2, 26, '#0d1118');
  COLUMNS.forEach((column) => {
    text(ctx, column.label.toUpperCase(), rect.x + column.x, headerY + 1, { size: 10.5, weight: 600, family: 'sans', color: T.faint });
  });

  PROJECTS.forEach((project, index) => {
    const y = headerY + 32 + index * 30;
    if (index > 0) fillRect(ctx, rect.x + 18, y - 15, rect.w - 36, 1, T.grid);
    const style = { size: 13, family: 'sans', color: T.text } as const;
    avatar(ctx, project.name[0], rect.x + 30, y, 11, AVATAR_COLORS[index]);
    text(ctx, project.name, rect.x + 50, y + 1, { ...style, weight: 600 });
    text(ctx, project.kind, rect.x + COLUMNS[1].x, y + 1, { ...style, color: T.muted });
    text(ctx, String(project.runs), rect.x + COLUMNS[2].x, y + 1, style);
    progressBar(ctx, rect.x + COLUMNS[3].x, y - 3, 150, 6, project.usage, project.usage > 0.9 ? T.amber : T.violet, '#1c2330');
    text(ctx, `${Math.round(project.usage * 100)}%`, rect.x + COLUMNS[3].x + 164, y + 1, { ...style, size: 12, color: T.muted });
    text(ctx, project.lastRun, rect.x + COLUMNS[4].x, y + 1, { ...style, color: T.muted });
    const status = STATUS[project.status];
    pill(ctx, project.status, rect.x + COLUMNS[5].x, y, { ...status, size: 11, dot: status.color });
  });
}
