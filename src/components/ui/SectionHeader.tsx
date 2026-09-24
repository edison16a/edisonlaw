import { cn } from '@/lib/cn';

interface SectionHeaderProps {
  /** Two digit section number shown above the title, for example "02". */
  index: string;
  title: string;
  id: string;
  lead?: string;
  className?: string;
}

/** Numbered section title with an optional one line lead. */
export function SectionHeader({ index, title, id, lead, className }: SectionHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-4', className)}>
      <span className="font-mono text-xs tracking-widest text-grey-500">{index}</span>
      <h2 id={id} className="text-5xl leading-[0.95] font-bold sm:text-6xl">
        {title}
      </h2>
      {lead && <p className="max-w-md text-base text-grey-400">{lead}</p>}
    </header>
  );
}
