import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { HERO_TAGLINES } from '@/lib/copy/taglines';

export const dynamic = 'force-dynamic';
export const alt = 'NPC Outfitters — Default Skins for Real Life';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function getLogoDataUri() {
  const buffer = readFileSync(join(process.cwd(), 'public', 'logo.png'));
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

export default function OpengraphImage() {
  const tagline = HERO_TAGLINES[Math.floor(Math.random() * HERO_TAGLINES.length)];
  const logoDataUri = getLogoDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F5F1E8',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoDataUri} width={150} height={150} alt="" style={{ marginBottom: 40 }} />
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: '#141414',
            textAlign: 'center',
            padding: '0 80px',
            lineHeight: 1.1,
            textTransform: 'uppercase',
            letterSpacing: -1,
          }}
        >
          {tagline}
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 26,
            color: '#5C5C58',
            letterSpacing: 4,
            textTransform: 'uppercase',
          }}
        >
          NPC Outfitters
        </div>
      </div>
    ),
    { ...size }
  );
}
