'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Project } from '@/content/types';
import { cn } from '@/lib/cn';

interface ProjectImageProps {
  project: Project;
  /** Passed to next/image so phones download a sensible size. */
  sizes: string;
  priority?: boolean;
  className?: string;
}

/** The project's photo, filling its box. If the photo cannot load, a quiet grey tile names the project. */
export function ProjectImage({ project, sizes, priority, className }: ProjectImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn('relative overflow-hidden bg-grey-900', className)}>
      {failed ? (
        <p
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center p-6 text-center font-display text-xl font-bold text-grey-400"
        >
          {project.name}
        </p>
      ) : (
        <Image
          src={project.image}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setFailed(true)}
          className="object-cover"
        />
      )}
    </div>
  );
}
