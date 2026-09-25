import { Color } from 'three';
import { PC_TOWER, ROOM, type Vec3 } from '../layout';
import { FROZEN_HUE, luminance, writeRgb, writeSteadyRgb } from './rgbClock';

/**
 * The coloured lights the RGB set throws into the room. Nothing here reads the timeline, and no
 * brightness changes over time. Only the tower's own spill follows the RGB hue.
 */

export interface RgbRoomLight {
  position: Vec3;
  /** Hue offset from the shared clock, so the spill shifts slightly across the room. */
  hueOffset: number;
  intensity: number;
  distance: number;
  /** How much of the hue reaches the room. Low values keep walls and floor near white. */
  saturation: number;
  /** True follows the clock's hue, as the tower's own spill does. False holds the resting violet. */
  cycles: boolean;
  /** Relative luminance the colour holds at every hue. */
  level: number;
}

const [towerX, , towerZ] = PC_TOWER.position;
const HUE_STEPS = 360;
/**
 * How far above its plain strength the resting violet is lifted. Violet is the dimmest part of the
 * wheel, so this is what makes the room read bright.
 */
const VIOLET_LIFT = 1.8;

/**
 * The luminance a light's colour holds: the lifted violet, and for a light that cycles, also as
 * bright as the brightest hue on the wheel (yellow and green read far brighter than violet at the
 * same strength). So the room sits at its bright level all the time.
 */
function heldLevel(hueOffset: number, saturation: number, cycles: boolean) {
  const color = new Color();
  const violet = luminance(writeRgb(color, FROZEN_HUE + hueOffset, 1, saturation)) * VIOLET_LIFT;
  if (!cycles) return violet;
  let brightest = 0;
  for (let step = 0; step < HUE_STEPS; step++) {
    brightest = Math.max(brightest, luminance(writeRgb(color, step / HUE_STEPS, 1, saturation)));
  }
  return Math.max(brightest, violet);
}

function rgbLight(spec: Omit<RgbRoomLight, 'level'>): RgbRoomLight {
  return { ...spec, level: heldLevel(spec.hueOffset, spec.saturation, spec.cycles) };
}

// The colour lives on the emissive parts (tower fans, strips). The lights only hint at it, with
// short reach and washed out colour. Only the tower's own spill follows the hue, so the wall, the
// desk and the floor keep one colour and one brightness while the PC cycles.
export const RGB_ROOM_LIGHTS: readonly RgbRoomLight[] = [
  // Inside the tower, so a little colour spills out through the glass onto the floor beside it.
  rgbLight({ position: [towerX, 0.32, towerZ + 0.02], hueOffset: 0, intensity: 0.7, distance: 2, saturation: 0.55, cycles: true }),
  // Behind the monitors, the desk strip's soft wash on the back wall.
  rgbLight({ position: [0, 1.02, ROOM.backWallZ + 0.16], hueOffset: 0.06, intensity: 0.8, distance: 2.4, saturation: 0.2, cycles: false }),
  // Under the desk, a faint glow on the floor.
  rgbLight({ position: [-0.35, 0.3, -0.62], hueOffset: 0.12, intensity: 0.35, distance: 1.8, saturation: 0.2, cycles: false }),
];

/** Writes the colour `light` shows at clock hue `hue`. Its brightness is the same at every hue. */
export function writeRoomLightColor(target: Color, light: RgbRoomLight, hue: number) {
  const shown = light.cycles ? hue : FROZEN_HUE;
  return writeSteadyRgb(target, shown + light.hueOffset, light.saturation, light.level);
}
