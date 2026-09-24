import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { site } from '@/content/site';

export const alt = `${site.name}, Bioengineering and EECS at UC Berkeley`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  const fonts = join(process.cwd(), 'src/assets/fonts/og');
  const [bold, medium] = await Promise.all([
    readFile(join(fonts, 'Satoshi-Bold.ttf')),
    readFile(join(fonts, 'Satoshi-Medium.ttf')),
  ]);

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: '#000', color: '#fff', position: 'relative' }}>
        <svg width="430" height="354" viewBox="0 0 1074 884" style={{ position: 'absolute', right: 90, top: 138 }}>
          <rect x="257" y="0" width="817" height="267" rx="133.5" fill="#fff" />
          <rect x="0" y="312" width="818" height="266" rx="133" fill="#fff" />
          <rect x="257" y="617" width="817" height="267" rx="133.5" fill="#fff" />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 80, width: 720 }}>
          <div style={{ display: 'flex', fontFamily: 'Satoshi Medium', fontSize: 24, color: '#858585' }}>
            Projects, Work Experience, About Me
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ fontFamily: 'Satoshi Bold', fontSize: 104, lineHeight: 0.95, letterSpacing: -3 }}>{site.name}</div>
            <div style={{ fontFamily: 'Satoshi Medium', fontSize: 34, color: '#c4c4c4', lineHeight: 1.3 }}>{site.tagline}</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Satoshi Bold', data: bold, weight: 700, style: 'normal' },
        { name: 'Satoshi Medium', data: medium, weight: 500, style: 'normal' },
      ],
    },
  );
}
