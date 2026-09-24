import { describe, expect, it } from 'vitest';
import { MONITOR, MONITORS, type MonitorPlacement, type Vec3 } from '../layout';

const halfWidth = MONITOR.screenWidth / 2 + MONITOR.bezel;

function placement(slot: MonitorPlacement['slot']) {
  const found = MONITORS.find((monitor) => monitor.slot === slot);
  if (!found) throw new Error(`No ${slot} monitor`);
  return found;
}

/** A point in a monitor's own space (x across the panel, z out of its face) moved into the room. */
function toRoom({ position, rotationY }: MonitorPlacement, x: number, z: number): Vec3 {
  const cos = Math.cos(rotationY);
  const sin = Math.sin(rotationY);
  return [position[0] + x * cos + z * sin, position[1], position[2] - x * sin + z * cos];
}

describe('monitor layout', () => {
  const left = placement('left');
  const center = placement('center');
  const right = placement('right');
  const front = MONITOR.depth / 2;

  it('has a 16:9 screen like the painted pictures', () => {
    expect(MONITOR.screenWidth / MONITOR.screenHeight).toBeCloseTo(16 / 9, 6);
  });

  it('puts every screen centre at the same height', () => {
    for (const monitor of MONITORS) expect(monitor.position[1]).toBe(MONITOR.centerY);
  });

  it('mirrors the side panels about the centre', () => {
    expect(center.position[0]).toBe(0);
    expect(center.rotationY).toBe(0);
    expect(left.rotationY).toBeCloseTo(-right.rotationY, 12);
    expect(left.position[0]).toBeCloseTo(-right.position[0], 12);
    expect(left.position[2]).toBeCloseTo(right.position[2], 12);
    // Turned in toward the chair: the outer edges come forward.
    expect(toRoom(right, halfWidth, front)[2]).toBeGreaterThan(toRoom(right, -halfWidth, front)[2]);
  });

  it('meets the centre panel at its front corners with the same gap on both sides', () => {
    const centerLeft = toRoom(center, -halfWidth, front);
    const centerRight = toRoom(center, halfWidth, front);
    const leftInner = toRoom(left, halfWidth, front);
    const rightInner = toRoom(right, -halfWidth, front);
    expect(leftInner[2]).toBeCloseTo(centerLeft[2], 12);
    expect(rightInner[2]).toBeCloseTo(centerRight[2], 12);
    expect(centerLeft[0] - leftInner[0]).toBeCloseTo(MONITOR.gap, 12);
    expect(rightInner[0] - centerRight[0]).toBeCloseTo(MONITOR.gap, 12);
  });
});
