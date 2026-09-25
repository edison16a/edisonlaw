import { Color } from 'three';
import { PC_TOWER, ROOM, type Vec3 } from '../layout';
import { FROZEN_HUE, writeRgb } from './rgbClock';

/**
 * Every light the setup throws into the room. Nothing here reads the screens, the timeline or the RGB
 * clock, and no colour or brightness changes over time, so the room holds one look while the centre
 * monitor changes. Only the glowing parts themselves (fans, strips) cycle their hue.
 */

/**
 * The light each monitor throws: one cool screen white for all three, whatever they show, as strong
 * as the brightest picture in the set lights the desk (Claude Code on the left).
 */
export const SCREEN_LIGHT = {
  color: new Color('#e0e6ff'),
  intensity: 4,
} as const;

export interface RgbRoomLight {
  position: Vec3;
  /** Hue offset from the resting violet, so the tint shifts slightly across the room. */
  hueOffset: number;
  intensity: number;
  distance: number;
  /** How much of the hue reaches the room. Low values keep walls and floor near white. */
  saturation: number;
  /** The linear colour it always shows: its resting violet at the lifted strength. */
  color: Color;
}

const [towerX, , towerZ] = PC_TOWER.position;

/**
 * How far above its plain strength the resting violet is lifted. It is the peak the old pulse on
 * each timeline entry reached, now held all the time, so the room always reads at its bright level.
 */
export const VIOLET_LIFT = 1.8;

function rgbLight(spec: Omit<RgbRoomLight, 'color'>): RgbRoomLight {
  return { ...spec, color: writeRgb(new Color(), FROZEN_HUE + spec.hueOffset, VIOLET_LIFT, spec.saturation) };
}

// The colour lives on the emissive parts (tower fans, strips), which cycle with the RGB clock. The
// lights only hint at it, with short reach and washed out colour, and hold the resting violet, so the
// wall, the desk and the floor keep one colour and one brightness while the PC cycles.
export const RGB_ROOM_LIGHTS: readonly RgbRoomLight[] = [
  // Inside the tower, so a little colour spills out through the glass onto the floor beside it.
  rgbLight({ position: [towerX, 0.32, towerZ + 0.02], hueOffset: 0, intensity: 0.7, distance: 2, saturation: 0.55 }),
  // Behind the monitors, the desk strip's soft wash on the back wall.
  rgbLight({ position: [0, 1.02, ROOM.backWallZ + 0.16], hueOffset: 0.06, intensity: 0.8, distance: 2.4, saturation: 0.2 }),
  // Under the desk, a faint glow on the floor.
  rgbLight({ position: [-0.35, 0.3, -0.62], hueOffset: 0.12, intensity: 0.35, distance: 1.8, saturation: 0.2 }),
];
