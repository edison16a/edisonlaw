/**
 * Simple line icons for app chrome, drawn centred on (x, y) in a box of `size` pixels.
 * They stay deliberately plain: at monitor distance only the silhouette reads.
 */

export type IconName =
  | 'files'
  | 'search'
  | 'branch'
  | 'debug'
  | 'extensions'
  | 'user'
  | 'gear'
  | 'bell'
  | 'home'
  | 'chart'
  | 'users'
  | 'card'
  | 'folder'
  | 'layers'
  | 'grid'
  | 'close'
  | 'more'
  | 'split'
  | 'sync'
  | 'error'
  | 'warning'
  | 'play'
  | 'download'
  | 'star';

export function drawIcon(ctx: CanvasRenderingContext2D, name: IconName, x: number, y: number, size: number, color: string, lineWidth = 1.5) {
  const s = size / 24;
  ctx.save();
  ctx.translate(x - 12 * s, y - 12 * s);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth / s;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  PATHS[name](ctx);
  ctx.stroke();
  ctx.restore();
}

type PathFn = (ctx: CanvasRenderingContext2D) => void;

const PATHS: Record<IconName, PathFn> = {
  files: (c) => {
    c.moveTo(9, 3);
    c.lineTo(16, 3);
    c.lineTo(20, 7);
    c.lineTo(20, 18);
    c.lineTo(9, 18);
    c.closePath();
    c.moveTo(6, 7);
    c.lineTo(6, 21);
    c.lineTo(16, 21);
  },
  search: (c) => {
    c.arc(10.5, 10.5, 6, 0, Math.PI * 2);
    c.moveTo(15, 15);
    c.lineTo(20.5, 20.5);
  },
  branch: (c) => {
    c.arc(7, 5.5, 2.2, 0, Math.PI * 2);
    c.moveTo(9.2, 18.5);
    c.arc(7, 18.5, 2.2, 0, Math.PI * 2);
    c.moveTo(19.2, 8.5);
    c.arc(17, 8.5, 2.2, 0, Math.PI * 2);
    c.moveTo(7, 7.7);
    c.lineTo(7, 16.3);
    c.moveTo(17, 10.7);
    c.bezierCurveTo(17, 14, 7, 12, 7, 16);
  },
  debug: (c) => {
    c.moveTo(7, 4);
    c.lineTo(19, 12);
    c.lineTo(7, 20);
    c.closePath();
  },
  extensions: (c) => {
    c.rect(4, 10, 5, 5);
    c.rect(4, 15, 5, 5);
    c.rect(9, 15, 5, 5);
    c.rect(13.5, 4.5, 5, 5);
  },
  user: (c) => {
    c.arc(12, 8.5, 4, 0, Math.PI * 2);
    c.moveTo(4.5, 20.5);
    c.bezierCurveTo(5.5, 15, 18.5, 15, 19.5, 20.5);
  },
  gear: (c) => {
    c.arc(12, 12, 3, 0, Math.PI * 2);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      c.moveTo(12 + Math.cos(a) * 6, 12 + Math.sin(a) * 6);
      c.lineTo(12 + Math.cos(a) * 8.5, 12 + Math.sin(a) * 8.5);
    }
    c.moveTo(18, 12);
    c.arc(12, 12, 6, 0, Math.PI * 2);
  },
  bell: (c) => {
    c.moveTo(6, 17);
    c.lineTo(6, 11);
    c.bezierCurveTo(6, 4.5, 18, 4.5, 18, 11);
    c.lineTo(18, 17);
    c.lineTo(4.5, 17);
    c.lineTo(19.5, 17);
    c.moveTo(10, 20);
    c.lineTo(14, 20);
  },
  home: (c) => {
    c.moveTo(4, 11);
    c.lineTo(12, 4);
    c.lineTo(20, 11);
    c.moveTo(6.5, 9.5);
    c.lineTo(6.5, 20);
    c.lineTo(17.5, 20);
    c.lineTo(17.5, 9.5);
  },
  chart: (c) => {
    c.moveTo(4, 4);
    c.lineTo(4, 20);
    c.lineTo(20, 20);
    c.moveTo(8, 16);
    c.lineTo(8, 12);
    c.moveTo(12, 16);
    c.lineTo(12, 8);
    c.moveTo(16, 16);
    c.lineTo(16, 11);
  },
  users: (c) => {
    c.arc(9, 8.5, 3.5, 0, Math.PI * 2);
    c.moveTo(3, 20);
    c.bezierCurveTo(3.5, 14, 14.5, 14, 15, 20);
    c.moveTo(18.5, 8.5);
    c.arc(16, 8.5, 2.5, 0, Math.PI * 2);
    c.moveTo(17, 14);
    c.bezierCurveTo(19.5, 14.5, 21, 16.5, 21, 19);
  },
  card: (c) => {
    c.rect(3, 6, 18, 12);
    c.moveTo(3, 10);
    c.lineTo(21, 10);
    c.moveTo(6, 14.5);
    c.lineTo(10, 14.5);
  },
  folder: (c) => {
    c.moveTo(3, 6);
    c.lineTo(9, 6);
    c.lineTo(11, 8);
    c.lineTo(21, 8);
    c.lineTo(21, 19);
    c.lineTo(3, 19);
    c.closePath();
  },
  layers: (c) => {
    c.moveTo(12, 4);
    c.lineTo(21, 9);
    c.lineTo(12, 14);
    c.lineTo(3, 9);
    c.closePath();
    c.moveTo(3, 13.5);
    c.lineTo(12, 18.5);
    c.lineTo(21, 13.5);
  },
  grid: (c) => {
    c.rect(4, 4, 7, 7);
    c.rect(13, 4, 7, 7);
    c.rect(4, 13, 7, 7);
    c.rect(13, 13, 7, 7);
  },
  close: (c) => {
    c.moveTo(7, 7);
    c.lineTo(17, 17);
    c.moveTo(17, 7);
    c.lineTo(7, 17);
  },
  more: (c) => {
    for (const x of [6, 12, 18]) {
      c.moveTo(x + 0.8, 12);
      c.arc(x, 12, 0.8, 0, Math.PI * 2);
    }
  },
  split: (c) => {
    c.rect(4, 5, 16, 14);
    c.moveTo(12, 5);
    c.lineTo(12, 19);
  },
  sync: (c) => {
    c.arc(12, 12, 7, Math.PI * 1.1, Math.PI * 1.9);
    c.moveTo(18.5, 6.5);
    c.lineTo(18.5, 10);
    c.lineTo(15, 10);
    c.moveTo(19, 12);
    c.arc(12, 12, 7, Math.PI * 0.1, Math.PI * 0.9);
    c.moveTo(5.5, 17.5);
    c.lineTo(5.5, 14);
    c.lineTo(9, 14);
  },
  error: (c) => {
    c.arc(12, 12, 8, 0, Math.PI * 2);
    c.moveTo(9, 9);
    c.lineTo(15, 15);
    c.moveTo(15, 9);
    c.lineTo(9, 15);
  },
  warning: (c) => {
    c.moveTo(12, 4);
    c.lineTo(21, 20);
    c.lineTo(3, 20);
    c.closePath();
    c.moveTo(12, 10);
    c.lineTo(12, 14);
    c.moveTo(12, 17);
    c.lineTo(12, 17.2);
  },
  play: (c) => {
    c.moveTo(8, 5);
    c.lineTo(19, 12);
    c.lineTo(8, 19);
    c.closePath();
  },
  download: (c) => {
    c.moveTo(12, 4);
    c.lineTo(12, 15);
    c.moveTo(7.5, 10.5);
    c.lineTo(12, 15);
    c.lineTo(16.5, 10.5);
    c.moveTo(5, 19.5);
    c.lineTo(19, 19.5);
  },
  star: (c) => {
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? 8.5 : 3.8;
      const px = 12 + Math.cos(a) * r;
      const py = 12.5 + Math.sin(a) * r;
      if (i === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
    c.closePath();
  },
};
