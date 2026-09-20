import { randomUUID } from 'node:crypto';
import type { CartLine } from '../commerce/types';
import { getProductBySlug } from '../products';
import { isFulfillable, printfulConfigured } from '../fulfillment/printful';

/**
 * PRIMARY PAYMENT PATH: Square Checkout (hosted Payment Links).
 *
 * We send the buyer to a Square-hosted checkout page rather than collecting
 * card details ourselves, which keeps card data entirely out of this app
 * and out of PCI scope. Square collects the shipping address for us and
 * then redirects the buyer to /loot-acquired.
 *
 * Fulfillment is NOT triggered here. Square notifies us at
 * /api/webhooks/square once the payment actually completes, and that
 * handler is what places the Printful order — so a buyer who abandons the
 * page (or whose card declines) never generates a print job.
 *
 * Required env vars (see .env.example):
 *   SQUARE_ACCESS_TOKEN   server-side secret
 *   SQUARE_LOCATION_ID    which location orders post to
 *   SQUARE_ENV            "sandbox" (default) or "production"
 *   NEXT_PUBLIC_SITE_URL  used to build the post-payment redirect
 */

const SQUARE_API_VERSION = '2026-09-16';

// Matches the shipping promise in the site copy ("free over $50").
export const FREE_SHIPPING_THRESHOLD_CENTS = 5000;
export const FLAT_SHIPPING_CENTS = 595;

export function squareApiBase(): string {
  return process.env.SQUARE_ENV === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com';
}

export function squareConfigured(): boolean {
  return Boolean(process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_LOCATION_ID);
}

export function squareHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
    'Square-Version': SQUARE_API_VERSION,
    'Content-Type': 'application/json',
  };
}

export class UnfulfillableItemsError extends Error {
  constructor(public readonly items: string[]) {
    super(`No Printful variant mapped for: ${items.join(', ')}`);
    this.name = 'UnfulfillableItemsError';
  }
}

export async function createSquareCheckout(
  lines: CartLine[]
): Promise<{ url: string | null }> {
  if (!squareConfigured()) return { url: null };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  const lineItems: Record<string, unknown>[] = [];
  const unfulfillable: string[] = [];
  let subtotalCents = 0;

  for (const line of lines) {
    // Price and name come from our own catalog, never from the browser, so
    // a tampered cart payload can't change what the buyer is charged.
    const product = getProductBySlug(line.slug);
    if (!product) continue;

    const quantity = Math.max(1, Math.min(99, Math.floor(Number(line.quantity) || 1)));
    const variant = product.variants.find((v) => v.size === line.size);
    if (!variant || !variant.inStock) continue;

    // If auto-fulfillment is switched on, refuse to sell anything we can't
    // actually send to the printer — better a blocked checkout than a paid
    // order that silently never ships.
    if (printfulConfigured() && !isFulfillable(product.slug, line.size)) {
      unfulfillable.push(`${product.name} (${line.size})`);
      continue;
    }

    subtotalCents += Math.round(product.price * 100) * quantity;
    lineItems.push({
      name: `${product.name} — ${line.size}`,
      quantity: String(quantity),
      base_price_money: { amount: Math.round(product.price * 100), currency: 'USD' },
      // Both of these carry the cart identity through Square and back to
      // the webhook. `note` is a fallback in case metadata is dropped.
      note: `${product.slug}|${line.size}`.slice(0, 500),
      metadata: { slug: product.slug, size: line.size },
    });
  }

  if (unfulfillable.length > 0) throw new UnfulfillableItemsError(unfulfillable);
  if (lineItems.length === 0) return { url: null };

  if (subtotalCents < FREE_SHIPPING_THRESHOLD_CENTS) {
    lineItems.push({
      name: 'Shipping',
      quantity: '1',
      base_price_money: { amount: FLAT_SHIPPING_CENTS, currency: 'USD' },
      metadata: { shipping: 'true' },
    });
  }

  const res = await fetch(`${squareApiBase()}/v2/online-checkout/payment-links`, {
    method: 'POST',
    headers: squareHeaders(),
    body: JSON.stringify({
      idempotency_key: randomUUID(),
      order: {
        location_id: process.env.SQUARE_LOCATION_ID,
        line_items: lineItems,
      },
      checkout_options: {
        ask_for_shipping_address: true,
        redirect_url: `${siteUrl}/loot-acquired`,
        ...(process.env.SQUARE_SUPPORT_EMAIL
          ? { merchant_support_email: process.env.SQUARE_SUPPORT_EMAIL }
          : {}),
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Square createPaymentLink failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  return { url: data?.payment_link?.url ?? null };
}

/** Fetch a Square order so the webhook can read its items and address. */
export async function getSquareOrder(orderId: string): Promise<Record<string, unknown> | null> {
  if (!squareConfigured()) return null;

  const res = await fetch(`${squareApiBase()}/v2/orders/${orderId}`, {
    headers: squareHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Square getOrder failed (${res.status}): ${await res.text()}`);
  }
  const data = await res.json();
  return data?.order ?? null;
}
