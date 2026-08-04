import Link from 'next/link';
import type { Product } from '@/lib/commerce/types';
import { formatPrice } from '@/lib/utils';
import { PRODUCT_CLASS_LABELS } from '@/lib/products';
import ProductImage from './ProductImage';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block border-2 border-ink bg-cream"
    >
      <div className="relative overflow-hidden">
        <ProductImage product={product} className="transition-transform group-hover:scale-[1.03]" />
        {product.rarity !== 'common' && (
          <span className="absolute left-2 top-2 border-2 border-ink bg-cream px-2 py-0.5 font-mono text-[11px] uppercase">
            {product.rarity}
          </span>
        )}
        {product.compareAtPrice && (
          <span className="absolute right-2 top-2 border-2 border-ink bg-errorred px-2 py-0.5 font-mono text-[11px] uppercase text-cream">
            Sale
          </span>
        )}
      </div>
      <div className="border-t-2 border-ink p-4">
        <p className="font-mono text-[11px] uppercase text-npcgray-dark">
          {PRODUCT_CLASS_LABELS[product.productClass]}
        </p>
        <h3 className="font-display text-base uppercase leading-tight sm:text-lg">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center gap-2 font-mono text-sm">
          <span>{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-npcgray-dark line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
