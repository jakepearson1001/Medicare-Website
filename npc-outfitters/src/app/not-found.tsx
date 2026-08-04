'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { NOT_FOUND_LINES } from '@/lib/copy/not-found-lines';

export default function NotFound() {
  const [line, setLine] = useState(NOT_FOUND_LINES[0]);

  useEffect(() => {
    setLine(NOT_FOUND_LINES[Math.floor(Math.random() * NOT_FOUND_LINES.length)]);
  }, []);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg border-2 border-ink bg-cream text-center">
        <div className="border-b-2 border-ink bg-ink px-3 py-1.5 font-mono text-cream">
          ERROR 404
        </div>
        <div className="p-8">
          <p className="mb-2 font-display text-4xl">404</p>
          <p className="mb-6 font-mono text-sm leading-relaxed sm:text-base">{line}</p>
          <Link
            href="/"
            className="cursor-select inline-block border-2 border-ink bg-ink px-5 py-3 font-mono text-sm uppercase text-cream"
          >
            Return to Spawn
          </Link>
        </div>
      </div>
    </div>
  );
}
