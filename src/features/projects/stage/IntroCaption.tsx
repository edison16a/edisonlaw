'use client';

import { motion } from 'motion/react';
import { IntroTitle } from '../components/IntroTitle';
import { useSpiralStore } from '../state/spiralStore';

/**
 * Bottom left of the stage: who this is, and a hint to scroll that bows out
 * after the first scroll. The caption steps aside while the cards have the stage.
 */
export function IntroCaption() {
  const hasScrolled = useSpiralStore((state) => state.hasScrolled);
  const inDeck = useSpiralStore((state) => state.inDeck);

  return (
    <motion.div
      initial={false}
      animate={{ opacity: inDeck ? 0 : 1, y: inDeck ? 12 : 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="gutter pointer-events-none absolute bottom-8 left-0 flex flex-col gap-6 lg:bottom-10"
    >
      <IntroTitle />
      <motion.p
        aria-hidden={hasScrolled}
        initial={false}
        animate={{ opacity: hasScrolled ? 0 : 1, y: hasScrolled ? 6 : 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-3 text-xs text-grey-400"
      >
        <span className="relative h-6 w-px overflow-hidden bg-grey-800">
          <motion.span
            className="absolute inset-x-0 top-0 h-2 bg-white"
            animate={{ y: ['-100%', '300%'] }}
            transition={{ duration: 1.8, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.3 }}
          />
        </span>
        Scroll to explore
      </motion.p>
    </motion.div>
  );
}
