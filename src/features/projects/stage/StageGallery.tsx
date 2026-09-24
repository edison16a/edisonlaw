'use client';

import { AnimatePresence, motion } from 'motion/react';
import type { Project } from '@/content/types';
import { EASE_OUT_EXPO } from '@/lib/easing';
import { ScreenshotRow } from '../components/ScreenshotRow';
import { hasGallery, projectPictures } from '../gallery/pictures';
import { shownPicture } from '../gallery/selection';
import { useSpiralStore } from '../state/spiralStore';

/**
 * The screenshot row under the focused card, for the few projects that have
 * screenshots. It mounts as the project comes into focus, so its pictures
 * start loading, fades in once the spiral settles on it and out as soon as
 * the spiral moves. It sits centred under the card, from the card's place
 * that the stage publishes, with each picture sized from the card's width.
 */
export function StageGallery({ projects }: { projects: Project[] }) {
  const panel = useSpiralStore((state) => state.panel);
  const settled = useSpiralStore((state) => state.settled);
  const gallery = useSpiralStore((state) => state.gallery);
  const choosePicture = useSpiralStore((state) => state.choosePicture);
  const project = panel === null ? null : projects[panel];
  const shown = panel !== null && settled === panel;

  return (
    <AnimatePresence>
      {project && panel !== null && hasGallery(project) && (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 8 }}
          animate={
            shown
              ? { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1, ease: EASE_OUT_EXPO } }
              : { opacity: 0, y: 8, transition: { duration: 0.15 } }
          }
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          inert={!shown}
          style={{
            left: 'calc((var(--card-left, 25%) + var(--card-right, 75%)) / 2)',
            top: 'calc(var(--card-bottom, 75%) + clamp(1rem, 2.4dvh, 1.75rem))',
          }}
          className="absolute isolate z-10 -translate-x-1/2 [--thumb:clamp(3.25rem,calc((var(--card-right)_-_var(--card-left))_*_0.125),5.5rem)]"
        >
          {/* A soft dark pool under the row lifts it off the busy cards further down the strand. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-8 -inset-y-6 -z-10 rounded-[2rem] bg-black/75 blur-2xl"
          />
          <ScreenshotRow
            project={project}
            shown={shownPicture(gallery, panel)}
            onChoose={(picture) => choosePicture(panel, picture, projectPictures(project).length)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
