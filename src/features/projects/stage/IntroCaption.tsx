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
        <span className="flex h-6 w-4 justify-center rounded-full border border-grey-600 pt-1">
          <motion.span
            className="h-1.5 w-0.5 rounded-full bg-white"
            animate={{ y: [0, 7, 0], opacity: [1, 0.15, 1] }}
            transition={{ duration: 1.8, ease: 'easeInOut', repeat: Infinity }}
          />
        </span>
        Scroll to explore
      </motion.p>
    </motion.div>
  );
}
