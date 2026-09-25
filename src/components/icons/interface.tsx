import { IconBase, type IconProps } from './IconBase';

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 17 17 7M8 7h9v9" />
    </IconBase>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </IconBase>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </IconBase>
  );
}


/** A person, for user counts. */
export function UserIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.6-3.6 3.4-6 7-6s6.4 2.4 7 6" />
    </IconBase>
  );
}

/** A five point star, for store features. */
export function StarIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
    </IconBase>
  );
}

/** A trophy, for hackathon wins. */
export function TrophyIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7.5 4h9v5a4.5 4.5 0 0 1-9 0V4z" />
      <path d="M7.5 6H5v1.5a3 3 0 0 0 3 3M16.5 6H19v1.5a3 3 0 0 1-3 3M12 13.5V17M8.5 20h7M9.5 20c0-1.7 1.1-3 2.5-3s2.5 1.3 2.5 3" />
    </IconBase>
  );
}

export function SpeakerIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" />
      <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
    </IconBase>
  );
}

export function SpeakerMutedIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" />
      <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" opacity="0.35" />
      <path d="M3.5 3.5 20.5 20.5" />
    </IconBase>
  );
}
