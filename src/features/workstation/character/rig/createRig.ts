import { Group } from 'three';
import { BODY, HAND } from '../dimensions';
import type { ArmRig, LimbRig, Rig, Side } from './types';

function bone(name: string, x = 0, y = 0, z = 0) {
  const group = new Group();
  group.name = name;
  group.position.set(x, y, z);
  return group;
}

function createArm(side: Side, name: string): ArmRig {
  const { shoulder, upperArm, forearm } = BODY;
  // The thumb sits on the inner edge of the hand when the palm faces down.
  const thumbSide = -side;
  const knuckleSpan = HAND.palmWidth / 2 - HAND.fingerRadius * 1.15;
  const fingers = HAND.fingerLengths.map((_, index) =>
    bone(`${name}Finger${index}`, thumbSide * (knuckleSpan - (index * 2 * knuckleSpan) / 3), -HAND.palmLength, 0.001),
  );
  const thumb = bone(`${name}Thumb`, thumbSide * HAND.palmWidth * 0.4, -HAND.palmLength * 0.3, -0.005);
  // Splayed out toward the thumb side. Animation only changes the curl (rotation.x).
  thumb.rotation.set(0.2, 0, thumbSide * 0.6);
  return {
    base: bone(`${name}Shoulder`, side * shoulder.x, shoulder.y, shoulder.z),
    upper: bone(`${name}UpperArm`),
    lower: bone(`${name}Forearm`, 0, -upperArm, 0),
    end: bone(`${name}Hand`, 0, -forearm, 0),
    fingers,
    thumb,
  };
}

function createLeg(side: Side, name: string): LimbRig {
  return {
    base: bone(`${name}Hip`, side * BODY.hip.x, BODY.hip.y, 0),
    upper: bone(`${name}Thigh`),
    lower: bone(`${name}Shin`, 0, -BODY.thigh, 0),
    end: bone(`${name}Foot`, 0, -BODY.shin, 0),
  };
}

/** Creates the bone groups with their rest offsets. The JSX in CharacterBody nests them. */
export function createRig(): Rig {
  return {
    pelvis: bone('pelvis'),
    spine: bone('spine', 0, BODY.spine, 0),
    chest: bone('chest', 0, BODY.chest, 0),
    neck: bone('neck', 0, BODY.neck, 0),
    head: bone('head', 0, BODY.headPivot, 0),
    eyes: [bone('leftEye'), bone('rightEye')],
    shines: [bone('leftEyeShine'), bone('rightEyeShine')],
    arms: { left: createArm(1, 'left'), right: createArm(-1, 'right') },
    legs: { left: createLeg(1, 'left'), right: createLeg(-1, 'right') },
  };
}
