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

export const MONITOR = {
  /** Visible screen area. */
  screenWidth: 0.64,
  screenHeight: 0.37,
  bezel: 0.014,
  /** Height of the screen centre above the floor. */
  centerY: 1.1,
} as const;

export type MonitorSlot = 'left' | 'center' | 'right';

export const MONITORS: { slot: MonitorSlot; position: Vec3; rotationY: number }[] = [
  { slot: 'left', position: [-0.69, MONITOR.centerY, -0.5], rotationY: 0.42 },
  { slot: 'center', position: [0, MONITOR.centerY, -0.6], rotationY: 0 },
  { slot: 'right', position: [0.69, MONITOR.centerY, -0.5], rotationY: -0.42 },
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
 * while he pets it. The dog is built so its head top sits here, and the character reaches for it.
 * Frozen contract between the dog and the character; change it only together with both.
 */
export const DOG_PAT_POINT: Vec3 = [0.74, 0.56, 0.49];
