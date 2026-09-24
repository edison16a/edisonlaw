'use client';

import { useThree } from '@react-three/fiber';
import { useLayoutEffect, useState } from 'react';
import { PerspectiveCamera, type Camera } from 'three';
import type { StageVariant } from '../types';
import { CAMERA_FRAMINGS, createResolvedShot, resolveShot, type ResolvedShot } from './cameraPresets';

/** Fits the shot to the panel aspect, then puts the camera on it. */
function placeCamera(camera: Camera, variant: StageVariant, aspect: number, shot: ResolvedShot) {
  resolveShot(CAMERA_FRAMINGS[variant], aspect, shot);
  if (camera instanceof PerspectiveCamera) {
    camera.fov = shot.fov;
    camera.updateProjectionMatrix();
  }
  camera.position.copy(shot.position);
  camera.lookAt(shot.target);
}

interface CameraRigProps {
  variant: StageVariant;
}

/** Fixed composition per variant, fitted to the panel aspect. The camera stays perfectly still. */
export function CameraRig({ variant }: CameraRigProps) {
  const camera = useThree((state) => state.camera);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const invalidate = useThree((state) => state.invalidate);
  const [shot] = useState(createResolvedShot);

  useLayoutEffect(() => {
    if (height === 0) return;
    placeCamera(camera, variant, width / height, shot);
    invalidate();
  }, [camera, variant, width, height, shot, invalidate]);

  return null;
}
