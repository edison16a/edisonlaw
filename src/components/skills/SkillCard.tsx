import { getSkillIcon } from './skillIcons';
import { SkillMark } from './SkillMark';

interface SkillCardProps {
  name: string;
}

/** Identical small card: black face, thin grey border, the skill's logo in colour and its name. */
export function SkillCard({ name }: SkillCardProps) {
  const icon = getSkillIcon(name);
  return (
    <li className="group flex min-h-12 items-center gap-3 rounded-xl border border-grey-800 bg-black px-3.5 py-2 transition-colors duration-300 hover:border-grey-400">
      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center transition-transform duration-300 ease-out-expo group-hover:scale-110">
        {icon && <SkillMark icon={icon} />}
      </span>
      <span className="text-sm leading-tight text-grey-100">{name}</span>
    </li>
  );
}
