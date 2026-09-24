import Image from 'next/image';
import type { SkillIcon } from './skillIcons';

/** Draws one skill mark inside a 20px slot, whatever kind it is. */
export function SkillMark({ icon }: { icon: SkillIcon }) {
  switch (icon.kind) {
    case 'brand':
      return (
        <svg viewBox="0 0 24 24" width={18} height={18} fill={icon.color} aria-hidden="true" focusable="false">
          <path d={icon.icon.path} />
        </svg>
      );
    case 'logo':
      return (
        <span className="flex items-center gap-1">
          {icon.srcs.map((src) => (
            <Image key={src} src={src} alt="" width={20} height={20} unoptimized className="size-5 object-contain" />
          ))}
        </span>
      );
    case 'letter':
      return (
        <span aria-hidden="true" className="font-display text-[19px] leading-none font-black" style={{ color: icon.color }}>
          {icon.letter}
        </span>
      );
    case 'glyph':
      return <icon.Glyph size={20} style={{ color: icon.color }} />;
  }
}
