'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart/cart-store';
import { getProductBySlug } from '@/lib/products';
import { formatPrice, cn } from '@/lib/utils';
import { MICROCOPY } from '@/lib/copy/microcopy';
import { GameButton } from './GameButton';

export default function InventoryDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.close);
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeLine = useCartStore((s) => s.removeLine);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  const items = lines
    .map((line) => ({ line, product: getProductBySlug(line.slug) }))
    .filter((x) => x.product);

  const subtotal = items.reduce(
    (sum, { line, product }) => sum + (product?.price ?? 0) * line.quantity,
    0
  );

  async function handleCheckout() {
    setCheckingOut(true);
    setCheckoutMessage(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      // An item with no Printful variant mapped can't actually ship, so
      // checkout blocks it and says which one rather than taking the money.
      setCheckoutMessage(data.message ?? MICROCOPY.checkoutNotWired);
    } catch {
      setCheckoutMessage(MICROCOPY.checkoutNotWired);
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-50 bg-ink/50 transition-opacity',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={close}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l-2 border-ink bg-cream transition-transform',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-label="Inventory"
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b-2 border-ink px-4 py-3">
          <h2 className="font-display text-lg uppercase">{MICROCOPY.cartTitle}</h2>
          <button
            type="button"
            onClick={close}
            className="cursor-select font-mono text-sm uppercase"
            aria-label="Close inventory"
          >
            close [x]
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="font-mono text-sm">{MICROCOPY.emptyCart}</p>
              <Link href="/shop" onClick={close} className="cursor-select font-mono text-sm underline">
                {MICROCOPY.emptyCartCta}
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3">
              {items.map(({ line, product }) => (
                <li
                  key={`${line.slug}-${line.size}`}
                  className="border-2 border-ink bg-cream p-2"
                >
                  <div
                    className="mb-2 flex aspect-square items-center justify-center border border-npcgray text-center font-mono text-[10px] uppercase"
                    style={{ backgroundColor: product?.color }}
                  >
                    {product?.shortName}
                  </div>
                  <p className="truncate font-mono text-xs">{product?.name}</p>
                  <p className="font-mono text-[11px] text-npcgray-dark">
                    Size: {line.size}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center border border-ink font-mono text-xs">
                      <button
                        type="button"
                        className="px-2 py-1"
                        onClick={() => setQuantity(line.slug, line.size, line.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-2">{line.quantity}</span>
                      <button
                        type="button"
                        className="px-2 py-1"
                        onClick={() => setQuantity(line.slug, line.size, line.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLine(line.slug, line.size)}
                      className="font-mono text-[11px] text-errorred underline"
                    >
                      remove
                    </button>
                  </div>
                  <p className="mt-1 text-right font-mono text-xs">
                    {formatPrice((product?.price ?? 0) * line.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t-2 border-ink p-4">
            {checkoutMessage && (
              <div className="mb-3 border-2 border-ink bg-ink p-3 font-mono text-xs text-cream">
                <p>{checkoutMessage}</p>
                <p className="mt-1 text-npcgray-light">{MICROCOPY.checkoutNotWiredSub}</p>
              </div>
            )}
            <div className="mb-3 flex justify-between font-mono text-sm">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <GameButton
              fullWidth
              onClick={handleCheckout}
              disabled={checkingOut}
            >
              {checkingOut ? 'Loading...' : MICROCOPY.checkout}
            </GameButton>
          </div>
        )}
      </aside>
    </>
  );
}
