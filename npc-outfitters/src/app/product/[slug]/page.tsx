import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductImage from '@/components/ProductImage';
import StatBlock from '@/components/StatBlock';
import ProductPurchasePanel from '@/components/ProductPurchasePanel';
import ProductCard from '@/components/ProductCard';
import { getProductBySlug, getVisibleProducts, PRODUCT_CLASS_LABELS, PRODUCTS } from '@/lib/products';

export function generateStaticParams() {
  return PRODUCTS.filter((p) => !p.hidden).map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) return {};
  return {
    title: product.name,
    description: `${product.npcLine} ${formatPrice(product.price)}.`,
  };
}

function formatPrice(n: number) {
  return `$${n.toFixed(2)}`;
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product || product.hidden) notFound();

  const related = getVisibleProducts()
    .filter((p) => p.productClass === product.productClass && p.slug !== product.slug)
    .slice(0, 4);

  return (
    <div className="px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <p className="mb-6 font-mono text-xs uppercase tracking-widest text-npcgray-dark">
          {PRODUCT_CLASS_LABELS[product.productClass]}
        </p>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <ProductImage product={product} />
          </div>

          <div>
            <h1 className="font-display text-3xl uppercase leading-tight sm:text-4xl">
              {product.name}
            </h1>

            <p className="mt-4 font-mono text-sm leading-relaxed">{product.npcLine}</p>

            <div className="mt-6">
              <StatBlock
                stats={product.stats}
                durability={product.durability}
                classRequirement={product.classRequirement}
              />
            </div>

            <div className="mt-6 border-2 border-npcgray-light bg-cream p-4">
              <p className="mb-1 font-mono text-[11px] uppercase tracking-widest text-npcgray-dark">
                Honest Disclosure
              </p>
              <p className="font-mono text-sm leading-relaxed">{product.honestDisclosure}</p>
            </div>

            <div className="mt-8">
              <ProductPurchasePanel product={product} />
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 font-display text-xl uppercase sm:text-2xl">
              More From {PRODUCT_CLASS_LABELS[product.productClass]}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
