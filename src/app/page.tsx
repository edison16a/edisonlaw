import { Navbar } from '@/components/layout/Navbar';
import { Providers } from '@/components/layout/Providers';
import { AboutSection } from '@/features/about/AboutSection';
import { ExperienceSection } from '@/features/experience/ExperienceSection';
import { ProjectsSection } from '@/features/projects/ProjectsSection';
import { SoundToggle } from '@/features/sound';

export default function Home() {
  return (
    <Providers>
      <div id="top" />
      <Navbar />
      <main>
        <ProjectsSection />
        <ExperienceSection />
        <AboutSection />
      </main>
      <SoundToggle />
    </Providers>
  );
}
