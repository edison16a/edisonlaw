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

/** Keyboard top centre. */
export const KEYBOARD = {
  position: [0, 0.755, -0.09] as Vec3,
  width: 0.44,
  depth: 0.145,
} as const;

export const MOUSE = { position: [0.34, 0.748, -0.08] as Vec3 } as const;

export const MAC_MINI = { position: [-0.8, 0.74, -0.3] as Vec3, size: [0.2, 0.036, 0.2] as Vec3 } as const;

/** Tower stands on the floor to the right of the desk, glass side toward the camera. */
export const PC_TOWER = { position: [1.32, 0, -0.42] as Vec3, size: [0.23, 0.5, 0.46] as Vec3 } as const;

/** Chair base centre on the floor, and the height of the seat cushion top. */
export const CHAIR = {
  position: [0, 0, 0.36] as Vec3,
  seatHeight: 0.46,
} as const;
