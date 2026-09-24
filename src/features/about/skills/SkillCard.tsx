'use client';

import { sound } from '@/features/sound';
import { getSkillIcon } from './skillIcons';

/** Identical small card: black face, thin grey border, the mark in its brand colour and the name. */
export function SkillCard({ name }: { name: string }) {
  const icon = getSkillIcon(name);
  return (
    <li
      onPointerEnter={() => sound.play('hover')}
      className="group flex min-h-12 items-center gap-3 rounded-xl border border-grey-800 bg-black px-3.5 py-2 transition-colors duration-300 hover:border-grey-400"
    >
      <span
        style={{ color: icon?.color }}
        className="flex size-5 shrink-0 items-center justify-center transition-[filter] duration-300 group-hover:drop-shadow-[0_0_8px_currentColor]"
      >
        {icon?.kind === 'brand' && (
          <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden="true" focusable="false">
            <path d={icon.icon.path} />
          </svg>
        )}
        {icon?.kind === 'glyph' && <icon.Glyph size={20} />}
      </span>
      <span className="text-sm leading-tight text-grey-100">{name}</span>
    </li>
  );
}
