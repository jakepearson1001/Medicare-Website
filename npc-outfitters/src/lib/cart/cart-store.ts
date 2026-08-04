'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartLine } from '../commerce/types';

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  addLine: (slug: string, size: string, quantity?: number) => void;
  removeLine: (slug: string, size: string) => void;
  setQuantity: (slug: string, size: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      addLine: (slug, size, quantity = 1) =>
        set((s) => {
          const existing = s.lines.find((l) => l.slug === slug && l.size === size);
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                l.slug === slug && l.size === size
                  ? { ...l, quantity: l.quantity + quantity }
                  : l
              ),
              isOpen: true,
            };
          }
          return { lines: [...s.lines, { slug, size, quantity }], isOpen: true };
        }),
      removeLine: (slug, size) =>
        set((s) => ({
          lines: s.lines.filter((l) => !(l.slug === slug && l.size === size)),
        })),
      setQuantity: (slug, size, quantity) =>
        set((s) => ({
          lines:
            quantity <= 0
              ? s.lines.filter((l) => !(l.slug === slug && l.size === size))
              : s.lines.map((l) =>
                  l.slug === slug && l.size === size ? { ...l, quantity } : l
                ),
        })),
      clear: () => set({ lines: [] }),
    }),
    { name: 'npc-outfitters-inventory' }
  )
);
