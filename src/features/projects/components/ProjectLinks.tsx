'use client';

import type { Link } from '@/content/types';
import { ArrowUpRightIcon, GitHubIcon } from '@/components/icons';
import { sound } from '@/features/sound';
import { cn } from '@/lib/cn';

/** Buttons are 38 px tall. An invisible band around each makes the tap target at least 44 px. */
const base =
  'relative inline-flex items-center rounded-full border text-sm font-medium transition-[background-color,border-color,color,transform] duration-300 ease-out-expo after:absolute after:-inset-1 after:content-[""] active:scale-95';
const pill = 'gap-1.5 px-4 py-2';
const icon = 'size-9.5 justify-center';
const filled = 'border-white bg-white text-black hover:border-grey-200 hover:bg-grey-200';
const outlined = 'border-grey-600 text-white hover:border-white';

/** Code lives on GitHub. Everything else is something to use: a live site or an app. */
const isCode = (link: Link) => link.href.startsWith('https://github.com/');

interface ProjectLinksProps {
  links: Link[];
  /** Shows GitHub links as a round icon, for the tight rows of the list. */
  compact?: boolean;
  className?: string;
  /** Hides the links from the tab order, for copies that only screen readers browse. */
  tabIndex?: number;
}

/** Live sites and apps are filled buttons, code links are outlined, wherever they appear. */
export function ProjectLinks({ links, compact, className, tabIndex }: ProjectLinksProps) {
  if (links.length === 0) return null;
  return (
    <ul className={cn('flex flex-wrap gap-2', className)} aria-label="Links">
      {links.map((link) => {
        const code = isCode(link);
        const iconOnly = compact && code;
        return (
          <li key={link.href}>
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              tabIndex={tabIndex}
              aria-label={iconOnly ? link.label : undefined}
              title={iconOnly ? link.label : undefined}
              onPointerEnter={() => sound.play('hover')}
              onClick={() => sound.play('blip')}
              className={cn(base, iconOnly ? icon : pill, code ? outlined : filled)}
            >
              {iconOnly ? (
                <GitHubIcon size={17} />
              ) : (
                <>
                  {link.label}
                  <ArrowUpRightIcon size={15} />
                </>
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
