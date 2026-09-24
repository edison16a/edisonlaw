'use client';

import dynamic from 'next/dynamic';
import { useCallback, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { CanvasBoundary } from '@/components/three/CanvasBoundary';
import { cn } from '@/lib/cn';
import type { ScreenId } from './screens/types';
import { STAGE_ALT, StageRender } from './stage/StageRender';
import { useStageMode } from './stage/useStageMode';
import type { StageVariant } from './types';

const WorkstationCanvas = dynamic(() => import('./WorkstationCanvas').then((mod) => mod.WorkstationCanvas), {
  ssr: false,
});

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
 * Phones, browsers without WebGL and scenes that fail to render get a pre-rendered still instead.
 */
export function WorkstationStage({ variant, centerScreen, pulseKey, className }: WorkstationStageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [canvasFailed, setCanvasFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const onCanvasFail = useCallback(() => setCanvasFailed(true), []);
  const { capturing, showImage, live, ...canvasMode } = useStageMode(ref, variant, { imageFailed, canvasFailed });

  const canvas = live && (
    <div className={cn('absolute inset-0 transition-opacity duration-1000 ease-out', ready ? 'opacity-100' : 'opacity-0')}>
      <CanvasBoundary label="desk scene" onFail={onCanvasFail}>
        <WorkstationCanvas
          variant={variant}
          centerScreen={centerScreen}
          pulseKey={pulseKey}
          onReady={onReady}
          {...canvasMode}
        />
      </CanvasBoundary>
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
