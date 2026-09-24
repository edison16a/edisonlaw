'use client';

import { motion } from 'motion/react';
import { IconBase } from '@/components/icons/IconBase';
import { useScrollToSection } from '@/features/navigation';
import { sound } from '@/features/sound';

/**
 * A quiet way on, centred at the bottom of the stage. The wheel spins the
 * spiral while it fills the screen, so this glides the page down to Work
 * Experience. Without JavaScript it is a plain link to the section.
 */
export function NextSectionCue() {
  const scrollToSection = useScrollToSection();

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
      <a
        href="#experience"
        onClick={(event) => {
          event.preventDefault();
          scrollToSection('experience');
        }}
        onPointerEnter={() => sound.play('hover')}
        className="group pointer-events-auto flex flex-col items-center gap-0.5 rounded-full px-5 py-2 text-xs font-medium tracking-wide text-grey-300 transition-colors duration-300 hover:text-white"
      >
        Work Experience
        <motion.span
          aria-hidden="true"
          animate={{ y: [0, 3, 0] }}
          transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
          className="block"
        >
          <IconBase size={16} strokeWidth={1.75}>
            <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />
          </IconBase>
        </motion.span>
      </a>
    </div>
  );
}
