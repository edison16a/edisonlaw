'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import type { Project } from '@/content/types';
import { useSpiralStore } from '../state/spiralStore';

/** How tightly the label trails the pointer. */
const FOLLOW = { stiffness: 700, damping: 45, mass: 0.4 };

/**
 * A small white pill beside the pointer naming the card under it, so a
 * visitor knows where a click will take them. Quiet for the card already in
 * the panel, and for touch, where nothing hovers.
 */
export function HoverLabel({ projects }: { projects: Project[] }) {
  const hovered = useSpiralStore((state) => state.hovered);
  const panel = useSpiralStore((state) => state.panel);
  const project = hovered !== null && hovered !== panel ? projects[hovered] : null;

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, FOLLOW);
  const y = useSpring(pointerY, FOLLOW);

  useEffect(() => {
    const follow = (event: PointerEvent) => {
      pointerX.set(event.clientX);
      pointerY.set(event.clientY);
    };
    window.addEventListener('pointermove', follow, { passive: true });
    return () => window.removeEventListener('pointermove', follow);
  }, [pointerX, pointerY]);

  return (
    <motion.div aria-hidden="true" style={{ x, y }} className="pointer-events-none fixed top-0 left-0 pointer-coarse:hidden">
      <AnimatePresence>
        {project && (
          <motion.span
            key={project.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.12 } }}
            transition={{ type: 'spring', stiffness: 460, damping: 30 }}
            className="absolute top-5 left-4 origin-top-left rounded-full bg-white px-3.5 py-1.5 text-sm font-medium whitespace-nowrap text-black"
          >
            {project.name}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
