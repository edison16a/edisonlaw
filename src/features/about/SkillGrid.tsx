import type { SkillGroup } from '@/content/types';
import { LinkedSkill } from './LinkedSkill';

/** Skills grouped by category, each group a grid of identical cards. A click goes to where the skill came from. */
export function SkillGrid({ groups }: { groups: SkillGroup[] }) {
  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <div key={group.category} className="flex flex-col gap-3">
          <h4 className="text-sm font-medium text-white">{group.category}</h4>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            {group.items.map((item) => (
              <LinkedSkill key={item} name={item} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
