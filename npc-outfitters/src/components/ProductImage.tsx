'use client';

import { useEffect, useRef, useState } from 'react';
import type { Product } from '@/lib/commerce/types';
import { cn } from '@/lib/utils';

interface ProductImageProps {
  product: Product;
  className?: string;
}

// Tried in order. Printful's mockup downloads are usually .png, phone photos
// are .jpg, so accept whichever you happen to drop in.
const EXTENSIONS = ['jpg', 'png', 'jpeg', 'webp'];

/**
 * Renders a product image if one exists at /public/products/<slug>.<ext>,
 * and falls back to an on-brand generated placeholder swatch if it doesn't.
 *
 * To use real product renders, just drop a file named after the product's
 * `slug` (see lib/products.ts) into `public/products/` — any of the
 * extensions above works, and no code change is needed. See README.md.
 */
export default function ProductImage({ product, className }: ProductImageProps) {
  const [extIndex, setExtIndex] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const isMissingTexture = product.slug === 'missing-texture-hoodie';
  const exhausted = extIndex >= EXTENSIONS.length;

  useEffect(() => {
    // The browser starts loading <img> as soon as it's parsed, which can
    // happen (and fail) before React hydrates and attaches onError below.
    // Catch that already-failed case here on mount.
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setExtIndex((i) => i + 1);
    }
  }, [extIndex]);

  if (exhausted) {
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
      // Remount on each attempt so a failed src doesn't stick.
      key={EXTENSIONS[extIndex]}
      ref={imgRef}
      src={`/products/${product.slug}.${EXTENSIONS[extIndex]}`}
      alt={product.name}
      className={cn('aspect-square w-full border-2 border-ink object-cover', className)}
      onError={() => setExtIndex((i) => i + 1)}
    />
  );
}
