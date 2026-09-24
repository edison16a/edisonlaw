import { education } from '@/content/about';

export function EducationList() {
  return (
    <ul className="flex flex-col gap-6">
      {education.map((item) => (
        <li key={item.school} className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <p className="font-display text-lg font-bold">{item.school}</p>
            {item.when && <p className="font-mono text-xs text-grey-400">{item.when}</p>}
          </div>
          <p className="text-grey-300">{item.detail}</p>
          {item.coursework && (
            <p className="text-sm leading-relaxed text-grey-400">
              <span className="text-grey-400">Coursework: </span>
              {item.coursework.join(', ')}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
