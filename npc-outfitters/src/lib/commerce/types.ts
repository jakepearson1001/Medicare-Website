export type ProductClass =
  | 'default'
  | 'ironic'
  | 'meta'
  | 'rare-drops'
  | 'secret';

export interface StatLine {
  label: string;
  value: string;
  positive: boolean;
}

export interface ProductVariant {
  size: string;
  inStock: boolean;
  /**
   * Printful's `sync_variant_id` for this exact product+size, used to place
   * the fulfillment order. Find it in Printful under Stores → your API store
   * → the product, or via GET https://api.printful.com/store/products/{id}.
   *
   * Until this is set, the item cannot be auto-fulfilled. Checkout refuses
   * to sell unmapped items whenever PRINTFUL_API_KEY is configured — see
   * lib/fulfillment/printful.ts.
   */
  printfulVariantId?: number;
}

export interface Product {
  slug: string;
  name: string;
  shortName: string;
  productClass: ProductClass;
  price: number;
  compareAtPrice?: number;
  rarity: 'common' | 'rare' | 'legendary';
  npcLine: string;
  honestDisclosure: string;
  stats: StatLine[];
  durability: number;
  classRequirement: string;
  variants: ProductVariant[];
  color: string;
  imagePlaceholder: string;
  featured?: boolean;
  hidden?: boolean;
}

export interface CartLine {
  slug: string;
  size: string;
  quantity: number;
}

/**
 * Commerce provider abstraction. Swap MockCommerceProvider for a real
 * provider (Shopify Storefront API, etc.) without touching any UI code —
 * every component in this app only ever talks to this interface.
 */
export interface CommerceProvider {
  listProducts(): Promise<Product[]>;
  getProduct(slug: string): Promise<Product | undefined>;
  /**
   * Returns a URL to send the browser to for real checkout, or null if no
   * live payment processor is connected yet (mock mode).
   */
  createCheckout(lines: CartLine[]): Promise<{ url: string | null }>;
}
