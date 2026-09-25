import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface IconLinkProps {
  href: string;
  label: string;
  children: ReactNode;
  className?: string;
}

const base =
  'inline-flex size-11 items-center justify-center rounded-full border border-white/80 text-white transition-[background-color,color,transform] duration-300 ease-out-expo hover:bg-white hover:text-black active:scale-95';

/** Circular outlined icon link, used for contact buttons. */
export function IconLink({ href, label, children, className }: IconLinkProps) {
  const external = href.startsWith('http');
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      className={cn(base, className)}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
    >
      {children}
    </a>
  );
}
