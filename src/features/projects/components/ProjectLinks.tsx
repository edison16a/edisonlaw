'use client';

import type { Link } from '@/content/types';
import { ArrowUpRightIcon } from '@/components/icons';
import { sound } from '@/features/sound';
import { cn } from '@/lib/cn';

const base =
  'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-[background-color,border-color,color,transform] duration-300 ease-out-expo active:scale-95';
const primary = 'bg-white text-black hover:bg-grey-200';
const secondary = 'border border-grey-600 text-white hover:border-white';

interface ProjectLinksProps {
  links: Link[];
  className?: string;
  /** Hides the links from the tab order, for copies that only screen readers browse. */
  tabIndex?: number;
}

/** The first link is the filled primary button, the rest are outlined. */
export function ProjectLinks({ links, className, tabIndex }: ProjectLinksProps) {
  if (links.length === 0) return null;
  return (
    <ul className={cn('flex flex-wrap gap-2', className)} aria-label="Links">
      {links.map((link, index) => (
        <li key={link.href}>
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer"
            tabIndex={tabIndex}
            onPointerEnter={() => sound.play('hover')}
            onClick={() => sound.play('blip')}
            className={cn(base, index === 0 ? primary : secondary)}
          >
            {link.label}
            <ArrowUpRightIcon size={15} />
          </a>
        </li>
      ))}
    </ul>
  );
}
