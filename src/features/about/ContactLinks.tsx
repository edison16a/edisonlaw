import type { SocialKind } from '@/content/types';
import { email, socials } from '@/content/about';
import { GitHubIcon, LinkedInIcon, MailIcon, type IconProps } from '@/components/icons';
import { IconLink } from '@/components/ui/IconButton';
import { CopyEmail } from './CopyEmail';

const ICONS: Record<SocialKind, (props: IconProps) => React.ReactNode> = {
  email: MailIcon,
  github: GitHubIcon,
  linkedin: LinkedInIcon,
};

/** Round icon buttons for each social, plus the email spelled out to copy. */
export function ContactLinks() {
  return (
    <div className="flex flex-col gap-5">
      <ul className="flex gap-3">
        {socials.map((social) => {
          const Icon = ICONS[social.kind];
          return (
            <li key={social.kind}>
              <IconLink href={social.href} label={`${social.label}: ${social.display}`}>
                <Icon size={19} />
              </IconLink>
            </li>
          );
        })}
      </ul>
      <CopyEmail email={email} />
    </div>
  );
}
