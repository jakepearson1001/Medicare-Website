'use client';

import { useEffect, useState } from 'react';
import { MICROCOPY } from '@/lib/copy/microcopy';

const MESSAGES = [
  MICROCOPY.freeShipping,
  'Use code NPC10 for 10% off. My programming allowed it this one time.',
  'This bar contains an announcement.',
  'Restocks when the algorithm feels like it.',
  'You are reading the announcement bar. Nothing else is happening.',
];

export default function AnnouncementBar() {
  const [order, setOrder] = useState<number[]>([0, 1, 2, 3, 4]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const shuffled = [...MESSAGES.keys()].sort(() => Math.random() - 0.5);
    setOrder(shuffled);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((a) => (a + 1) % order.length);
    }, 4200);
    return () => clearInterval(id);
  }, [order.length]);

  return (
    <div className="bg-ink text-cream text-center text-xs sm:text-sm font-mono py-1.5 px-4 overflow-hidden">
      <span aria-live="polite">{MESSAGES[order[active] ?? 0]}</span>
    </div>
  );
}
