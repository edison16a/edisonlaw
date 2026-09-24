'use client';

import { AnimatePresence, motion } from 'motion/react';
import type { Project } from '@/content/types';
import { useSpiralStore } from '../state/spiralStore';

/**
 * A small white pill naming the card under the pointer, so a visitor knows
 * where a click will take them. Quiet for the card already in the panel.
 */
export function HoverLabel({ projects }: { projects: Project[] }) {
  const hovered = useSpiralStore((state) => state.hovered);
  const panel = useSpiralStore((state) => state.panel);
  const project = hovered !== null && hovered !== panel ? projects[hovered] : null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center lg:right-[clamp(21rem,29vw,27rem)] lg:bottom-10">
      <AnimatePresence>
        {project && (
          <motion.span
            key={project.id}
            initial={{ opacity: 0, y: 10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className="absolute rounded-full bg-white px-4 py-2 text-sm font-medium text-black"
          >
            {project.name}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
