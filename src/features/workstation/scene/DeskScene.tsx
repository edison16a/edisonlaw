'use client';

import { CameraRig } from '../camera/CameraRig';
import { Character } from '../character/Character';
import { Dog } from '../dog/Dog';
import { SEATED_PLACEMENT, STANDING_PLACEMENT } from '../character/placement';
import { Effects } from '../effects/Effects';
import { Lighting } from '../lighting/Lighting';
import { RgbClockProvider } from '../lighting/RgbClockProvider';
import { Chair } from '../props/Chair';
import { Desk } from '../props/Desk';
import { Decor } from '../props/decor/Decor';
import { DeskMat } from '../props/DeskMat';
import { Keyboard } from '../props/keyboard/Keyboard';
import { MacBookPro } from '../props/apple/MacBookPro';
import { MacMini } from '../props/apple/MacMini';
import { Monitors } from '../props/Monitors';
import { Mouse } from '../props/Mouse';
import { PcTower } from '../props/tower/PcTower';
import type { ScreenId } from '../screens/types';
import type { StageVariant } from '../types';
import { GroundShadow } from './GroundShadow';
import { ReadySignal } from './ReadySignal';
import { Room } from './Room';
import { Rug } from './Rug';

export interface DeskSceneProps {
  variant: StageVariant;
  centerScreen?: ScreenId;
  pulseKey?: number;
  /** False freezes every animation, for reduced motion. */
  animate: boolean;
  /** False holds the RGB hue on a calm violet, for reduced motion and still captures. */
  rgbCycle: boolean;
  /** Screens keep repainting. Off while the stage is off-screen. */
  screensLive: boolean;
  onReady: () => void;
}

/** Everything inside the canvas: room, props, character, lights, camera and effects. */
export function DeskScene(props: DeskSceneProps) {
  const { variant, centerScreen, pulseKey, animate, rgbCycle, screensLive, onReady } = props;
  const seated = variant === 'work';
  const placement = seated ? SEATED_PLACEMENT : STANDING_PLACEMENT;

  return (
    <RgbClockProvider animate={rgbCycle} pulseKey={pulseKey}>
      <color attach="background" args={['#000000']} />
      <CameraRig variant={variant} />
      <Lighting />
      <Room />
      <Rug />
      <GroundShadow />
      <Desk />
      <Monitors centerScreen={centerScreen} live={screensLive} />
      <DeskMat />
      <Keyboard typing={seated} animate={animate} />
      <Mouse />
      <MacMini />
      <MacBookPro />
      {seated && <Chair />}
      <PcTower animate={animate} />
      <Decor mugOnDesk={seated} />
      <group position={placement.position} rotation-y={placement.rotationY}>
        <Character pose={seated ? 'seated' : 'standing'} animate={animate} />
      </group>
      {!seated && <Dog animate={animate} />}
      <Effects />
      <ReadySignal onReady={onReady} />
    </RgbClockProvider>
  );
}
