import { drawIcon, type IconName } from '../../../draw/icons';
import { circle, fillRect, fillRound, strokeRound, type Rect } from '../../../draw/shapes';
import { text, textRun } from '../../../draw/text';
import { avatar, pill } from '../../../draw/widgets';
import { VIEW_WIDTH } from '../../../draw/view';
import { pixelScale } from '../../../resolution';
import { CISCO_THEME as T } from './theme';

/** Video meeting chrome: title bar, participant tiles and the control bar. */

interface Participant {
  name: string;
  /** Wall and shirt colours for the camera feed, or null for a camera that is off. */
  feed: { wall: string; shirt: string; skin: string } | null;
  muted: boolean;
}

const PEOPLE: Participant[] = [
  { name: 'Priya N.', feed: { wall: '#3c4a5c', shirt: '#1d3557', skin: '#b98b6e' }, muted: false },
  { name: 'Marcus T.', feed: { wall: '#5a4a3c', shirt: '#2f3e46', skin: '#8d5b3e' }, muted: true },
  { name: 'Dana K.', feed: { wall: '#34473f', shirt: '#6d597a', skin: '#e0b89a' }, muted: true },
  { name: 'Edison Law (you)', feed: null, muted: true },
];

/** A soft, out of focus webcam frame: a lit wall, a head and shoulders. */
function cameraFeed(ctx: CanvasRenderingContext2D, rect: Rect, feed: NonNullable<Participant['feed']>) {
  const wall = ctx.createRadialGradient(rect.x + rect.w * 0.3, rect.y + rect.h * 0.2, 10, rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w * 0.8);
  wall.addColorStop(0, feed.wall);
  wall.addColorStop(1, '#141414');
  fillRect(ctx, rect.x, rect.y, rect.w, rect.h, wall);
  const cx = rect.x + rect.w / 2;
  // Webcams are soft, and the blur hides how simple the shapes are. Filters ignore the transform.
  ctx.filter = `blur(${1.5 * pixelScale(ctx)}px)`;
  ctx.fillStyle = feed.shirt;
  ctx.beginPath();
  ctx.ellipse(cx, rect.y + rect.h + 8, rect.w * 0.3, rect.h * 0.42, 0, Math.PI, 0);
  ctx.fill();
  fillRect(ctx, cx - rect.h * 0.07, rect.y + rect.h * 0.6, rect.h * 0.14, rect.h * 0.16, feed.skin);
  ctx.fillStyle = '#2a1d16';
  ctx.beginPath();
  ctx.ellipse(cx, rect.y + rect.h * 0.4, rect.h * 0.21, rect.h * 0.23, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = feed.skin;
  ctx.beginPath();
  ctx.ellipse(cx, rect.y + rect.h * 0.47, rect.h * 0.17, rect.h * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.filter = 'none';
}

function cameraIcon(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.roundRect(x - 10, y - 6, 14, 12, 2);
  ctx.moveTo(x + 4, y - 1);
  ctx.lineTo(x + 10, y - 5);
  ctx.lineTo(x + 10, y + 5);
  ctx.lineTo(x + 4, y + 1);
  ctx.stroke();
}

function shareIcon(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.roundRect(x - 10, y - 7, 20, 14, 2);
  ctx.moveTo(x, y + 3);
  ctx.lineTo(x, y - 3);
  ctx.moveTo(x - 3.5, y);
  ctx.lineTo(x, y - 3.5);
  ctx.lineTo(x + 3.5, y);
  ctx.stroke();
}

function micIcon(ctx: CanvasRenderingContext2D, x: number, y: number, muted: boolean) {
  ctx.strokeStyle = muted ? T.red : '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x - 3, y - 7, 6, 10, 3);
  ctx.moveTo(x - 6, y);
  ctx.arc(x, y, 6, Math.PI, 0, true);
  ctx.moveTo(x, y + 6);
  ctx.lineTo(x, y + 8);
  if (muted) {
    ctx.moveTo(x - 7, y - 8);
    ctx.lineTo(x + 7, y + 8);
  }
  ctx.stroke();
}

export function drawParticipants(ctx: CanvasRenderingContext2D, area: Rect, speaker: number, pulse: number) {
  const gap = 8;
  const h = (area.h - gap * (PEOPLE.length - 1)) / PEOPLE.length;
  PEOPLE.forEach((person, index) => {
    const rect = { x: area.x, y: area.y + index * (h + gap), w: area.w, h };
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 8);
    ctx.clip();
    if (person.feed) cameraFeed(ctx, rect, person.feed);
    else {
      fillRect(ctx, rect.x, rect.y, rect.w, rect.h, T.tile);
      avatar(ctx, 'EL', rect.x + rect.w / 2, rect.y + rect.h / 2 - 8, 20, '#3b5bdb');
    }
    ctx.restore();
    const labelWidth = pill(ctx, person.name, rect.x + 6, rect.y + rect.h - 14, { bg: 'rgba(0,0,0,0.6)', color: '#ffffff', size: 10 });
    micIcon(ctx, rect.x + labelWidth + 18, rect.y + rect.h - 14, person.muted);
    if (index === speaker) strokeRound(ctx, rect.x, rect.y, rect.w, rect.h, 8, `rgba(62,207,142,${0.65 + pulse * 0.35})`, 2.5);
  });
}

export function drawTitleBar(ctx: CanvasRenderingContext2D, height: number, elapsed: string) {
  fillRect(ctx, 0, 0, VIEW_WIDTH, height, T.chrome);
  const after = textRun(ctx, 'Network design review', 14, height / 2 + 1, { size: 14.5, weight: 700, family: 'sans', color: T.text });
  text(ctx, 'Career Exploration Program', after + 12, height / 2 + 1, { size: 12, family: 'sans', color: T.muted });
  circle(ctx, VIEW_WIDTH - 156, height / 2, 4, T.red);
  text(ctx, `REC  ${elapsed}`, VIEW_WIDTH - 146, height / 2 + 1, { size: 11, weight: 600, family: 'mono', color: T.text });
  (['grid', 'users'] as IconName[]).forEach((icon, index) => drawIcon(ctx, icon, VIEW_WIDTH - 50 + index * 24, height / 2, 15, T.muted, 1.4));
}

export function drawControls(ctx: CanvasRenderingContext2D, top: number, height: number) {
  fillRect(ctx, 0, top, VIEW_WIDTH, height, T.chrome);
  const middle = top + height / 2;
  const buttons: { icon: IconName | 'mic' | 'camera' | 'share'; label: string; active?: boolean }[] = [
    { icon: 'mic', label: 'Unmute' },
    { icon: 'camera', label: 'Video' },
    { icon: 'share', label: 'Share', active: true },
    { icon: 'star', label: 'React' },
    { icon: 'users', label: 'People' },
    { icon: 'more', label: 'More' },
  ];
  const spacing = 56;
  const start = VIEW_WIDTH / 2 - ((buttons.length - 1) * spacing) / 2;
  buttons.forEach((button, index) => {
    const x = start + index * spacing;
    fillRound(ctx, x - 18, middle - 20, 36, 26, 8, button.active ? 'rgba(0,188,235,0.22)' : '#2a2b2e');
    const color = button.active ? T.cyan : '#e6e6e6';
    if (button.icon === 'mic') micIcon(ctx, x, middle - 7, true);
    else if (button.icon === 'camera') cameraIcon(ctx, x, middle - 7, color);
    else if (button.icon === 'share') shareIcon(ctx, x, middle - 7, color);
    else drawIcon(ctx, button.icon, x, middle - 7, 16, color, 1.5);
    text(ctx, button.label, x, middle + 16, { size: 9.5, family: 'sans', color: button.active ? T.cyan : T.muted, align: 'center' });
  });
  fillRound(ctx, VIEW_WIDTH - 88, middle - 14, 74, 28, 14, T.red);
  text(ctx, 'Leave', VIEW_WIDTH - 51, middle + 1, { size: 12, weight: 700, family: 'sans', color: '#ffffff', align: 'center' });
}
