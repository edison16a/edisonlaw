/**
 * Terminal and UI symbols drawn as vectors. The site's mono font has no dingbats, and a
 * fallback font would change from one machine to the next, so these never rely on glyphs.
 * Each one is drawn centred on (x, y) inside a box of `size` pixels.
 */

export type Glyph = 'dot' | 'ring' | 'elbow' | 'check' | 'square' | 'chevron' | 'chevronDown' | 'cross' | 'star';

interface GlyphOptions {
  /** Star arm count, used by the thinking spinner. */
  arms?: number;
  /** 0 to 1, star arm length. */
  spread?: number;
}

function stroke(ctx: CanvasRenderingContext2D, color: string, width: number) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

export function drawGlyph(
  ctx: CanvasRenderingContext2D,
  glyph: Glyph,
  x: number,
  y: number,
  size: number,
  color: string,
  { arms = 6, spread = 1 }: GlyphOptions = {},
) {
  const s = size;
  const line = Math.max(1.25, s * 0.09);
  ctx.beginPath();
  switch (glyph) {
    case 'dot':
      ctx.arc(x, y, s * 0.26, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      return;
    case 'ring':
      ctx.arc(x, y, s * 0.18, 0, Math.PI * 2);
      stroke(ctx, color, line);
      return;
    case 'elbow':
      // The corner that hangs a tool result under its call.
      ctx.moveTo(x - s * 0.1, y - s * 0.55);
      ctx.lineTo(x - s * 0.1, y + s * 0.05);
      ctx.lineTo(x + s * 0.42, y + s * 0.05);
      stroke(ctx, color, line * 0.9);
      return;
    case 'check':
      ctx.moveTo(x - s * 0.26, y + s * 0.02);
      ctx.lineTo(x - s * 0.08, y + s * 0.2);
      ctx.lineTo(x + s * 0.27, y - s * 0.2);
      stroke(ctx, color, line * 1.15);
      return;
    case 'square':
      ctx.rect(x - s * 0.2, y - s * 0.2, s * 0.4, s * 0.4);
      stroke(ctx, color, line);
      return;
    case 'chevron':
      ctx.moveTo(x - s * 0.1, y - s * 0.22);
      ctx.lineTo(x + s * 0.14, y);
      ctx.lineTo(x - s * 0.1, y + s * 0.22);
      stroke(ctx, color, line * 1.1);
      return;
    case 'chevronDown':
      ctx.moveTo(x - s * 0.22, y - s * 0.1);
      ctx.lineTo(x, y + s * 0.14);
      ctx.lineTo(x + s * 0.22, y - s * 0.1);
      stroke(ctx, color, line * 1.1);
      return;
    case 'cross':
      ctx.moveTo(x - s * 0.18, y - s * 0.18);
      ctx.lineTo(x + s * 0.18, y + s * 0.18);
      ctx.moveTo(x + s * 0.18, y - s * 0.18);
      ctx.lineTo(x - s * 0.18, y + s * 0.18);
      stroke(ctx, color, line * 1.1);
      return;
    case 'star': {
      const outer = s * 0.34 * spread;
      for (let i = 0; i < arms; i++) {
        const angle = (i / arms) * Math.PI * 2 - Math.PI / 2;
        ctx.moveTo(x + Math.cos(angle) * s * 0.06, y + Math.sin(angle) * s * 0.06);
        ctx.lineTo(x + Math.cos(angle) * outer, y + Math.sin(angle) * outer);
      }
      stroke(ctx, color, line * 1.35);
      return;
    }
  }
}
