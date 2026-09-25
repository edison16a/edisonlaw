'use client';

import type { Link } from '@/content/types';
import { cn } from '@/lib/cn';
import { LinkMark } from './LinkMark';
import { linkKind } from './linkKind';

/** Buttons are 38 px tall. An invisible band around each makes the tap target at least 44 px. */
const base =
  'relative inline-flex items-center gap-2 rounded-full border py-2 pr-4 pl-3.5 text-sm font-medium transition-[background-color,border-color,color,transform] duration-300 ease-out-expo after:absolute after:-inset-1 after:content-[""] active:scale-95';
/** Something to use, a live site or an app, is a white button. */
const filled = 'border-white bg-white text-black hover:border-grey-200 hover:bg-grey-200';
/** Code is an outlined button, with the GitHub mark in white. */
const outlined = 'border-grey-600 text-white hover:border-white';

interface ProjectLinksProps {
  links: Link[];
  className?: string;
  /** Hides the links from the tab order, for copies that only screen readers browse. */
  tabIndex?: number;
}

/** A project's links, each led by the logo of where it goes. Silent: the Projects section only sounds a move. */
export function ProjectLinks({ links, className, tabIndex }: ProjectLinksProps) {
  if (links.length === 0) return null;
  return (
    <ul className={cn('flex flex-wrap gap-2', className)} aria-label="Links">
      {links.map((link) => {
        const kind = linkKind(link.href);
        return (
          <li key={link.href}>
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              tabIndex={tabIndex}
              className={cn(base, kind === 'github' ? outlined : filled)}
            >
              <LinkMark kind={kind} />
              {link.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
