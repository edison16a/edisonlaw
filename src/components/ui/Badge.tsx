import { cn } from '@/lib/cn';

/** Solid white pill for awards and status. It is the loudest element a card gets. */
export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-[11px] font-medium leading-5 text-black',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function BadgeList({ items, className }: { items: string[]; className?: string }) {
  if (items.length === 0) return null;
  return (
    <ul className={cn('flex flex-wrap gap-1.5', className)} aria-label="Awards and status">
      {items.map((item) => (
        <li key={item}>
          <Badge>{item}</Badge>
        </li>
      ))}
    </ul>
  );
}
