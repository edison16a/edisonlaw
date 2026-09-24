'use client';

import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { EASE_OUT_EXPO } from '@/lib/easing';

/** A labelled block in the About column that eases in as it scrolls into view. */
export function AboutBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <motion.section
      aria-label={label}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
      className="flex flex-col gap-5 border-t border-grey-900 pt-8"
    >
      <h3 className="font-mono text-xs font-normal tracking-widest text-grey-400 uppercase">{label}</h3>
      {children}
    </motion.section>
  );
}
