'use client';

import { motion } from 'motion/react';
import { IntroTitle } from '../components/IntroTitle';
import { useSpiralStore } from '../state/spiralStore';
import { EASE_OUT_EXPO } from '@/lib/easing';

/**
 * Bottom left of the stage: who this is, and a hint to scroll that bows out
 * after the first scroll. The caption only shows in the intro and steps aside
 * once the cards have the stage.
 */
export function IntroCaption() {
  const hasScrolled = useSpiralStore((state) => state.hasScrolled);
  const inIntro = useSpiralStore((state) => state.inIntro);

  return (
    <motion.div
      initial={false}
      animate={{ opacity: inIntro ? 1 : 0, y: inIntro ? 0 : 12 }}
      transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
      className="gutter pointer-events-none absolute bottom-8 left-0 isolate flex flex-col gap-6 lg:bottom-10"
    >
      {/* A soft shadow from the corner keeps the words readable when a bright card passes behind them. */}
      <div
        aria-hidden="true"
        className="absolute -bottom-10 left-0 -z-10 h-[calc(100%+8rem)] w-[calc(100%+10rem)] bg-[radial-gradient(ellipse_at_bottom_left,rgb(0_0_0/0.82),rgb(0_0_0/0.5)_40%,transparent_70%)]"
      />
      <IntroTitle />
      <motion.p
        aria-hidden={hasScrolled}
        initial={false}
        animate={{ opacity: hasScrolled ? 0 : 1, y: hasScrolled ? 6 : 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
        className="flex items-center gap-3 text-xs text-grey-400"
      >
        {/* A mouse means nothing on a touch screen, so only the words show there. */}
        <span className="flex h-6 w-4 justify-center rounded-full border border-grey-600 pt-1 pointer-coarse:hidden">
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
