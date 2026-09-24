import { socials } from '@/content/about';
import { site } from '@/content/site';

/** schema.org Person entry, so search engines can connect the site to Edison's profiles. */
export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    url: site.url,
    jobTitle: 'Software Engineer',
    description: site.description,
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'University of California, Berkeley' },
    sameAs: socials.filter((social) => social.href.startsWith('https://')).map((social) => social.href),
  };
}
