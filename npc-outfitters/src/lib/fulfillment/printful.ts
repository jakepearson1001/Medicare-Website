import type { CartLine } from '../commerce/types';

/**
 * PRIMARY FULFILLMENT PATH: Printful.
 *
 * NPC Outfitters is set up to take payment via Square (lib/payments/square.ts)
 * and, on successful payment, push the order straight to Printful so it
 * gets printed and shipped without you touching it. This module is a
 * clearly-marked stub — nothing here runs until you fill in the TODOs.
 *
 * How the pieces fit together:
 * 1. Customer pays via Square Checkout (lib/payments/square.ts).
 * 2. Square's success webhook/redirect hits a server route in this app.
 * 3. That route calls `createPrintfulOrder` below with the cart lines +
 *    shipping address from the Square order.
 * 4. Printful receives the order, prints/packs/ships it, and updates
 *    tracking — Printful is the actual "print + fulfillment" partner, so
 *    once this call succeeds you don't do anything else manually.
 *
 * TODO to go live:
 * 1. Create a Printful account and a Printful Store (Printful dashboard →
 *    Stores → "add store" → choose "API" as the platform for a custom
 *    storefront like this one).
 * 2. Generate a Printful API key (Printful dashboard → Settings → API) and
 *    set it as PRINTFUL_API_KEY (see .env.example).
 * 3. In Printful, create/sync the products from this site (Gray Hoodie,
 *    Base Layer tee, etc.) as Printful "sync products" so each of our
 *    `Product.slug` values maps to a real Printful `sync_variant_id` per
 *    size. Store that mapping (e.g. a `printfulVariantId` field added to
 *    `Product`/`ProductVariant` in lib/commerce/types.ts and lib/products.ts).
 * 4. Implement `createPrintfulOrder` using the Printful API
 *    (`POST https://api.printful.com/orders`) with the recipient address
 *    and an array of `{ sync_variant_id, quantity }` line items.
 * 5. Optionally set `confirm: true` in the request to skip Printful's draft
 *    order review step and auto-submit to production immediately.
 * 6. Handle Printful webhooks (order shipped, package returned, etc.) at a
 *    new route, e.g. app/api/webhooks/printful/route.ts, to keep customers
 *    updated on tracking.
 *
 * Docs: https://developers.printful.com/docs/
 */
export interface ShippingAddress {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  stateCode: string;
  countryCode: string;
  zip: string;
  email: string;
}

export async function createPrintfulOrder(
  _lines: CartLine[],
  _shippingAddress: ShippingAddress
): Promise<{ printfulOrderId: string | null }> {
  const apiKey = process.env.PRINTFUL_API_KEY;

  if (!apiKey) {
    return { printfulOrderId: null };
  }

  // TODO: replace with a real Printful `POST /orders` call once product
  // variants are synced and mapped (see step 3 above).
  throw new Error('createPrintfulOrder is not implemented yet. See lib/fulfillment/printful.ts.');
}
