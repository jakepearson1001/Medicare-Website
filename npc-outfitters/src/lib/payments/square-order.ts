import type { CartLine } from '../commerce/types';
import type { ShippingAddress } from '../fulfillment/printful';

/**
 * Helpers that read our own cart data back out of a Square order. Kept
 * separate from the webhook route so they can be tested without a server.
 *
 * Shapes follow Square's Orders API: line items carry the `metadata` we set
 * at checkout, and the buyer's address lives on the SHIPMENT fulfillment at
 * `shipment_details.recipient.address`.
 */

/** Pull our cart lines back out of the Square order's line items. */
export function extractCartLines(order: Record<string, any>): CartLine[] {
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
export function extractShippingAddress(order: Record<string, any>): ShippingAddress | null {
  const fulfillments: any[] = Array.isArray(order?.fulfillments) ? order.fulfillments : [];
  const shipment = fulfillments.find((f) => f?.type === 'SHIPMENT') ?? fulfillments[0];
  const recipient = shipment?.shipment_details?.recipient;
  const addr = recipient?.address;
  if (!addr) return null;

  // Square can hand back a whitespace-only display_name (the sandbox test
  // buyer does), which is truthy but useless on a shipping label.
  const displayName = typeof recipient?.display_name === 'string' ? recipient.display_name.trim() : '';
  const joinedName = [addr.first_name, addr.last_name].filter(Boolean).join(' ').trim();
  const name = displayName || joinedName || 'Customer';

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
