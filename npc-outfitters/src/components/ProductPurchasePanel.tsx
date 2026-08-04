'use client';

import { useState } from 'react';
import type { Product } from '@/lib/commerce/types';
import { useCartStore } from '@/lib/cart/cart-store';
import { formatPrice } from '@/lib/utils';
import { MICROCOPY } from '@/lib/copy/microcopy';
import { GameButton } from './GameButton';

export default function ProductPurchasePanel({ product }: { product: Product }) {
  const [size, setSize] = useState(product.variants[0]?.size ?? '');
  const [added, setAdded] = useState(false);
  const addLine = useCartStore((s) => s.addLine);

  function handleAdd() {
    addLine(product.slug, size, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div>
      <div className="mb-4 flex items-baseline gap-3">
        <span className="font-mono text-xl">{formatPrice(product.price)}</span>
        {product.compareAtPrice && (
          <span className="font-mono text-sm text-npcgray-dark line-through">
            {formatPrice(product.compareAtPrice)}
          </span>
        )}
      </div>

      <div className="mb-6">
        <h3 className="mb-2 font-display text-sm uppercase tracking-wide">
          Character Customization
        </h3>
        <div className="flex flex-wrap gap-2">
          {product.variants.map((v) => (
            <button
              key={v.size}
              type="button"
              disabled={!v.inStock}
              onClick={() => setSize(v.size)}
              className={`cursor-select border-2 px-3 py-2 font-mono text-sm ${
                size === v.size ? 'border-ink bg-ink text-cream' : 'border-ink bg-cream text-ink'
              } disabled:cursor-not-allowed disabled:opacity-30`}
            >
              {v.size}
            </button>
          ))}
        </div>
      </div>

      <GameButton fullWidth onClick={handleAdd} className="mb-3">
        {added ? 'Added to Inventory ✓' : MICROCOPY.addToCart}
      </GameButton>
      <GameButton fullWidth variant="secondary" onClick={handleAdd}>
        {MICROCOPY.buyNow}
      </GameButton>

      {/* Sticky mobile add-to-inventory bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-ink bg-cream p-3 sm:hidden">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm">{formatPrice(product.price)}</span>
          <GameButton fullWidth onClick={handleAdd}>
            {added ? 'Added ✓' : MICROCOPY.addToCart}
          </GameButton>
        </div>
      </div>
      <div className="h-16 sm:hidden" aria-hidden="true" />
    </div>
  );
}
