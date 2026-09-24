import { site } from '@/content/site';
import { cn } from '@/lib/cn';

/** Edison's name and one quiet line under it. The page's only h1. */
export function IntroTitle({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <h1 className="font-display text-3xl leading-none font-bold tracking-tight">{site.name}</h1>
      <p className="text-sm text-grey-400">Bioengineering and EECS at UC Berkeley.</p>
    </div>
  );
}
