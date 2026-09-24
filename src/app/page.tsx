import { Navbar } from '@/components/layout/Navbar';
import { AboutSection } from '@/features/about/AboutSection';
import { ExperienceSection } from '@/features/experience/ExperienceSection';
import { SmoothScroll } from '@/features/navigation';
import { ProjectsSection } from '@/features/projects/ProjectsSection';
import { SoundToggle } from '@/features/sound';

export default function Home() {
  return (
    <SmoothScroll>
      <div id="top" />
      <Navbar />
      <main>
        <ProjectsSection />
        <ExperienceSection />
        <AboutSection />
      </main>
      <SoundToggle />
    </SmoothScroll>
  );
}
