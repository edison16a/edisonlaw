'use client';

import { useEffect, useRef } from 'react';
import { intro, skills } from '@/content/about';
import { Footer } from '@/components/layout/Footer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { sound } from '@/features/sound';
import { WorkstationStage } from '@/features/workstation';
import { useInView } from '@/lib/hooks/useInView';
import { AboutBlock } from './AboutBlock';
import { ContactLinks } from './ContactLinks';
import { EducationList } from './EducationList';
import { ActivitiesList, HonorsList } from './RecognitionLists';
import { SkillGrid } from './skills/SkillGrid';

/** Standing scene pinned on the left, the story and details scrolling on the right. */
export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { rootMargin: '-30% 0px -30% 0px' });

  useEffect(() => {
    sound.setLoop('room', inView);
    return () => sound.setLoop('room', false);
  }, [inView]);

  return (
    <section
      id="about"
      ref={sectionRef}
      aria-labelledby="about-title"
      className="relative flex flex-col border-t border-grey-900 lg:grid lg:grid-cols-2"
    >
      <div className="mt-nav aspect-[4/3] w-full lg:sticky lg:mt-0 lg:top-nav lg:aspect-auto lg:h-[calc(100dvh-var(--spacing-nav))]">
        <WorkstationStage variant="about" />
      </div>
      <div className="gutter flex flex-col gap-14 pt-16 lg:pt-[calc(var(--spacing-nav)+4rem)] pb-12">
        <SectionHeader index="03" id="about-title" title="About Me" />
        <div className="flex max-w-xl flex-col gap-4 text-lg leading-relaxed text-grey-100 sm:text-xl">
          {intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <AboutBlock label="Contact">
          <ContactLinks />
        </AboutBlock>
        <AboutBlock label="Education">
          <EducationList />
        </AboutBlock>
        <AboutBlock label="Skills">
          <SkillGrid groups={skills} />
        </AboutBlock>
        <AboutBlock label="Honors">
          <HonorsList />
        </AboutBlock>
        <AboutBlock label="Activities">
          <ActivitiesList />
        </AboutBlock>
        <Footer />
      </div>
    </section>
  );
}
