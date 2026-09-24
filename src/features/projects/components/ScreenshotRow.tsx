'use client';

import Image from 'next/image';
import type { Project } from '@/content/types';
import { sound } from '@/features/sound';
import { cn } from '@/lib/cn';
import { projectPictures } from '../gallery/pictures';

interface ScreenshotRowProps {
  project: Project;
  /** Index of the picture on show. 0 is the thumbnail. */
  shown: number;
  onChoose: (picture: number) => void;
  className?: string;
}

/**
 * One row of uniform small screenshots of a project, the thumbnail first. A
 * press shows that picture on the project's card. The one on show is at full
 * strength and the others are dimmed. Set --thumb on the row or a parent for
 * the width of each picture.
 */
export function ScreenshotRow({ project, shown, onChoose, className }: ScreenshotRowProps) {
  const pictures = projectPictures(project);

  return (
    <div role="group" aria-label={`Screenshots of ${project.name}`} className={cn('flex gap-[calc(var(--thumb)*0.14)]', className)}>
      {pictures.map((src, index) => {
        const current = index === shown;
        return (
          <button
            key={src}
            type="button"
            aria-label={`Show screenshot ${index + 1} of ${pictures.length} of ${project.name}`}
            aria-pressed={current}
            onClick={() => {
              if (current) return;
              sound.play('tab');
              onChoose(index);
            }}
            onPointerEnter={() => sound.play('hover')}
            // The band after the button makes the tap target taller than the picture.
            className="group relative block aspect-[16/10] w-(--thumb) shrink-0 rounded-[calc(var(--thumb)*0.1)] shadow-[0_10px_28px_-6px_rgb(0_0_0/0.8)] transition-transform duration-300 ease-out-expo after:absolute after:-inset-x-1 after:-inset-y-1.5 after:content-[''] active:scale-95"
          >
            <span className="absolute inset-0 overflow-hidden rounded-[inherit] bg-grey-900">
              <Image
                src={src}
                alt=""
                fill
                sizes="96px"
                className={cn(
                  'object-cover transition-opacity duration-300 ease-out-expo',
                  current ? 'opacity-100' : 'opacity-50 group-hover:opacity-85',
                )}
              />
            </span>
            {current && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.14)]"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
