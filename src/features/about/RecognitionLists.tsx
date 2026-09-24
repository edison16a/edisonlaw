import { activities, honors } from '@/content/about';

/** Name on the left, a quiet detail on the right. */
function Row({ name, detail }: { name: string; detail: string }) {
  return (
    <li className="flex items-baseline justify-between gap-4 border-b border-grey-900 py-2.5 last:border-b-0">
      <span className="text-grey-100">{name}</span>
      {detail && <span className="shrink-0 text-sm text-grey-400 tabular-nums">{detail}</span>}
    </li>
  );
}

export function HonorsList() {
  return (
    <ul>
      {honors.map((honor) => (
        <Row key={honor.name} name={honor.name} detail={String(honor.year)} />
      ))}
    </ul>
  );
}

/** When every activity started at the same time, say it once instead of on every row. */
export function ActivitiesList() {
  const shared = activities.every((activity) => activity.since === activities[0]?.since);
  return (
    <div className="flex flex-col gap-2">
      {shared && <p className="text-sm text-grey-400">Since {activities[0].since}</p>}
      <ul>
        {activities.map((activity) => (
          <Row key={activity.name} name={activity.name} detail={shared ? '' : `Since ${activity.since}`} />
        ))}
      </ul>
    </div>
  );
}
