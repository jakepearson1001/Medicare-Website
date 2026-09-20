'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart/cart-store';

const RARITIES = [
  { label: 'COMMON', color: '#5C5C58', line: 'A perfectly ordinary transaction. Nothing happened. Something shipped.' },
  { label: 'RARE', color: '#2F6FB2', line: 'An above-average haul. The algorithm noticed. It will not say so.' },
  { label: 'LEGENDARY', color: '#E4322E', line: 'Considerable loot. You have been added to a list. A good list. Probably.' },
];

export default function LootAcquiredPage() {
  const clear = useCartStore((s) => s.clear);
  const [rarity, setRarity] = useState(RARITIES[0]);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // Rarity is based on what was in the inventory before we empty it.
    const lines = useCartStore.getState().lines;
    const units = lines.reduce((n, l) => n + l.quantity, 0);
    setRarity(units >= 4 ? RARITIES[2] : units >= 2 ? RARITIES[1] : RARITIES[0]);

    // Payment is done and Square has the order — the local cart is now stale.
    clear();

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setRevealed(true);
      return;
    }
    const id = setTimeout(() => setRevealed(true), 450);
    return () => clearTimeout(id);
  }, [clear]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg border-2 border-ink bg-cream text-center">
        <div className="border-b-2 border-ink bg-ink px-3 py-1.5 text-left font-mono text-cream">
          [ transaction complete ]
        </div>

        <div className="p-8">
          <h1 className="font-display text-4xl uppercase leading-none sm:text-5xl">
            Loot Acquired
          </h1>

          <div
            className={`mx-auto mt-6 inline-block border-2 border-ink px-4 py-1.5 font-mono text-sm uppercase tracking-widest text-cream transition-all duration-500 ${
              revealed ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
            }`}
            style={{ backgroundColor: rarity.color }}
          >
            {rarity.label}
          </div>

          <p className="mt-6 font-mono text-sm leading-relaxed">{rarity.line}</p>

          <div className="mt-6 border-2 border-npcgray-light p-4 text-left font-mono text-xs leading-relaxed">
            <p className="mb-1 uppercase tracking-widest text-npcgray-dark">What happens now</p>
            <p>
              Your order went to the printer automatically. You&rsquo;ll get a
              confirmation email from Square, then a second one with tracking
              once it ships. Processing takes 1&ndash;3 business days.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href="/shop"
              className="cursor-select border-2 border-ink bg-ink px-5 py-3 font-display text-sm uppercase text-cream"
            >
              Acquire More Loot
            </Link>
            <Link
              href="/respawn-point"
              className="cursor-select border-2 border-ink px-5 py-3 font-display text-sm uppercase"
            >
              Respawn Point
            </Link>
          </div>

          <p className="mt-6 font-mono text-[11px] text-npcgray-dark">
            Screenshot this. Show someone. That is the entire marketing plan.
          </p>
        </div>
      </div>
    </div>
  );
}
