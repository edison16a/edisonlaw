import { PC_TOWER } from '../../layout';

/**
 * Case measurements in the tower's own space: X runs back to front (fans at +X),
 * Y is up from the floor, and the glass side faces +Z.
 */
const [length, height, depth] = PC_TOWER.size;

export const TOWER = {
  length,
  height,
  depth,
  wall: 0.008,
  /** Height of the feet under the case. */
  foot: 0.018,
  /** Top of the PSU shroud, the floor of the display chamber. */
  shroudTop: 0.13,
} as const;

/** Inner face of the back panel, where the motherboard mounts. */
export const BACK_INNER_Z = -depth / 2 + TOWER.wall;
