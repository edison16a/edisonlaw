'use client';

import { useEffect, useRef } from 'react';
import { LayoutGroup, motion } from 'motion/react';
import { sections } from '@/content/site';
import { sound } from '@/features/sound';
import { useNavStore, useScrollToSection } from '@/features/navigation';
import { cn } from '@/lib/cn';

const SHORT_LABELS: Record<string, string> = { experience: 'Work', about: 'About' };

/** The three section tabs with one white underline that slides between them. */
export function NavTabs() {
  const active = useNavStore((state) => state.active);
  const scrollToSection = useScrollToSection();
  const previous = useRef(active);

  useEffect(() => {
    if (previous.current !== active) sound.play('tab');
    previous.current = active;
  }, [active]);

  return (
    <LayoutGroup id="nav">
      <ul className="flex items-center gap-5 sm:gap-8">
        {sections.map((section) => {
          const isActive = section.id === active;
          return (
            <li key={section.id} className="relative">
              <a
                href={`#${section.id}`}
                aria-current={isActive ? 'true' : undefined}
                onPointerEnter={() => !isActive && sound.play('hover')}
                onClick={(event) => {
                  event.preventDefault();
                  scrollToSection(section.id);
                }}
                className={cn(
                  'relative block py-5 text-sm font-medium tracking-tight transition-opacity duration-300',
                  isActive ? 'opacity-100' : 'opacity-45 hover:opacity-80',
                )}
              >
                <span className="hidden sm:inline">{section.label}</span>
                <span className="sm:hidden">{SHORT_LABELS[section.id] ?? section.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-0 bottom-3 h-[3px] rounded-full bg-white"
                    transition={{ type: 'spring', stiffness: 380, damping: 34, mass: 0.9 }}
                  />
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </LayoutGroup>
  );
}
