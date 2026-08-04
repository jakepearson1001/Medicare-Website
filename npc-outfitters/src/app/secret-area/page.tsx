import type { Metadata } from 'next';
import ProductImage from '@/components/ProductImage';
import ProductPurchasePanel from '@/components/ProductPurchasePanel';
import StatBlock from '@/components/StatBlock';
import { getProductBySlug } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Secret Area',
  description: 'You found it. This page does not exist. Please act accordingly.',
  robots: { index: false, follow: false },
};

export default function SecretAreaPage() {
  const product = getProductBySlug('missing-texture-hoodie')!;

  return (
    <div className="missing-texture-pattern px-4 py-14">
      <div className="mx-auto max-w-4xl border-4 border-ink bg-cream p-6 sm:p-10">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-errorred">
          Area Not Meant To Be Found
        </p>
        <h1 className="mb-4 font-display text-3xl uppercase sm:text-4xl">Secret Area</h1>
        <p className="mb-8 font-mono text-sm leading-relaxed sm:text-base">
          You either entered ↑↑↓↓←→←→BA on your keyboard, or you clicked a
          link that very clearly said &ldquo;do not click.&rdquo; Either way,
          congratulations. This is DLC. It was never supposed to ship. It is
          shipping anyway.
        </p>

        <div className="mb-10 inline-block border-2 border-ink bg-ink px-5 py-3 font-mono text-cream">
          DLC UNLOCKED — CODE: <strong>DLC10</strong> — 10% off, no rules, no expiration we&rsquo;re aware of.
        </div>

        <div className="grid gap-8 border-t-2 border-ink pt-8 lg:grid-cols-2 lg:gap-12">
          <ProductImage product={product} />
          <div>
            <h2 className="font-display text-2xl uppercase leading-tight">{product.name}</h2>
            <p className="mt-3 font-mono text-sm leading-relaxed">{product.npcLine}</p>
            <div className="mt-5">
              <StatBlock
                stats={product.stats}
                durability={product.durability}
                classRequirement={product.classRequirement}
              />
            </div>
            <div className="mt-5 border-2 border-npcgray-light bg-cream p-4">
              <p className="mb-1 font-mono text-[11px] uppercase tracking-widest text-npcgray-dark">
                Honest Disclosure
              </p>
              <p className="font-mono text-sm leading-relaxed">{product.honestDisclosure}</p>
            </div>
            <div className="mt-6">
              <ProductPurchasePanel product={product} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
