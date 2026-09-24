'use client';

import dynamic from 'next/dynamic';
import { useCallback, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';
import { useInView } from '@/lib/hooks/useInView';
import { useIsMobile } from '@/lib/hooks/useIsMobile';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import type { ScreenId } from './screens/types';
import { STAGE_ALT, StageRender } from './stage/StageRender';
import { useCaptureVariant } from './stage/useCaptureVariant';
import type { StageVariant } from './types';
import type { Frameloop } from './WorkstationCanvas';

const WorkstationCanvas = dynamic(() => import('./WorkstationCanvas').then((mod) => mod.WorkstationCanvas), {
  ssr: false,
});

/** Start loading the scene a full screen before it scrolls in. */
const NEAR_MARGIN = '100% 0px 100% 0px';

/** Softens every edge of the panel so the room melts into the black page instead of ending in a line. */
const EDGE_MASK = [
  'linear-gradient(to right, transparent, #000 9%, #000 94%, transparent)',
  'linear-gradient(to bottom, transparent, #000 6%, #000 90%, transparent)',
].join(', ');
const EDGE_MASK_STYLE: CSSProperties = {
  maskImage: EDGE_MASK,
  maskComposite: 'intersect',
  WebkitMaskImage: EDGE_MASK,
  WebkitMaskComposite: 'source-in',
};

export interface WorkstationStageProps {
  /** `work`: seated and typing, seen from behind. `about`: standing and looking at the screens. */
  variant: StageVariant;
  /** What the centre monitor shows. Defaults to Codex. */
  centerScreen?: ScreenId;
  /** Change this number to make the RGB lighting pulse once. */
  pulseKey?: number;
  className?: string;
}

/**
 * The desk scene as a drop-in block. It fills its parent.
 * The canvas mounts once the stage comes near the viewport and pauses while off-screen.
 * Phones get a pre-rendered still instead.
 */
export function WorkstationStage({ variant, centerScreen, pulseKey, className }: WorkstationStageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { rootMargin: NEAR_MARGIN });
  const onScreen = useInView(ref);
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();
  const capture = useCaptureVariant();

  // Once mounted, the canvas stays mounted so scrolling back never recompiles shaders.
  const [mounted, setMounted] = useState(false);
  if (near && !mounted) setMounted(true);
  const [imageFailed, setImageFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  const capturing = capture === variant;
  const showImage = isMobile && !imageFailed && !capture;
  const live = capturing || (!capture && !showImage && mounted);
  const still = reducedMotion || isMobile;
  const animate = capturing || !still;

  let frameloop: Frameloop = 'always';
  if (!capturing && !onScreen) frameloop = 'never';
  else if (!capturing && still) frameloop = 'demand';

  const canvas = live && (
    <div className={cn('absolute inset-0 transition-opacity duration-1000 ease-out', ready ? 'opacity-100' : 'opacity-0')}>
      <WorkstationCanvas
        variant={variant}
        centerScreen={centerScreen}
        pulseKey={pulseKey}
        frameloop={frameloop}
        adaptive={!capturing}
        animate={animate}
        screensLive={animate && (capturing || onScreen)}
        parallax={animate && !capturing}
        onReady={onReady}
      />
    </div>
  );

  return (
    <div
      ref={ref}
      className={cn('relative h-full w-full overflow-hidden bg-black', className)}
      style={capturing ? undefined : EDGE_MASK_STYLE}
      data-variant={variant}
      role={showImage ? undefined : 'img'}
      aria-label={showImage ? undefined : STAGE_ALT[variant]}
    >
      {showImage && <StageRender variant={variant} onError={() => setImageFailed(true)} />}
      {capturing
        ? createPortal(
            <div className="fixed inset-0 z-[100] bg-black" data-stage-capture={variant} data-stage-ready={ready}>
              {canvas}
            </div>,
            document.body,
          )
        : canvas}
    </div>
  );
}
