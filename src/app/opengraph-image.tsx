import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { site } from '@/content/site';

export const alt = `${site.name}, Bioengineering and EECS at UC Berkeley`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Two strands of a double helix across the right side, drawn as SVG paths. */
function helixPaths(width: number, height: number) {
  const strand = (phase: number) =>
    Array.from({ length: 121 }, (_, i) => {
      const x = (i / 120) * width;
      const y = height / 2 + Math.sin((i / 120) * Math.PI * 4 + phase) * height * 0.28;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  const rungs = Array.from({ length: 16 }, (_, i) => {
    const t = (i + 0.5) / 16;
    const x = t * width;
    const a = height / 2 + Math.sin(t * Math.PI * 4) * height * 0.28;
    const b = height / 2 + Math.sin(t * Math.PI * 4 + Math.PI) * height * 0.28;
    return `M${x.toFixed(1)} ${a.toFixed(1)} L${x.toFixed(1)} ${b.toFixed(1)}`;
  }).join(' ');
  return { first: strand(0), second: strand(Math.PI), rungs };
}

export default async function OpengraphImage() {
  const fonts = join(process.cwd(), 'src/assets/fonts/og');
  const [bold, medium] = await Promise.all([
    readFile(join(fonts, 'Satoshi-Bold.ttf')),
    readFile(join(fonts, 'Satoshi-Medium.ttf')),
  ]);
  const helix = helixPaths(520, 630);

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', background: '#000', color: '#fff', position: 'relative' }}>
        <svg width="520" height="630" viewBox="0 0 520 630" style={{ position: 'absolute', right: 40, top: 0 }}>
          <path d={helix.rungs} stroke="#333" strokeWidth="2" fill="none" />
          <path d={helix.second} stroke="#555" strokeWidth="3" fill="none" strokeDasharray="2 10" strokeLinecap="round" />
          <path d={helix.first} stroke="#fff" strokeWidth="3" fill="none" />
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
