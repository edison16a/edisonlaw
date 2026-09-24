'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useRef, useState } from 'react';
import { PerspectiveCamera, Spherical, Vector3, type Camera } from 'three';
import { damp } from '@/lib/math';
import type { StageVariant } from '../types';
import { CAMERA_FRAMINGS, createResolvedShot, resolveShot, type ResolvedShot } from './cameraPresets';
import { usePointerParallax } from './usePointerParallax';

/** Largest drift from the pointer, in radians (about 1.6 and 1 degrees). */
const MAX_YAW = 0.028;
const MAX_PITCH = 0.018;
/** How quickly the drift follows the pointer, roughly 1 / seconds. */
const FOLLOW = 2.4;

interface Drift {
  yaw: number;
  pitch: number;
}

const offset = new Vector3();
const spherical = new Spherical();

/** Fits the shot to the panel aspect and applies its field of view. */
function frameShot(camera: Camera, variant: StageVariant, aspect: number, shot: ResolvedShot) {
  resolveShot(CAMERA_FRAMINGS[variant], aspect, shot);
  if (camera instanceof PerspectiveCamera) {
    camera.fov = shot.fov;
    camera.updateProjectionMatrix();
  }
}

/** Puts the camera on the shot, turned around its target by the current drift. */
function placeCamera(camera: Camera, shot: ResolvedShot, drift: Drift) {
  spherical.setFromVector3(offset.subVectors(shot.position, shot.target));
  spherical.theta += drift.yaw;
  spherical.phi += drift.pitch;
  camera.position.copy(shot.target).add(offset.setFromSpherical(spherical));
  camera.lookAt(shot.target);
}

interface CameraRigProps {
  variant: StageVariant;
  /** Pointer drift. Off for reduced motion and captures. */
  parallax: boolean;
}

/** Fixed composition per variant, fitted to the panel aspect, with a small damped pointer drift. */
export function CameraRig({ variant, parallax }: CameraRigProps) {
  const camera = useThree((state) => state.camera);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const invalidate = useThree((state) => state.invalidate);
  const pointer = usePointerParallax(parallax);

  const [shot] = useState(createResolvedShot);
  const drift = useRef<Drift>({ yaw: 0, pitch: 0 });

  useLayoutEffect(() => {
    if (height === 0) return;
    frameShot(camera, variant, width / height, shot);
    placeCamera(camera, shot, drift.current);
    invalidate();
  }, [camera, variant, width, height, shot, invalidate]);

  useFrame((_, delta) => {
    const state = drift.current;
    const targetYaw = -pointer.current.x * MAX_YAW;
    const targetPitch = -pointer.current.y * MAX_PITCH;
    if (Math.abs(targetYaw - state.yaw) < 1e-5 && Math.abs(targetPitch - state.pitch) < 1e-5) return;
    state.yaw = damp(state.yaw, targetYaw, FOLLOW, delta);
    state.pitch = damp(state.pitch, targetPitch, FOLLOW, delta);
    placeCamera(camera, shot, state);
  });

  return null;
}
