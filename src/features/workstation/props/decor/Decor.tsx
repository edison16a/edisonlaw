'use client';

import { DESK, ROOM } from '../../layout';
import { CorkBoard } from './CorkBoard';
import { FloorPlant } from './FloorPlant';
import { FramedPicture } from './FramedPicture';
import { Mug } from './Mug';
import { PencilCup } from './PencilCup';
import { Penguin } from './Penguin';
import { RubiksCube } from './RubiksCube';
import { Speaker } from './Speaker';
import { WallShelf } from './WallShelf';

const top = DESK.height;

/** The small things that make the room feel lived in, placed around the desk and on the wall. */
export function Decor() {
  return (
    <group>
      <WallShelf position={[-0.86, 1.74, 0]} />
      <CorkBoard position={[0.42, 1.86, 0]} />
      <FramedPicture position={[1.34, 1.4, 0]} />
      <FloorPlant position={[ROOM.leftWallX + 0.62, 0, -0.62]} />
      <Penguin position={[-0.9, top, -0.05]} rotationY={0.5} />
      <PencilCup position={[-0.98, top, -0.58]} />
      <Mug position={[0.82, top, -0.02]} rotationY={-0.6} />
      <RubiksCube position={[0.6, top, -0.1]} rotationY={0.4} />
      <Speaker position={[0.94, top, -0.38]} rotationY={-0.5} />
    </group>
  );
}
