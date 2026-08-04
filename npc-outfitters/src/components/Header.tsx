'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/cart/cart-store';

const NAV_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/lore', label: 'Lore' },
  { href: '/patch-notes', label: 'Patch Notes' },
  { href: '/respawn-point', label: 'Respawn Point' },
  { href: '/dialogue', label: 'Dialogue' },
];

export default function Header() {
  const lines = useCartStore((s) => s.lines);
  const openCart = useCartStore((s) => s.open);
  const count = lines.reduce((n, l) => n + l.quantity, 0);
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    function onBlink() {
      setBlink(true);
      setTimeout(() => setBlink(false), 1400);
    }
    window.addEventListener('npc:logo-blink', onBlink);
    return () => window.removeEventListener('npc:logo-blink', onBlink);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-cream">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span
            className={`relative block h-10 w-10 overflow-hidden rounded-full ${
              blink ? 'animate-blink' : ''
            }`}
          >
            <Image
              src="/logo.png"
              alt="NPC Outfitters"
              fill
              sizes="40px"
              className="object-cover scale-110"
              priority
            />
          </span>
          <span className="font-display text-lg uppercase tracking-tight sm:text-xl">
            NPC Outfitters
          </span>
        </Link>

        <nav className="hidden items-center gap-6 font-mono text-sm uppercase md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="cursor-select">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openCart}
            className="cursor-select relative border-2 border-ink px-3 py-2 font-mono text-sm uppercase hover:bg-ink hover:text-cream"
            aria-label="Open inventory"
          >
            Inventory
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-cream bg-errorred text-[11px] text-cream">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
      <nav className="flex items-center gap-4 overflow-x-auto border-t border-npcgray-light px-4 py-2 font-mono text-xs uppercase md:hidden">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="whitespace-nowrap">
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
