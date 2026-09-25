import { activities, honors } from '@/content/about';

/** Name on the left, a quiet detail on the right. */
function Row({ name, detail }: { name: string; detail: string }) {
  return (
    <li className="flex items-baseline justify-between gap-4 py-2">
      <span className="text-white">{name}</span>
      {detail && <span className="shrink-0 text-sm text-white tabular-nums">{detail}</span>}
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

/** Activities by name only. */
export function ActivitiesList() {
  return (
    <ul>
      {activities.map((activity) => (
        <Row key={activity.name} name={activity.name} detail="" />
      ))}
    </ul>
  );
}
