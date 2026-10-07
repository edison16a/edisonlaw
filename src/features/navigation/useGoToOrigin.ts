'use client';

import { useCallback } from 'react';
import { useLenis } from 'lenis/react';
import { experience } from '@/content/experience';
import { projects } from '@/content/projects';
import type { SkillOrigin } from '@/content/skillOrigins';
import { showProject } from '@/features/projects/state/projectRequest';
import { useScrollToSection } from './useScrollToSection';
import { useNavStore } from './useNavStore';

const DURATION = 1.4;
/** Where an entry lands, as a share of the viewport height. The timeline counts an entry as read from halfway up. */
const LANDING = 0.35;

/** Takes the reader to the project or job a skill came from. */
export function useGoToOrigin() {
  const lenis = useLenis();
  const scrollToSection = useScrollToSection();
  const lockTo = useNavStore((state) => state.lockTo);

  return useCallback(
    (origin: SkillOrigin) => {
      if (origin.kind === 'project') {
        scrollToSection('projects');
        showProject(projects.findIndex((item) => item.id === origin.id), projects.length);
        return;
      }
      const entry = document.getElementById(`experience-${origin.id}`);
      if (!entry || !experience.some((item) => item.id === origin.id)) return;
      lockTo('experience', DURATION * 1000 + 150);
      const offset = -window.innerHeight * LANDING;
      if (lenis) lenis.scrollTo(entry, { duration: DURATION, offset, easing: (t) => 1 - Math.pow(1 - t, 4) });
      else window.scrollTo({ top: entry.getBoundingClientRect().top + window.scrollY + offset, behavior: 'smooth' });
    },
    [lenis, lockTo, scrollToSection],
  );
}
