import { MockCommerceProvider } from './mock-provider';
import type { CommerceProvider } from './types';

// Swap this line to go live. See mock-provider.ts, shopify-provider.ts, and
// lib/payments/square.ts + lib/fulfillment/printful.ts for the two supported
// paths (Square + Printful direct, or Shopify as the commerce backend).
export const commerce: CommerceProvider = new MockCommerceProvider();

export * from './types';
