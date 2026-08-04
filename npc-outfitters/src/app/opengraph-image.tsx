import { ImageResponse } from 'next/og';
import { HERO_TAGLINES } from '@/lib/copy/taglines';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const alt = 'NPC Outfitters — Default Skins for Real Life';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  const tagline = HERO_TAGLINES[Math.floor(Math.random() * HERO_TAGLINES.length)];

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
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: '50%',
            backgroundColor: '#141414',
            border: '6px solid #141414',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              backgroundColor: '#9A9A9A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 34,
              fontWeight: 900,
              color: '#141414',
              letterSpacing: -1,
            }}
          >
            NPC
          </div>
        </div>
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
