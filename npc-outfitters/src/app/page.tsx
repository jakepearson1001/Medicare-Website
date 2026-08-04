import Link from 'next/link';
import type { Metadata } from 'next';
import HeroTagline from '@/components/HeroTagline';
import DialogueBox from '@/components/DialogueBox';
import Ticker from '@/components/Ticker';
import ProductCard from '@/components/ProductCard';
import NewsletterForm from '@/components/NewsletterForm';
import { GameLinkButton } from '@/components/GameButton';
import { DIALOGUE_LINES } from '@/lib/copy/dialogue-lines';
import { getFeaturedProducts } from '@/lib/products';
import { PRODUCT_CLASS_LABELS } from '@/lib/products';

export const metadata: Metadata = {
  title: 'NPC Outfitters — Default Skins for Real Life',
  description:
    'Everyone dresses like a background character. So we made the uniform. Free shipping on orders over $50, allegedly. (Actually yes.)',
};

const CLASSES: { productClass: keyof typeof PRODUCT_CLASS_LABELS; blurb: string }[] = [
  { productClass: 'default', blurb: 'Gray. Basic. Load-bearing.' },
  { productClass: 'ironic', blurb: 'Wear the joke. Become the joke.' },
  { productClass: 'meta', blurb: 'The supply chain, as a graphic tee.' },
  { productClass: 'rare-drops', blurb: 'Restocks when the algorithm feels like it.' },
];

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <div>
      <section className="scanlines relative overflow-hidden border-b-2 border-ink px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-npcgray-dark">
            NPC Outfitters — Est. 2024
          </p>
          <HeroTagline />
          <p className="mx-auto mt-6 max-w-xl font-mono text-sm text-npcgray-dark sm:text-base">
            We sell default skins for real life. Everyone already dresses like
            a background character. We just made it official merchandise.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <GameLinkButton href="/shop">Enter the Shop</GameLinkButton>
            <GameLinkButton href="/lore" variant="secondary">
              Read the Lore
            </GameLinkButton>
          </div>
        </div>
      </section>

      <section className="border-b-2 border-ink px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-2xl">
          <DialogueBox lines={DIALOGUE_LINES} speaker="Shopkeeper NPC" />
        </div>
      </section>

      <Ticker />

      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display text-2xl uppercase sm:text-3xl">Starter Gear</h2>
            <Link href="/shop" className="cursor-select font-mono text-sm uppercase">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y-2 border-ink bg-ink px-4 py-12 text-cream sm:py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-8 font-display text-2xl uppercase sm:text-3xl">Choose Your Class</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CLASSES.map((c) => (
              <Link
                key={c.productClass}
                href={`/shop?class=${c.productClass}`}
                className="cursor-select group border-2 border-cream p-5 transition-colors hover:bg-cream hover:text-ink"
              >
                <h3 className="font-display text-lg uppercase">
                  {PRODUCT_CLASS_LABELS[c.productClass]}
                </h3>
                <p className="mt-2 font-mono text-xs text-npcgray-light group-hover:text-npcgray-dark">
                  {c.blurb}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-md border-2 border-ink bg-ink p-6 text-cream sm:p-8">
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
