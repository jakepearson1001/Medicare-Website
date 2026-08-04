import type { Metadata } from 'next';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { getVisibleProducts, PRODUCT_CLASS_LABELS } from '@/lib/products';
import type { ProductClass } from '@/lib/commerce/types';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Every class of default skin we currently have in stock. Allegedly in stock.',
};

const CLASS_ORDER: ProductClass[] = ['default', 'ironic', 'meta', 'rare-drops'];

export default function ShopPage({
  searchParams,
}: {
  searchParams: { class?: string };
}) {
  const products = getVisibleProducts();
  const activeClass = searchParams.class;
  const filtered = activeClass
    ? products.filter((p) => p.productClass === activeClass)
    : products;

  return (
    <div className="px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-widest text-npcgray-dark">
            Select Dialogue Option: Filter by Class
          </p>
          <h1 className="font-display text-3xl uppercase sm:text-4xl">Shop</h1>
        </div>

        <nav className="mb-10 flex flex-wrap gap-2 border-2 border-ink bg-cream p-2 font-mono text-xs uppercase sm:text-sm">
          <Link
            href="/shop"
            className={cn(
              'cursor-select border-2 px-3 py-2',
              !activeClass ? 'border-ink bg-ink text-cream' : 'border-transparent'
            )}
          >
            All Classes
          </Link>
          {CLASS_ORDER.map((c) => (
            <Link
              key={c}
              href={`/shop?class=${c}`}
              className={cn(
                'cursor-select border-2 px-3 py-2',
                activeClass === c ? 'border-ink bg-ink text-cream' : 'border-transparent'
              )}
            >
              {PRODUCT_CLASS_LABELS[c]}
            </Link>
          ))}
        </nav>

        {filtered.length === 0 ? (
          <p className="font-mono text-sm">
            No items in this class. Restocks when the algorithm feels like it.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
