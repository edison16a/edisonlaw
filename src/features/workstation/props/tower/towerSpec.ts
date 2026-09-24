import { PC_TOWER } from '../../layout';
import { FAN_DEPTH, FAN_SIZE } from './fanGeometry';

/**
 * Case measurements in the tower's own space: X runs back to front (fans at +X),
 * Y is up from the floor, and the glass side faces +Z.
 */
const [length, height, depth] = PC_TOWER.size;

export const TOWER = {
  length,
  height,
  depth,
  /** Height of the rail feet under the case. */
  foot: 0.016,
  /** Thickness of the top and bottom plates. */
  plate: 0.014,
  /** Thickness of the solid walls: the motherboard tray at -Z and the rear panel at -X. */
  wall: 0.008,
  /** Tempered glass on the side and the front, which meet at a pillarless corner. */
  glass: 0.004,
  /** Top of the PSU shroud, the floor of the display chamber. */
  shroudTop: 0.13,
} as const;

/** Top face of the bottom plate and underside of the top plate: the inside of the case. */
export const INNER_BOTTOM = TOWER.foot + TOWER.plate;
export const INNER_TOP = TOWER.height - TOWER.plate;

/** Inner face of the motherboard tray. */
export const BACK_INNER_Z = -depth / 2 + TOWER.wall;
/** Inner faces of the side glass and of the front glass. */
export const GLASS_INNER_Z = depth / 2 - TOWER.glass;
export const GLASS_INNER_X = length / 2 - TOWER.glass;
/** Inner face of the rear panel. */
export const REAR_INNER_X = -length / 2 + TOWER.wall;

/** The motherboard stands off the tray on short posts; this is its front face. */
export const BOARD_FACE_Z = BACK_INNER_Z + 0.007;

/** The intake fans stacked up the front just behind the glass, sitting on the PSU shroud. */
export const FRONT_FANS = {
  count: 3,
  gap: 0.002,
  x: GLASS_INNER_X - 0.002 - FAN_DEPTH / 2,
  z: (BACK_INNER_Z + GLASS_INNER_Z) / 2,
  /** Centre height of the lowest fan. */
  firstY: TOWER.shroudTop + 0.004 + FAN_SIZE / 2,
} as const;

/** Top edge of the front fan stack. */
export const FRONT_FANS_TOP = FRONT_FANS.firstY - FAN_SIZE / 2 + FRONT_FANS.count * FAN_SIZE + (FRONT_FANS.count - 1) * FRONT_FANS.gap;

/** The AIO radiator, mounted behind the front fans. `backX` is its inner face. */
const RADIATOR_DEPTH = 0.027;
export const RADIATOR = {
  depth: RADIATOR_DEPTH,
  width: 0.122,
  backX: FRONT_FANS.x - FAN_DEPTH / 2 - 0.0005 - RADIATOR_DEPTH,
} as const;
