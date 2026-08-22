'use client';

import { useEffect, useRef, useState } from 'react';

// Generic, brand-original characters — not likenesses of real people or
// trademarked mascots, on purpose, since this cat lives on a commercial
// storefront. Same absurd energy, none of the legal exposure.
const DROPS: { emoji: string; label: string }[] = [
  { emoji: '🍔', label: 'Walking Hamburger. It has legs. It should not.' },
  { emoji: '🦍', label: 'Large Ape. Bench press: unconfirmed. Respect it anyway.' },
  { emoji: '🐊', label: 'Crocodile, Sunglasses. Vibe: immaculate.' },
  { emoji: '🟣', label: 'Purple Blob. Legally distinct from everything.' },
  { emoji: '🦔', label: 'Low-Poly Creature. Does not know the way. Nobody does.' },
  { emoji: '🕴️', label: 'Very Important Man. Executive order: do not pet the cat.' },
];

const MAD_LINES = [
  'The cat has revoked consent.',
  'Paw. Swipe. Consequence.',
  'You have been scratched, metaphorically and possibly literally.',
  'The cat remembers this.',
];

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function WalkingCat() {
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ x: 40, y: 0 });
  const [facingLeft, setFacingLeft] = useState(false);
  const [bubble, setBubble] = useState<{ emoji: string; label: string } | null>(null);
  const [intro, setIntro] = useState(true);
  const [mad, setMad] = useState(false);
  const [swipe, setSwipe] = useState(false);

  const clickCount = useRef(0);
  const dropPool = useRef<{ emoji: string; label: string }[]>(shuffled(DROPS));
  const paused = useRef(false);
  const reduceMotion = useRef(false);

  useEffect(() => {
    reduceMotion.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Keep enough side margin that the speech bubble (centered on the cat,
    // up to ~220px wide) never clips off the edge of the viewport.
    const EDGE_MARGIN = 130;

    setPos({ x: EDGE_MARGIN, y: window.innerHeight - 140 });
    setMounted(true);

    const introTimer = setTimeout(() => setIntro(false), 3200);

    if (reduceMotion.current) {
      return () => clearTimeout(introTimer);
    }

    function wander() {
      if (paused.current) return;
      const minX = EDGE_MARGIN;
      const maxX = Math.max(minX, window.innerWidth - EDGE_MARGIN);
      const maxY = window.innerHeight - 160;
      setPos((prev) => {
        const nextX = Math.max(minX, Math.min(maxX, Math.random() * maxX));
        const nextY = Math.max(80, Math.min(maxY, prev.y + (Math.random() - 0.5) * 200));
        setFacingLeft(nextX < prev.x);
        return { x: nextX, y: nextY };
      });
    }

    const id = setInterval(wander, 5000);
    return () => {
      clearInterval(id);
      clearTimeout(introTimer);
    };
  }, []);

  function handleClick() {
    clickCount.current += 1;
    paused.current = true;

    if (clickCount.current <= DROPS.length) {
      if (dropPool.current.length === 0) dropPool.current = shuffled(DROPS);
      const next = dropPool.current.pop()!;
      setBubble(next);
      setMad(false);
      setTimeout(() => {
        setBubble(null);
        paused.current = false;
      }, 2400);
    } else {
      setMad(true);
      setSwipe(true);
      setBubble({ emoji: '🐾💥', label: MAD_LINES[Math.floor(Math.random() * MAD_LINES.length)] });
      setTimeout(() => setSwipe(false), 400);
      setTimeout(() => {
        setBubble(null);
        paused.current = false;
      }, 2400);
    }
  }

  if (!mounted) return null;

  return (
    <div
      className="fixed z-40 select-none transition-all duration-[3000ms] ease-in-out"
      style={{ left: pos.x, top: pos.y }}
      aria-hidden="true"
    >
      {intro && !bubble && (
        <div className="absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap border-2 border-ink bg-cream px-2 py-1 font-mono text-[11px] uppercase shadow-md">
          Do not pet the cat.
        </div>
      )}

      {bubble && (
        <div className="absolute -top-16 left-1/2 w-max max-w-[220px] -translate-x-1/2 border-2 border-ink bg-cream px-2 py-1.5 text-center font-mono text-[11px] shadow-md">
          <span className="mr-1 text-base">{bubble.emoji}</span>
          {bubble.label}
        </div>
      )}

      <button
        type="button"
        onClick={handleClick}
        aria-label="A cat. Do not pet it. You may click it."
        className={`block text-4xl leading-none transition-transform ${
          facingLeft ? '-scale-x-100' : ''
        } ${swipe ? 'animate-glitch' : ''}`}
      >
        {mad ? '😾' : '🐈'}
      </button>
    </div>
  );
}
