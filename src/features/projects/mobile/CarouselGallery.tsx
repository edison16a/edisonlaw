'use client';

import { AnimatePresence, motion } from 'motion/react';
import type { Project } from '@/content/types';
import { EASE_OUT_EXPO } from '@/lib/easing';
import { ScreenshotRow } from '../components/ScreenshotRow';
import { hasGallery } from '../gallery/pictures';

interface CarouselGalleryProps {
  /** The project on the current slide. */
  project: Project;
  /** Index of the picture the slide shows. */
  shown: number;
  onChoose: (picture: number) => void;
}

/**
 * The screenshot row under the current slide, for a project with
 * screenshots. It opens and closes as the slides change, so the controls
 * below glide instead of jumping.
 */
export function CarouselGallery({ project, shown, onChoose }: CarouselGalleryProps) {
  return (
    <AnimatePresence initial={false}>
      {hasGallery(project) && (
        <motion.div
          key={project.id}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
          // Clips the row while it opens, but leaves room for the shadows under the pictures.
          className="overflow-clip [overflow-clip-margin:1.5rem]"
        >
          <ScreenshotRow
            project={project}
            shown={shown}
            onChoose={onChoose}
            className="gutter mx-auto justify-center pt-4 [--thumb:3.25rem] sm:[--thumb:4rem]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
