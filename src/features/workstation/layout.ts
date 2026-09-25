/**
 * Shared measurements for the desk scene, in metres at the character's scale.
 * Y is up. The desk stands against the back wall and the character faces -Z toward it.
 * The room, the props and the character all read from here so they stay lined up.
 */

export type Vec3 = [number, number, number];

export const ROOM = {
  floorY: 0,
  backWallZ: -1.05,
  leftWallX: -2.3,
  height: 2.9,
} as const;

/** Desk top surface. `center` is the middle of the top face. */
export const DESK = {
  width: 2.1,
  depth: 0.78,
  height: 0.74,
  thickness: 0.04,
  center: [0, 0.74, -0.35] as Vec3,
  /** Z of the edge closest to the chair. */
  frontZ: 0.04,
} as const;

/**
 * The three monitors are one uniform set: the same panel and stand, every screen centre at the same
 * height, and the side panels turned in by the same angle in mirror image. Each side panel hinges on
 * the centre panel's front corner, so the three faces meet with equal, even gaps.
 */
export const MONITOR = {
  /** Visible screen area, 16:9 like the pictures painted on it. */
  screenWidth: 0.64,
  screenHeight: 0.36,
  bezel: 0.014,
  /** Thickness of the panel, bezel included. */
  depth: 0.014,
  /** Height of every screen centre above the floor. */
  centerY: 1.1,
  /** Z of the middle of the centre panel. */
  centerZ: -0.62,
  /** How far each side panel turns in toward the chair, in radians. */
  sideAngle: 0.42,
  /** Gap between the front edges of neighbouring panels. */
  gap: 0.006,
} as const;

export type MonitorSlot = 'left' | 'center' | 'right';

export interface MonitorPlacement {
  slot: MonitorSlot;
  /** Middle of the panel. */
  position: Vec3;
  rotationY: number;
}

/**
 * A side panel turned in by `sideAngle` with its inner front corner `gap` beyond the centre panel's
 * outer front corner. `side` is -1 for the left panel and 1 for the right.
 */
function sidePanel(side: -1 | 1): MonitorPlacement {
  const { screenWidth, bezel, depth, centerY, centerZ, sideAngle, gap } = MONITOR;
  const halfWidth = screenWidth / 2 + bezel;
  const cos = Math.cos(sideAngle);
  const sin = Math.sin(sideAngle);
  // The shared corner, on the front plane of the centre panel.
  const hingeX = side * (halfWidth + gap);
  const hingeZ = centerZ + depth / 2;
  return {
    slot: side < 0 ? 'left' : 'right',
    position: [hingeX + side * (halfWidth * cos + (depth / 2) * sin), centerY, hingeZ + halfWidth * sin - (depth / 2) * cos],
    rotationY: -side * sideAngle,
  };
}

export const MONITORS: readonly MonitorPlacement[] = [
  sidePanel(-1),
  { slot: 'center', position: [0, MONITOR.centerY, MONITOR.centerZ], rotationY: 0 },
  sidePanel(1),
];

/** Felt mat under the keyboard and mouse. `center` is the middle of its top face. */
export const DESK_MAT = {
  width: 0.84,
  depth: 0.27,
  thickness: 0.003,
  center: [0.1, DESK.height + 0.003, -0.1] as Vec3,
} as const;

/**
 * Keyboard on the mat. `position` is the top of the keycaps at the middle of the board, where the
 * seated hands aim. The case is a wedge `frontHeight` tall at the typist's edge and `backHeight` at the back.
 */
export const KEYBOARD = {
  position: [0, 0.771, -0.09] as Vec3,
  width: 0.44,
  depth: 0.145,
  frontHeight: 0.012,
  backHeight: 0.02,
} as const;

export const MOUSE = { position: [0.34, 0.748, -0.08] as Vec3 } as const;

/** Mac mini at the left end of the desk. `size` is width, height and depth; `position` is the middle of its foot. */
export const MAC_MINI = {
  position: [-0.82, 0.74, -0.28] as Vec3,
  size: [0.15, 0.054, 0.15] as Vec3,
  /** Turned so the front with its status light faces the room. */
  rotationY: -0.32,
} as const;

/** Closed MacBook Pro on the desk below the monitors, between the centre and right stands. */
export const MACBOOK = {
  position: [0.35, 0.74, -0.43] as Vec3,
  rotationY: -0.2,
} as const;

/**
 * Tower stands on the floor to the right of the desk. `size` is length, height and depth in the
 * tower's own space: it runs along X with the fans at the +X end and the glass side facing +Z.
 */
export const PC_TOWER = { position: [1.38, 0, -0.52] as Vec3, size: [0.46, 0.5, 0.23] as Vec3 } as const;

/** Chair base centre on the floor, and the height of the seat cushion top. */
export const CHAIR = {
  position: [0, 0, 0.36] as Vec3,
  seatHeight: 0.46,
} as const;

/**
 * About scene only: the point on top of the golden retriever's head where Edison's left hand rests
 * while he pets it. The dog sits on his left, the camera side, with its head up about a forearm out from
 * his hip, a touch behind him.
 * The dog is built so its head top sits here, and the character reaches for it.
 * Frozen contract between the dog and the character; change it only together with both.
 */
export const DOG_PAT_POINT: Vec3 = [-0.06, 0.735, 0.52];
