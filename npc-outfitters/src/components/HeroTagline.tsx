'use client';

import { useEffect, useState } from 'react';
import { HERO_TAGLINES } from '@/lib/copy/taglines';

export default function HeroTagline() {
  const [tagline, setTagline] = useState(HERO_TAGLINES[0]);

  useEffect(() => {
    setTagline(HERO_TAGLINES[Math.floor(Math.random() * HERO_TAGLINES.length)]);
  }, []);

  return (
    <h1 className="font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
      {tagline}
    </h1>
  );
}
