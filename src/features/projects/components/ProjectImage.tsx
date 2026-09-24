'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import type { Project } from '@/content/types';
import { cn } from '@/lib/cn';
import { drawCoverInto, getPaintedCover } from '../media/coverCanvas';

interface ProjectImageProps {
  project: Project;
  /** Passed to next/image so phones download a sensible size. */
  sizes: string;
  priority?: boolean;
  className?: string;
}

/** The project's photo in the page, or its painted cover when it has no photo. Fills its box. */
export function ProjectImage({ project, sizes, priority, className }: ProjectImageProps) {
  return (
    <div className={cn('relative overflow-hidden bg-grey-900', className)}>
      {project.image ? (
        <Image src={project.image} alt="" fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <PaintedCover project={project} />
      )}
    </div>
  );
}

function PaintedCover({ project }: { project: Project }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let alive = true;
    const cover = getPaintedCover(project);
    void cover.ready.then(() => {
      if (alive && canvas.current) drawCoverInto(canvas.current, cover);
    });
    return () => {
      alive = false;
    };
  }, [project]);

  return <canvas ref={canvas} width={640} height={400} aria-hidden="true" className="absolute inset-0 size-full object-cover" />;
}
