'use client';

import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react';
import { SkillCard } from '@/components/skills/SkillCard';
import { originLabel, skillOrigins, type SkillOrigin } from '@/content/skillOrigins';
import { useGoToOrigin } from '@/features/navigation';

/** How long the mouse rests on a skill before the list opens, in milliseconds. */
const REST = 1000;
/** Gap from the viewport edge the list keeps, in pixels. */
const EDGE = 12;

/** The projects and jobs a skill came from, each one a button that goes there. */
function OriginList({ origins, onGo }: { origins: SkillOrigin[]; onGo: (origin: SkillOrigin) => void }) {
  const list = useRef<HTMLDivElement>(null);
  const [alignRight, setAlignRight] = useState(false);

  // Opens leftward when it would run off the right edge of the screen.
  useLayoutEffect(() => {
    const box = list.current?.getBoundingClientRect();
    if (box && box.right > window.innerWidth - EDGE) setAlignRight(true);
  }, []);

  return (
    <div
      ref={list}
      className={`absolute top-full z-30 w-max max-w-[min(18rem,calc(100vw-1.5rem))] pt-1.5 ${alignRight ? 'right-0' : 'left-0'}`}
    >
      <ul data-lenis-prevent className="flex max-h-72 flex-col gap-0.5 overflow-y-auto rounded-xl border border-grey-800 bg-black p-1.5 shadow-2xl shadow-black">
        {origins.map((origin) => (
          <li key={`${origin.kind}-${origin.id}`}>
            <button
              type="button"
              onClick={() => onGo(origin)}
              className="flex w-full cursor-pointer items-baseline justify-between gap-4 rounded-lg px-2.5 py-1.5 text-left text-sm text-grey-100"
            >
              <span>{originLabel(origin)}</span>
              <span className="text-xs text-grey-400">{origin.kind === 'project' ? 'Project' : 'Work'}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * A skill card that goes to the project or job the skill came from. Rest the mouse on it
 * for a second and a list of every project and job it is linked to opens.
 */
export function LinkedSkill({ name }: { name: string }) {
  const goTo = useGoToOrigin();
  const origins = skillOrigins(name);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [open, setOpen] = useState(false);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (origins.length === 0) return <SkillCard name={name} />;

  const go = (origin: SkillOrigin) => {
    clearTimeout(timer.current);
    setOpen(false);
    goTo(origin);
  };
  const enter = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), REST);
  };
  const leave = () => {
    clearTimeout(timer.current);
    setOpen(false);
  };

  return (
    <SkillCard name={name} onSelect={() => go(origins[0])} hover={{ onPointerEnter: enter, onPointerLeave: leave }}>
      {open && <OriginList origins={origins} onGo={go} />}
    </SkillCard>
  );
}
