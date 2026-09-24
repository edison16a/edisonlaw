import type { SkillGroup } from '@/content/types';
import { SkillCard } from '@/components/skills/SkillCard';

/** Skills grouped by category, each group a grid of identical cards. */
export function SkillGrid({ groups }: { groups: SkillGroup[] }) {
  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <div key={group.category} className="flex flex-col gap-3">
          <h4 className="text-sm font-medium text-grey-400">{group.category}</h4>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            {group.items.map((item) => (
              <SkillCard key={item} name={item} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
