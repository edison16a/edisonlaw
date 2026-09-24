import { site } from '@/content/site';
import { cn } from '@/lib/cn';

interface IntroTitleProps {
  /**
   * True for the one title that is the page's h1. It is followed by the hidden
   * Projects h2, so project h3s nest under it. While the server renders more
   * than one layout, the others pass false and look the same without the headings.
   */
  heading?: boolean;
  className?: string;
}

/** Edison's name and the site tagline under it. */
export function IntroTitle({ heading = true, className }: IntroTitleProps) {
  const Name = heading ? 'h1' : 'p';
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Name className="font-display text-3xl leading-none font-bold tracking-tight">{site.name}</Name>
      <p className="text-sm text-pretty text-grey-400">{site.tagline}</p>
      {heading && (
        <h2 id="projects-title" className="sr-only">
          Projects
        </h2>
      )}
    </div>
  );
}
