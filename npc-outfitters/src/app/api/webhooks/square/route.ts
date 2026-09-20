import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import type { CartLine } from '@/lib/commerce/types';
import { getSquareOrder } from '@/lib/payments/square';
import { createPrintfulOrder, type ShippingAddress } from '@/lib/fulfillment/printful';

/**
 * Square → Printful bridge. Square calls this when a payment completes, and
 * this is the ONLY place a print job gets created, so nothing is sent to be
 * printed until money has actually changed hands.
 *
 * Setup (see README):
 *  1. Square Developer Dashboard → your app → Webhooks → Add subscription
 *  2. URL: https://<your-domain>/api/webhooks/square
 *  3. Subscribe to the `payment.updated` event
 *  4. Copy the signature key into SQUARE_WEBHOOK_SIGNATURE_KEY
 *  5. Set SQUARE_WEBHOOK_URL to the exact same URL from step 2 — the
 *     signature is computed over that string, so any difference (http vs
 *     https, a trailing slash) makes every request fail to verify.
 */

// Always run this on demand; it must never be cached or statically rendered.
export const dynamic = 'force-dynamic';

function verifySquareSignature(
  rawBody: string,
  signatureHeader: string | null,
  notificationUrl: string,
  signatureKey: string
): boolean {
  if (!signatureHeader) return false;

  // Square signs the notification URL concatenated with the raw body.
  const expected = createHmac('sha256', signatureKey)
    .update(notificationUrl + rawBody)
    .digest('base64');

  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader);
  // timingSafeEqual throws on length mismatch, so guard first. Comparing
  // lengths is not itself a secret leak.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Pull our cart lines back out of the Square order's line items. */
function extractCartLines(order: Record<string, any>): CartLine[] {
  const lineItems: any[] = Array.isArray(order?.line_items) ? order.line_items : [];
  const lines: CartLine[] = [];

  for (const item of lineItems) {
    if (item?.metadata?.shipping === 'true') continue;

    let slug: string | undefined = item?.metadata?.slug;
    let size: string | undefined = item?.metadata?.size;

    // Fallback for the case where metadata didn't survive the round trip.
    if ((!slug || !size) && typeof item?.note === 'string' && item.note.includes('|')) {
      const [noteSlug, noteSize] = item.note.split('|');
      slug = slug || noteSlug;
      size = size || noteSize;
    }

    if (!slug || !size) continue;
    lines.push({ slug, size, quantity: Math.max(1, parseInt(item?.quantity ?? '1', 10) || 1) });
  }

  return lines;
}

/** Read the buyer's shipping address out of the Square order. */
function extractShippingAddress(order: Record<string, any>): ShippingAddress | null {
  const fulfillment = Array.isArray(order?.fulfillments) ? order.fulfillments[0] : null;
  const recipient = fulfillment?.shipment_details?.recipient;
  const addr = recipient?.address;
  if (!addr) return null;

  const name: string =
    recipient?.display_name ||
    [addr.first_name, addr.last_name].filter(Boolean).join(' ') ||
    'Customer';

  if (!addr.address_line_1 || !addr.locality || !addr.postal_code) return null;

  return {
    name,
    address1: addr.address_line_1,
    address2: addr.address_line_2 || undefined,
    city: addr.locality,
    stateCode: addr.administrative_district_level_1 || '',
    countryCode: addr.country || 'US',
    zip: addr.postal_code,
    email: recipient?.email_address || undefined,
    phone: recipient?.phone_number || undefined,
  };
}

export async function POST(request: Request) {
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  const notificationUrl = process.env.SQUARE_WEBHOOK_URL;

  if (!signatureKey || !notificationUrl) {
    console.error(
      '[square webhook] Missing SQUARE_WEBHOOK_SIGNATURE_KEY or SQUARE_WEBHOOK_URL — refusing to process.'
    );
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  // Must read the raw text: re-serializing the JSON would change the bytes
  // and break the signature.
  const rawBody = await request.text();

  if (
    !verifySquareSignature(
      rawBody,
      request.headers.get('x-square-hmacsha256-signature'),
      notificationUrl,
      signatureKey
    )
  ) {
    console.error('[square webhook] Signature verification failed.');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (event?.type !== 'payment.updated') {
    return NextResponse.json({ ok: true, ignored: event?.type ?? 'unknown' });
  }

  const payment = event?.data?.object?.payment;
  if (payment?.status !== 'COMPLETED') {
    return NextResponse.json({ ok: true, ignored: `payment ${payment?.status}` });
  }

  const orderId: string | undefined = payment?.order_id;
  if (!orderId) {
    console.error('[square webhook] Completed payment had no order_id.');
    return NextResponse.json({ ok: true, ignored: 'no order_id' });
  }

  try {
    const order = await getSquareOrder(orderId);
    if (!order) throw new Error(`Square order ${orderId} not found`);

    const lines = extractCartLines(order);
    const address = extractShippingAddress(order);

    if (lines.length === 0) throw new Error(`No recognizable line items on order ${orderId}`);
    if (!address) throw new Error(`No shipping address on order ${orderId}`);

    const result = await createPrintfulOrder(lines, address, orderId);
    console.log(
      `[square webhook] Order ${orderId} -> Printful ${result.status}` +
        (result.printfulOrderId ? ` (#${result.printfulOrderId})` : '')
    );
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    // Loud, and specifically actionable: this is a PAID order that did not
    // reach the printer, so it needs a human.
    console.error(
      `[square webhook] PAID ORDER NOT FULFILLED — Square order ${orderId} needs manual fulfillment:`,
      error instanceof Error ? error.message : error
    );
    // 500 so Square retries; transient failures then heal by themselves.
    return NextResponse.json({ error: 'Fulfillment failed' }, { status: 500 });
  }
}
