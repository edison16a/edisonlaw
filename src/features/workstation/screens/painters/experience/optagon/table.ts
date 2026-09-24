import { fillRect, type Rect } from '../../../draw/shapes';
import { text } from '../../../draw/text';
import { avatar, pill, progressBar } from '../../../draw/widgets';
import { card } from './card';
import { ORGS, type OrgStatus } from './data';
import { OPTAGON_THEME as T } from './theme';

const COLUMNS = [
  { label: 'Organization', x: 18 },
  { label: 'Plan', x: 280 },
  { label: 'Seats', x: 400 },
  { label: 'Usage this month', x: 480 },
  { label: 'MRR', x: 720 },
  { label: 'Status', x: 830 },
];

const STATUS: Record<OrgStatus, { bg: string; color: string }> = {
  Active: { bg: 'rgba(52,211,153,0.12)', color: T.green },
  Trialing: { bg: 'rgba(245,181,68,0.12)', color: T.amber },
  'Past due': { bg: 'rgba(248,113,113,0.12)', color: T.red },
};

const AVATAR_COLORS = ['#4c3f99', '#115e59', '#1e3a8a', '#6b21a8', '#7c2d12'];

export function drawOrganizations(ctx: CanvasRenderingContext2D, rect: Rect) {
  card(ctx, rect, 'Organizations');
  text(ctx, `${ORGS.length} of 126`, rect.x + rect.w - 18, rect.y + 24, { size: 12, family: 'sans', color: T.muted, align: 'right' });
  const headerY = rect.y + 52;
  fillRect(ctx, rect.x + 1, headerY - 12, rect.w - 2, 26, '#0d1118');
  COLUMNS.forEach((column) => {
    text(ctx, column.label.toUpperCase(), rect.x + column.x, headerY + 1, { size: 10.5, weight: 600, family: 'sans', color: T.faint });
  });

  ORGS.forEach((org, index) => {
    const y = headerY + 32 + index * 30;
    if (index > 0) fillRect(ctx, rect.x + 18, y - 15, rect.w - 36, 1, T.grid);
    const style = { size: 13, family: 'sans', color: T.text } as const;
    avatar(ctx, org.name[0], rect.x + 30, y, 11, AVATAR_COLORS[index]);
    text(ctx, org.name, rect.x + 50, y + 1, { ...style, weight: 600 });
    text(ctx, org.plan, rect.x + COLUMNS[1].x, y + 1, { ...style, color: T.muted });
    text(ctx, String(org.seats), rect.x + COLUMNS[2].x, y + 1, style);
    progressBar(ctx, rect.x + COLUMNS[3].x, y - 3, 150, 6, org.usage, org.usage > 0.9 ? T.amber : T.violet, '#1c2330');
    text(ctx, `${Math.round(org.usage * 100)}%`, rect.x + COLUMNS[3].x + 164, y + 1, { ...style, size: 12, color: T.muted });
    text(ctx, org.mrr, rect.x + COLUMNS[4].x, y + 1, style);
    const status = STATUS[org.status];
    pill(ctx, org.status, rect.x + COLUMNS[5].x, y, { ...status, size: 11, dot: status.color });
  });
}
