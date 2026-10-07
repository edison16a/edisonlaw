import type { HTMLAttributes, ReactNode } from 'react';
import { getSkillIcon } from './skillIcons';
import { SkillMark } from './SkillMark';

interface SkillCardProps {
  name: string;
  /** Makes the card a button with no hover change, for skills that lead somewhere. */
  onSelect?: () => void;
  /** Handlers for the pointer on the card and on whatever opens beside it. */
  hover?: Pick<HTMLAttributes<HTMLLIElement>, 'onPointerEnter' | 'onPointerLeave'>;
  /** Opens beside the card, such as a list of where the skill was used. */
  children?: ReactNode;
}

const FACE = 'flex min-h-12 w-full items-center gap-3 rounded-xl border border-grey-800 bg-black px-3.5 py-2';

/** Identical small card: black face, thin grey border, the skill's logo in colour and its name. */
export function SkillCard({ name, onSelect, hover, children }: SkillCardProps) {
  const icon = getSkillIcon(name);
  const mark = <span className="flex h-5 min-w-5 shrink-0 items-center justify-center">{icon && <SkillMark icon={icon} />}</span>;
  const label = <span className="text-left text-sm leading-tight text-grey-100">{name}</span>;

  if (onSelect) {
    return (
      <li className="relative" {...hover}>
        <button type="button" onClick={onSelect} className={`${FACE} cursor-pointer`}>
          {mark}
          {label}
        </button>
        {children}
      </li>
    );
  }
  return (
    <li className={`group ${FACE} transition-colors duration-300 hover:border-grey-400`}>
      <span className="transition-transform duration-300 ease-out-expo group-hover:scale-110">{mark}</span>
      {label}
    </li>
  );
}
