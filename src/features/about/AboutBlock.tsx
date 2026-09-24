'use client';

import type { ReactNode } from 'react';
import { motion } from 'motion/react';

/** A labelled block in the About column that eases in as it scrolls into view. */
export function AboutBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <motion.section
      aria-label={label}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5 border-t border-grey-900 pt-8"
    >
      <h3 className="font-mono text-xs font-normal tracking-widest text-grey-500 uppercase">{label}</h3>
      {children}
    </motion.section>
  );
}
