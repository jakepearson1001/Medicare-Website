'use client';

import { useEffect, useRef, useState } from 'react';
import type { Product } from '@/lib/commerce/types';
import { cn } from '@/lib/utils';

interface ProductImageProps {
  product: Product;
  className?: string;
}

/**
 * Renders a product render if one exists at /public/products/<slug>.jpg (or
 * .png/.webp), and falls back to an on-brand generated placeholder swatch
 * if it doesn't. To go live with real product photography, just drop a
 * file named `<slug>.jpg` (matching `Product.slug` in lib/products.ts) into
 * `public/products/` — no code changes needed. See README.md.
 */
export default function ProductImage({ product, className }: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const isMissingTexture = product.slug === 'missing-texture-hoodie';

  useEffect(() => {
    // The browser starts loading <img> as soon as it's parsed, which can
    // happen (and fail) before React hydrates and attaches onError below.
    // Catch that already-failed case here on mount.
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setFailed(true);
    }
  }, []);

  if (failed) {
    return (
      <div
        className={cn(
          'flex aspect-square w-full items-center justify-center border-2 border-ink',
          isMissingTexture ? 'missing-texture-pattern' : '',
          className
        )}
        style={isMissingTexture ? undefined : { backgroundColor: product.color }}
      >
        <span className="border-2 border-ink bg-cream px-3 py-1 text-center font-mono text-xs uppercase text-ink">
          render pending
          <br />
          {product.shortName}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={`/products/${product.slug}.jpg`}
      alt={product.name}
      className={cn('aspect-square w-full border-2 border-ink object-cover', className)}
      onError={() => setFailed(true)}
    />
  );
}
