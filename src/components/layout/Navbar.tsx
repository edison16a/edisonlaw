'use client';

import { site } from '@/content/site';
import { useSectionTracker } from '@/features/navigation';
import { useLenis } from 'lenis/react';
import { NavTabs } from './NavTabs';

/** Fixed black bar with the wordmark on the left and the section tabs on the right. */
export function Navbar() {
  useSectionTracker();
  const lenis = useLenis();

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-nav border-b border-grey-900 bg-black/85 backdrop-blur-md">
      <nav aria-label="Sections" className="gutter flex h-full items-center justify-between">
        <a
          href="#top"
          onClick={(event) => {
            event.preventDefault();
            if (lenis) lenis.scrollTo(0, { duration: 1.2 });
            else window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="font-display text-base font-bold tracking-tight sm:text-lg"
        >
          {site.name}
        </a>
        <NavTabs />
      </nav>
    </header>
  );
}
