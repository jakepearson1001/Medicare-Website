import { PRODUCTS } from '../products';
import type { CartLine, CommerceProvider, Product } from './types';

/**
 * Local, in-memory commerce provider. Reads everything from
 * `src/lib/products.ts`. No network calls, no payment processor — this is
 * what powers the site out of the box.
 *
 * `createCheckout` always returns `{ url: null }`, which the cart UI
 * interprets as "no live payment processor connected" and shows the
 * in-voice "checkout not yet implemented in this build of reality" dialogue
 * instead of crashing. Wire up `PrintfulShopifyProvider` (or your own) in
 * `lib/commerce/index.ts` to go live.
 */
export class MockCommerceProvider implements CommerceProvider {
  async listProducts(): Promise<Product[]> {
    return PRODUCTS.filter((p) => !p.hidden);
  }

  async getProduct(slug: string): Promise<Product | undefined> {
    return PRODUCTS.find((p) => p.slug === slug);
  }

  async createCheckout(_lines: CartLine[]): Promise<{ url: string | null }> {
    return { url: null };
  }
}
