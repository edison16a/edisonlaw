'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Project } from '@/content/types';
import { cn } from '@/lib/cn';
import { projectPictures } from '../gallery/pictures';

interface ProjectImageProps {
  project: Project;
  /** Passed to next/image so phones download a sensible size. */
  sizes: string;
  /**
   * Which of the project's pictures to show, for the one slide whose
   * screenshots can be flipped through. Leave it out to show the thumbnail only.
   */
  shown?: number;
  className?: string;
}

/**
 * The project's photo, filling its box. If the photo cannot load, a quiet grey
 * tile names the project. With `shown`, its screenshots wait in layers above
 * the thumbnail, so they are loaded before they are picked, and the picked one
 * fades in on top. The one it replaces only goes once the fade is over, so the
 * swap never dips to the tile behind.
 */
export function ProjectImage({ project, sizes, shown, className }: ProjectImageProps) {
  const [failed, setFailed] = useState(false);
  const screenshots = shown === undefined ? [] : projectPictures(project).slice(1);

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
        <Image src={project.image} alt="" fill sizes={sizes} onError={() => setFailed(true)} className="object-cover" />
      )}
      {screenshots.map((src, index) => {
        const picked = index + 1 === shown;
        return (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            sizes={sizes}
            className={cn(
              'object-cover transition-opacity ease-out',
              picked && 'z-1 opacity-100 duration-300',
              !picked && (shown === 0 ? 'opacity-0 duration-300' : 'opacity-0 delay-300 duration-0'),
            )}
          />
        );
      })}
    </div>
  );
}
