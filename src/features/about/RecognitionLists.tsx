import { activities, honors } from '@/content/about';

/** Name on the left, a quiet mono detail on the right. */
function Row({ name, detail }: { name: string; detail: string }) {
  return (
    <li className="flex items-baseline justify-between gap-4 border-b border-grey-900 py-2.5 last:border-b-0">
      <span className="text-grey-100">{name}</span>
      <span className="shrink-0 font-mono text-xs text-grey-400">{detail}</span>
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

export function ActivitiesList() {
  return (
    <ul>
      {activities.map((activity) => (
        <Row key={activity.name} name={activity.name} detail={`Since ${activity.since}`} />
      ))}
    </ul>
  );
}
