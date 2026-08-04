import { PRODUCTS } from '../products';
import type { CartLine, CommerceProvider, Product } from './types';

/**
 * OPTIONAL Shopify Storefront API provider.
 *
 * NPC Outfitters' primary payment/fulfillment path is Square (checkout) +
 * Printful (order routing/fulfillment) — see lib/payments/square.ts and
 * lib/fulfillment/printful.ts. This provider is here in case you'd rather
 * run commerce through Shopify instead (Shopify + a dropship app like
 * Printful/Zendrop/AutoDS acting as the fulfillment backend for Shopify).
 * It is NOT wired up by default — lib/commerce/index.ts exports the mock
 * provider until you switch it.
 *
 * TODO to go live with Shopify:
 * 1. Create a Shopify Storefront API access token:
 *    Shopify Admin → Settings → Apps and sales channels → Develop apps →
 *    create an app → Configure Storefront API scopes → Install → copy the
 *    "Storefront API access token".
 * 2. Set env vars (see .env.example):
 *      SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
 *      SHOPIFY_STOREFRONT_ACCESS_TOKEN=shpat_xxx (public storefront token)
 * 3. Implement the three methods below using the Storefront GraphQL API:
 *      - listProducts(): query `products(first: 50) { ... }`
 *      - getProduct(slug): query `productByHandle(handle: $slug) { ... }`
 *      - createCheckout(lines): mutation `cartCreate` (2024+ API) or
 *        `checkoutCreate` (older API versions), then return `cart.checkoutUrl`.
 * 4. Map the Shopify product/variant shape into this app's `Product` type
 *    (see lib/commerce/types.ts) — keep `npcLine` / `honestDisclosure` /
 *    `stats` as Shopify metafields so merchandisers can edit copy without a
 *    redeploy.
 * 5. Swap the export in lib/commerce/index.ts from MockCommerceProvider to
 *    ShopifyCommerceProvider.
 */
export class ShopifyCommerceProvider implements CommerceProvider {
  private readonly domain = process.env.SHOPIFY_STORE_DOMAIN;
  private readonly token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  async listProducts(): Promise<Product[]> {
    if (!this.domain || !this.token) {
      // eslint-disable-next-line no-console
      console.warn(
        '[ShopifyCommerceProvider] Missing SHOPIFY_STORE_DOMAIN / SHOPIFY_STOREFRONT_ACCESS_TOKEN — falling back to mock product data.'
      );
      return PRODUCTS.filter((p) => !p.hidden);
    }

    // TODO: replace with a real Storefront API `products` query.
    throw new Error('ShopifyCommerceProvider.listProducts is not implemented yet.');
  }

  async getProduct(slug: string): Promise<Product | undefined> {
    if (!this.domain || !this.token) {
      return PRODUCTS.find((p) => p.slug === slug);
    }

    // TODO: replace with a real Storefront API `productByHandle` query.
    throw new Error('ShopifyCommerceProvider.getProduct is not implemented yet.');
  }

  async createCheckout(_lines: CartLine[]): Promise<{ url: string | null }> {
    if (!this.domain || !this.token) {
      return { url: null };
    }

    // TODO: replace with a real Storefront API `cartCreate` mutation and
    // return `cart.checkoutUrl`.
    throw new Error('ShopifyCommerceProvider.createCheckout is not implemented yet.');
  }
}
