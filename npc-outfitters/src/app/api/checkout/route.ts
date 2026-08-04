import { NextResponse } from 'next/server';
import type { CartLine } from '@/lib/commerce/types';
import { createSquareCheckout } from '@/lib/payments/square';

/**
 * Checkout entrypoint. Tries the Square checkout stub first (this store's
 * primary payment path — see lib/payments/square.ts); if Square isn't
 * configured, falls through to the mock commerce provider, which returns
 * `{ url: null }`. The cart UI (InventoryDrawer) treats `url: null` as
 * "no payment processor connected yet" and shows the in-voice fallback
 * dialogue instead of erroring.
 *
 * Once Square is wired up and a payment succeeds, its success webhook /
 * redirect handler should call `createPrintfulOrder` from
 * lib/fulfillment/printful.ts to send the order to Printful for printing
 * and shipping.
 */
export async function POST(request: Request) {
  let lines: CartLine[] = [];
  try {
    const body = await request.json();
    lines = Array.isArray(body?.lines) ? body.lines : [];
  } catch {
    return NextResponse.json({ error: 'Invalid input. Dialogue tree broken.' }, { status: 400 });
  }

  if (lines.length === 0) {
    return NextResponse.json({ url: null });
  }

  try {
    const { url } = await createSquareCheckout(lines);
    return NextResponse.json({ url });
  } catch {
    // Square not implemented yet — fall back to mock mode rather than 500.
    return NextResponse.json({ url: null });
  }
}
