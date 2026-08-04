'use client';

import { useEffect, useState } from 'react';

const RARE_CHANCE = 1 / 50;

/**
 * Rolls dice once per page load. On a 1-in-50 hit, fires one of three rare
 * cosmetic events — meant to feel like finding a shiny Pokémon, not like a
 * feature. Respects prefers-reduced-motion by skipping the visual ones.
 *
 * - "logo-blink": dispatches `npc:logo-blink`, which <Header /> listens for
 *   to briefly animate the badge logo.
 * - "cursor-face": temporarily swaps the cursor for the NPC logo.
 * - "secret-line": shows a small corner dialogue that says the quiet part.
 */
export default function RareEventRoller() {
  const [secretLine, setSecretLine] = useState(false);

  useEffect(() => {
    if (Math.random() >= RARE_CHANCE) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const roll = Math.floor(Math.random() * 3);

    if (roll === 0) {
      window.dispatchEvent(new CustomEvent('npc:logo-blink'));
    } else if (roll === 1 && !reduceMotion) {
      const prevCursor = document.body.style.cursor;
      document.body.style.cursor = "url('/logo.png') 16 16, auto";
      const id = setTimeout(() => {
        document.body.style.cursor = prevCursor;
      }, 4000);
      return () => clearTimeout(id);
    } else {
      setSecretLine(true);
      const id = setTimeout(() => setSecretLine(false), 5000);
      return () => clearTimeout(id);
    }
  }, []);

  if (!secretLine) return null;

  return (
    <div
      className="fixed bottom-4 left-4 z-[90] max-w-xs border-2 border-ink bg-cream px-3 py-2 font-mono text-xs shadow-lg animate-[fadeIn_0.2s_ease]"
      role="status"
    >
      You weren’t supposed to see this.
    </div>
  );
}
