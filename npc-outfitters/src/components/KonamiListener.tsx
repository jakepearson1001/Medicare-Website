'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

/**
 * Listens for the Konami code anywhere on the site. On success: full-screen
 * glitch flash, then redirect to /secret-area (which also unlocks the DLC10
 * discount code — see app/secret-area/page.tsx).
 */
export default function KonamiListener() {
  const [progress, setProgress] = useState(0);
  const [glitching, setGlitching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const expected = CODE[progress];
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === expected) {
        const next = progress + 1;
        if (next === CODE.length) {
          setProgress(0);
          triggerUnlock();
        } else {
          setProgress(next);
        }
      } else {
        setProgress(key === CODE[0] ? 1 : 0);
      }
    }

    function triggerUnlock() {
      window.sessionStorage.setItem('npc-dlc-unlocked', '1');
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        router.push('/secret-area');
        return;
      }
      setGlitching(true);
      setTimeout(() => {
        setGlitching(false);
        router.push('/secret-area');
      }, 650);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [progress, router]);

  if (!glitching) return null;

  return (
    <div
      className="fixed inset-0 z-[100] animate-glitch bg-ink mix-blend-difference"
      aria-hidden="true"
    />
  );
}
