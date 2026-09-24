import { darken, lighten, rgba } from '../color';
import { sparkles } from '../draw/decor';
import { glow } from '../draw/glow';
import { linear, paintBackground, sphere } from '../draw/gradients';
import { clipped, fill, raised, stroke } from '../draw/paint';
import type { Point } from '../draw/paths';
import { circle, ellipse, pill } from '../draw/shapes';
import { range } from '../random';
import type { Scene } from '../types';

/** Backbond: a glowing drug-like molecule and its bond network on a deep violet night. */

type Element = 'carbon' | 'nitrogen' | 'oxygen' | 'sulfur' | 'halogen';

const ATOMS: Record<Element, { color: string; radius: number }> = {
  carbon: { color: '#e9e4ff', radius: 11 },
  nitrogen: { color: '#4ef0ff', radius: 17 },
  oxygen: { color: '#ff5fa8', radius: 17 },
  sulfur: { color: '#c9ff5c', radius: 19 },
  halogen: { color: '#ffc75a', radius: 15 },
};

interface Atom {
  x: number;
  y: number;
  element: Element;
}

interface Bond {
  a: number;
  b: number;
  double: boolean;
}

const BOND = 72;
const HEX_ANGLES = [-90, -30, 30, 90, 150, 210].map((degrees) => (degrees * Math.PI) / 180);

/** Three fused rings with side chains, laid out like a skeletal formula. */
function buildMolecule() {
  const atoms: Atom[] = [];
  const bonds: Bond[] = [];
  const atom = (x: number, y: number, element: Element = 'carbon') => {
    const found = atoms.findIndex((other) => Math.hypot(other.x - x, other.y - y) < 1);
    if (found >= 0) return found;
    atoms.push({ x, y, element });
    return atoms.length - 1;
  };
  const bond = (a: number, b: number, double = false) => {
    if (!bonds.some((other) => (other.a === a && other.b === b) || (other.a === b && other.b === a))) bonds.push({ a, b, double });
  };
  const branch = (from: number, degrees: number, element: Element = 'carbon', double = false) => {
    const radians = (degrees * Math.PI) / 180;
    const next = atom(atoms[from].x + Math.cos(radians) * BOND, atoms[from].y + Math.sin(radians) * BOND, element);
    bond(from, next, double);
    return next;
  };
  const ring = (cx: number, cy: number) => {
    const ids = HEX_ANGLES.map((angle) => atom(cx + Math.cos(angle) * BOND, cy + Math.sin(angle) * BOND));
    ids.forEach((id, index) => bond(id, ids[(index + 1) % 6]));
    return ids;
  };

  const step = BOND * Math.sqrt(3);
  const ringA = ring(430, 340);
  const ringB = ring(430 + step, 340);
  const ringC = ring(430 + step * 1.5, 340 - step * 0.866);

  const amide = branch(branch(ringA[5], 210, 'nitrogen'), 150);
  branch(amide, 90, 'oxygen', true);
  branch(branch(ringA[3], 90, 'oxygen'), 30);
  const ketone = branch(ringB[2], 30);
  branch(ketone, -30, 'nitrogen');
  branch(ketone, 90, 'oxygen', true);
  branch(branch(ringC[1], -30, 'sulfur'), 30);
  branch(ringC[0], -90, 'halogen');

  const aromatic: Point[] = [
    [430, 340],
    [430 + step * 1.5, 340 - step * 0.866],
  ];
  return { atoms, bonds, aromatic };
}

function paintBackdrop({ ctx, w, h, random }: Scene) {
  paintBackground(ctx, w, h, ['#2c0f73', '#170a47', '#07061d'], 40);
  glow(ctx, 600, 300, 460, '#8a2be2', 0.5);
  glow(ctx, 180, 560, 300, '#1fb5ff', 0.22);

  fill(ctx, circle(560, 316, 262), rgba('#ffffff', 0.035));
  stroke(ctx, circle(560, 316, 262), rgba('#d8ccff', 0.12), 2);
  stroke(ctx, ellipse(540, 320, 420, 118, -0.32), rgba('#cbb8ff', 0.22), 2);
  stroke(ctx, ellipse(540, 320, 400, 96, 0.42), rgba('#8ff4ff', 0.16), 2, { dash: [2, 12] });

  // Star dust in three brightness bands, one path each.
  [0.18, 0.35, 0.6].forEach((alpha) => {
    const dust = new Path2D();
    for (let i = 0; i < 24; i++) {
      const x = range(random, 20, w - 20);
      const y = range(random, 20, h - 20);
      const r = range(random, 0.8, 2.2);
      dust.moveTo(x + r, y);
      dust.arc(x, y, r, 0, Math.PI * 2);
    }
    fill(ctx, dust, rgba('#ffffff', alpha));
  });
}

/** Faint links from the molecule out to distant nodes, the "network" around the lead compound. */
function paintNetwork(ctx: CanvasRenderingContext2D, atoms: Atom[]) {
  const satellites: Point[] = [
    [118, 150],
    [206, 96],
    [888, 104],
    [944, 300],
    [900, 506],
    [760, 574],
  ];
  const links = new Path2D();
  satellites.forEach(([x, y]) => {
    const nearest = atoms.reduce((best, atom) => (Math.hypot(atom.x - x, atom.y - y) < Math.hypot(best.x - x, best.y - y) ? atom : best));
    links.moveTo(x, y);
    links.lineTo(nearest.x, nearest.y);
  });
  stroke(ctx, links, rgba('#bca8ff', 0.28), 1.5, { dash: [3, 7] });
  satellites.forEach(([x, y], index) => {
    const color = index % 2 === 0 ? '#4ef0ff' : '#ff5fa8';
    glow(ctx, x, y, 34, color, 0.45);
    fill(ctx, circle(x, y, 5), lighten(color, 0.4));
  });
}

function paintBonds(ctx: CanvasRenderingContext2D, atoms: Atom[], bonds: Bond[]) {
  const glowPath = new Path2D();
  bonds.forEach(({ a, b }) => {
    glowPath.moveTo(atoms[a].x, atoms[a].y);
    glowPath.lineTo(atoms[b].x, atoms[b].y);
  });
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  stroke(ctx, glowPath, rgba('#b58cff', 0.18), 30);
  stroke(ctx, glowPath, rgba('#d9c8ff', 0.2), 16);
  ctx.restore();

  bonds.forEach(({ a, b, double }) => {
    const from = atoms[a];
    const to = atoms[b];
    const style = linear(ctx, from.x, from.y, to.x, to.y, [lighten(ATOMS[from.element].color, 0.3), lighten(ATOMS[to.element].color, 0.3)]);
    const length = Math.hypot(to.x - from.x, to.y - from.y);
    const nx = (-(to.y - from.y) / length) * 7;
    const ny = ((to.x - from.x) / length) * 7;
    const offsets = double ? [-1, 1] : [0];
    offsets.forEach((side) => {
      const path = new Path2D();
      path.moveTo(from.x + nx * side, from.y + ny * side);
      path.lineTo(to.x + nx * side, to.y + ny * side);
      stroke(ctx, path, style, double ? 5 : 8);
    });
  });
}

function paintAtoms(ctx: CanvasRenderingContext2D, atoms: Atom[]) {
  atoms.forEach(({ x, y, element }) => {
    const { color, radius } = ATOMS[element];
    glow(ctx, x, y, radius * (element === 'carbon' ? 3 : 4.4), color, element === 'carbon' ? 0.35 : 0.7);
  });
  atoms.forEach(({ x, y, element }) => {
    const { color, radius } = ATOMS[element];
    fill(ctx, circle(x, y, radius), sphere(ctx, x, y, radius, [lighten(color, 0.75), color, darken(color, 0.35)]));
    fill(ctx, circle(x - radius * 0.35, y - radius * 0.38, radius * 0.22), rgba('#ffffff', 0.85));
  });
}

/** Two tone capsule, a playful nod to drug discovery. */
function paintCapsule(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.translate(176, 516);
  ctx.rotate(-0.5);
  const body = pill(-96, -36, 192, 72);
  raised(ctx, body, '#f4efff', { color: 'rgba(3, 0, 20, 0.45)' });
  clipped(ctx, body, () => {
    ctx.fillStyle = '#ff5fa8';
    ctx.fillRect(-96, -36, 96, 72);
    fill(ctx, body, linear(ctx, 0, -36, 0, 36, [rgba('#ffffff', 0.35), rgba('#ffffff', 0), rgba('#2a0a5e', 0.3)]));
  });
  fill(ctx, pill(-70, -24, 60, 9), rgba('#ffffff', 0.6));
  ctx.restore();
}

export function paintBackbond(scene: Scene) {
  const { ctx } = scene;
  const { atoms, bonds, aromatic } = buildMolecule();
  paintBackdrop(scene);
  paintNetwork(ctx, atoms);
  paintBonds(ctx, atoms, bonds);
  aromatic.forEach(([x, y]) => stroke(ctx, circle(x, y, BOND * 0.52), rgba('#e9e4ff', 0.75), 4, { dash: [10, 9] }));
  paintAtoms(ctx, atoms);
  paintCapsule(ctx);
  sparkles(ctx, [
    { x: 812, y: 380, r: 22 },
    { x: 300, y: 150, r: 14 },
    { x: 860, y: 214, r: 10 },
  ]);
}
