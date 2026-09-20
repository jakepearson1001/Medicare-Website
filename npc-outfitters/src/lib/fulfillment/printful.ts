import type { CartLine } from '../commerce/types';
import { getProductBySlug } from '../products';

/**
 * PRIMARY FULFILLMENT PATH: Printful.
 *
 * Called by /api/webhooks/square once a payment actually completes. Sends
 * the order to Printful, who prints, packs and ships it.
 *
 * Required env vars (see .env.example):
 *   PRINTFUL_API_KEY       from Printful → Settings → API
 *   PRINTFUL_AUTO_CONFIRM  "true" submits straight to production;
 *                          anything else (the default) creates a DRAFT you
 *                          confirm by hand in the Printful dashboard.
 *
 * The draft default is deliberate: until you've watched a couple of real
 * orders arrive correctly, a draft costs nothing to discard while a
 * confirmed order is money spent on a misprint.
 *
 * Before any of this works, each product+size needs its Printful
 * `sync_variant_id` recorded in lib/products.ts — see `apparelVariants`.
 */

export interface ShippingAddress {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  stateCode: string;
  countryCode: string;
  zip: string;
  email?: string;
  phone?: string;
}

const PRINTFUL_API = 'https://api.printful.com';

export function printfulConfigured(): boolean {
  return Boolean(process.env.PRINTFUL_API_KEY);
}

/** True when this exact product+size has a Printful variant mapped. */
export function isFulfillable(slug: string, size: string): boolean {
  const product = getProductBySlug(slug);
  const variant = product?.variants.find((v) => v.size === size);
  return Boolean(variant?.printfulVariantId);
}

export async function createPrintfulOrder(
  lines: CartLine[],
  shippingAddress: ShippingAddress,
  externalId: string
): Promise<{ printfulOrderId: string | null; status: 'created' | 'duplicate' | 'skipped' }> {
  const apiKey = process.env.PRINTFUL_API_KEY;
  if (!apiKey) return { printfulOrderId: null, status: 'skipped' };

  const items: { sync_variant_id: number; quantity: number }[] = [];
  const unmapped: string[] = [];

  for (const line of lines) {
    const product = getProductBySlug(line.slug);
    const variant = product?.variants.find((v) => v.size === line.size);
    if (!variant?.printfulVariantId) {
      unmapped.push(`${line.slug} (${line.size})`);
      continue;
    }
    items.push({
      sync_variant_id: variant.printfulVariantId,
      quantity: Math.max(1, Math.floor(line.quantity)),
    });
  }

  // Never ship a partial order. If anything is unmapped, bail loudly and
  // leave the whole thing for manual fulfillment rather than sending the
  // buyer two of three items with no explanation.
  if (unmapped.length > 0) {
    throw new Error(
      `Refusing to create a partial Printful order for ${externalId}. ` +
        `Unmapped variants: ${unmapped.join(', ')}. Fulfil this order manually ` +
        `and add the missing sync_variant_ids to lib/products.ts.`
    );
  }
  if (items.length === 0) return { printfulOrderId: null, status: 'skipped' };

  const confirm = process.env.PRINTFUL_AUTO_CONFIRM === 'true';

  const res = await fetch(`${PRINTFUL_API}/orders${confirm ? '?confirm=1' : ''}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // Square's order id doubles as our idempotency key: Printful rejects a
      // second order with the same external_id, so a replayed webhook can't
      // print the same shirt twice.
      external_id: externalId,
      recipient: {
        name: shippingAddress.name,
        address1: shippingAddress.address1,
        address2: shippingAddress.address2,
        city: shippingAddress.city,
        state_code: shippingAddress.stateCode,
        country_code: shippingAddress.countryCode,
        zip: shippingAddress.zip,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
      },
      items,
    }),
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message = body?.result ?? body?.error?.message ?? `HTTP ${res.status}`;
    if (typeof message === 'string' && /external_id/i.test(message)) {
      // Already created by an earlier delivery of this same webhook.
      return { printfulOrderId: null, status: 'duplicate' };
    }
    throw new Error(`Printful createOrder failed (${res.status}): ${JSON.stringify(message)}`);
  }

  return { printfulOrderId: String(body?.result?.id ?? ''), status: 'created' };
}
