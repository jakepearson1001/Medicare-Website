import { NextResponse } from 'next/server';
import type { CartLine } from '@/lib/commerce/types';
import { createSquareCheckout, UnfulfillableItemsError } from '@/lib/payments/square';

/**
 * Checkout entrypoint. Creates a Square hosted checkout and hands back the
 * URL for the browser to follow. If Square isn't configured yet this returns
 * `{ url: null }`, which the cart drawer renders as the in-voice
 * "checkout not yet implemented in this build of reality" dialogue.
 *
 * Nothing is fulfilled here — /api/webhooks/square does that once Square
 * confirms the payment completed.
 */
export const dynamic = 'force-dynamic';

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
  } catch (error) {
    if (error instanceof UnfulfillableItemsError) {
      // Deliberately blocked rather than broken: these items have no Printful
      // variant mapped, so a sale would take money for something that can't ship.
      console.error('[checkout] Blocked unfulfillable items:', error.items);
      return NextResponse.json(
        {
          url: null,
          error: 'unfulfillable',
          message:
            'These items cannot be shipped yet: ' +
            error.items.join(', ') +
            '. Restocks when the algorithm feels like it.',
        },
        { status: 409 }
      );
    }

    console.error('[checkout] Square checkout failed:', error);
    // Fall back to mock-mode messaging rather than a raw 500 in the UI.
    return NextResponse.json({ url: null });
  }
}
