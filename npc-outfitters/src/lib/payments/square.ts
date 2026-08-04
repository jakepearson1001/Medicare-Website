import type { CartLine } from '../commerce/types';

/**
 * PRIMARY PAYMENT PATH: Square.
 *
 * This module is a clearly-marked stub. Nothing here runs until you fill in
 * the TODOs and set the env vars in .env.example. Until then, the cart's
 * "Main Quest" (checkout) button falls back to the in-voice
 * "checkout not yet implemented in this build of reality" dialogue box —
 * see components/InventoryDrawer.tsx and app/api/checkout/route.ts.
 *
 * Two ways to take payment with Square:
 *
 * A) Square Checkout Links / Hosted Checkout (fastest to ship):
 *    - Use the Square Orders API + Checkout API to create a hosted
 *      checkout session server-side and redirect the browser to the
 *      returned URL. No card data ever touches this app.
 *    - Docs: https://developer.squareup.com/docs/checkout-api
 *
 * B) Square Web Payments SDK (in-page card form, more control):
 *    - Load the Web Payments SDK on the client, tokenize the card, POST the
 *      resulting nonce to a server route, then call `payments.create` with
 *      the Payments API.
 *    - Docs: https://developer.squareup.com/docs/web-payments/overview
 *
 * TODO to go live:
 * 1. Create a Square application in the Square Developer Dashboard
 *    (https://developer.squareup.com/apps) and get:
 *      SQUARE_ACCESS_TOKEN        (server-side secret, sandbox or production)
 *      SQUARE_LOCATION_ID         (which Square location orders post to)
 *      NEXT_PUBLIC_SQUARE_APP_ID  (public, only needed for the Web Payments
 *                                  SDK approach)
 *      SQUARE_ENV                 ("sandbox" or "production")
 * 2. Set them in .env.local (see .env.example) and in your host's env vars.
 * 3. Implement `createSquareCheckout` below using the Square Node SDK
 *    (`squareup` npm package) — create an Order from the cart lines, then a
 *    Checkout, and return `checkout.checkoutPageUrl`.
 * 4. On payment success, Square redirects back to a success URL you
 *    configure — wire that route to call `createPrintfulOrder` (see
 *    lib/fulfillment/printful.ts) so the order is automatically sent to
 *    Printful for fulfillment.
 */
export async function createSquareCheckout(_lines: CartLine[]): Promise<{ url: string | null }> {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;

  if (!accessToken || !locationId) {
    return { url: null };
  }

  // TODO: replace with a real Square Orders + Checkout API call.
  throw new Error('createSquareCheckout is not implemented yet. See lib/payments/square.ts.');
}
