'use client';

import { site } from '@/content/site';
import { Logo } from '@/components/icons/Logo';
import { useSectionTracker } from '@/features/navigation';
import { SoundToggle } from '@/features/sound';
import { useLenis } from 'lenis/react';
import { NavTabs } from './NavTabs';

/** Fixed black bar: the mark and name on the left, the section tabs and the sound switch on the right. */
export function Navbar() {
  useSectionTracker();
  const lenis = useLenis();

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-nav bg-black/85 backdrop-blur-md">
      <nav aria-label="Sections" className="gutter flex h-full items-center justify-between">
        <a
          href="#top"
          onClick={(event) => {
            event.preventDefault();
            if (lenis) lenis.scrollTo(0, { duration: 1.2 });
            else window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 font-display text-base font-bold tracking-tight sm:text-lg"
        >
          <Logo size={18} className="shrink-0" />
          {/* Very narrow phones keep only the mark, so the tabs and the sound switch fit. */}
          <span className="max-[400px]:sr-only">{site.name}</span>
        </a>
        <div className="flex items-center gap-3 sm:gap-6">
          <NavTabs />
          <SoundToggle />
        </div>
      </nav>
    </header>
  );
}
