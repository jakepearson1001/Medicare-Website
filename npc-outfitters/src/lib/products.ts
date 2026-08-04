import type { Product, ProductClass } from './commerce/types';

// ---------------------------------------------------------------------------
// PRODUCT DATA — single source of truth for the whole storefront.
//
// This is intentionally a flat, typed array so it's trivial to swap for a
// CMS or a real commerce API later: satisfy the same `Product` shape (see
// lib/commerce/types.ts) from wherever your real data lives, and every page
// in this app keeps working unchanged. See lib/commerce/mock-provider.ts
// and lib/commerce/shopify-provider.ts for where that swap happens.
// ---------------------------------------------------------------------------

const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const ONE_SIZE = ['One Size'];

export const PRODUCTS: Product[] = [
  // --- THE DEFAULT CLASS -----------------------------------------------
  {
    slug: 'the-gray-hoodie',
    name: 'The Gray Hoodie',
    shortName: 'Gray Hoodie',
    productClass: 'default',
    price: 48,
    rarity: 'common',
    npcLine: 'It’s gray. It’s a hoodie. You knew what you were getting.',
    honestDisclosure:
      'This hoodie was made in the same factory as roughly six other brands you own. We just put our logo on it and told you the truth about that.',
    stats: [
      { label: 'Anonymity', value: '+8', positive: true },
      { label: 'Comfort', value: '+6', positive: true },
      { label: 'Individuality', value: '-5', positive: false },
      { label: 'Warmth', value: '+4', positive: true },
    ],
    durability: 100,
    classRequirement: 'None. Obviously.',
    variants: APPAREL_SIZES.map((size) => ({ size, inStock: true })),
    color: '#8C8C86',
    imagePlaceholder: 'hoodie-gray',
    featured: true,
  },
  {
    slug: 'base-layer-v1',
    name: 'Base Layer v1.0',
    shortName: 'Base Layer v1.0',
    productClass: 'default',
    price: 24,
    rarity: 'common',
    npcLine: 'A plain white tee. The starting equipment of every save file.',
    honestDisclosure:
      'This is a white t-shirt. We considered writing something clever about it. There is nothing clever about a white t-shirt.',
    stats: [
      { label: 'Versatility', value: '+9', positive: true },
      { label: 'Comfort', value: '+5', positive: true },
      { label: 'Individuality', value: '-6', positive: false },
      { label: 'Stain Visibility', value: '+10', positive: false },
    ],
    durability: 95,
    classRequirement: 'None. Obviously.',
    variants: APPAREL_SIZES.map((size) => ({ size, inStock: true })),
    color: '#F2F0E9',
    imagePlaceholder: 'tee-white',
    featured: true,
  },
  {
    slug: 'lower-body-asset',
    name: 'Lower Body Asset',
    shortName: 'Lower Body Asset',
    productClass: 'default',
    price: 40,
    rarity: 'common',
    npcLine: 'Gray sweatpants. The lower half of the same default skin.',
    honestDisclosure:
      'Pairs with The Gray Hoodie to complete the full default skin. We are not going to pretend that wasn’t the plan all along.',
    stats: [
      { label: 'Comfort', value: '+7', positive: true },
      { label: 'Anonymity', value: '+6', positive: true },
      { label: 'Individuality', value: '-5', positive: false },
      { label: 'Nap Readiness', value: '+9', positive: true },
    ],
    durability: 98,
    classRequirement: 'None. Obviously.',
    variants: APPAREL_SIZES.map((size) => ({ size, inStock: true })),
    color: '#8C8C86',
    imagePlaceholder: 'sweatpants-gray',
  },

  // --- THE IRONIC CLASS ---------------------------------------------------
  {
    slug: 'npc-face-tee',
    name: 'NPC Face Tee',
    shortName: 'NPC Face Tee',
    productClass: 'ironic',
    price: 28,
    rarity: 'common',
    npcLine: 'The face. Our face. Now your chest’s face.',
    honestDisclosure:
      'Screen-printed logo tee. The ink is real. The character depicted has no interiority, same as most logo characters.',
    stats: [
      { label: 'Irony', value: '+9', positive: true },
      { label: 'Comfort', value: '+6', positive: true },
      { label: 'Individuality', value: '-2', positive: false },
      { label: 'Recognizability', value: '+7', positive: true },
    ],
    durability: 97,
    classRequirement: 'None. Obviously.',
    variants: APPAREL_SIZES.map((size) => ({ size, inStock: true })),
    color: '#F5F1E8',
    imagePlaceholder: 'tee-npc-face',
    featured: true,
  },
  {
    slug: 'not-the-main-character-tee',
    name: 'I Am Not The Main Character',
    shortName: 'Not The Main Character',
    productClass: 'ironic',
    price: 30,
    rarity: 'common',
    npcLine: 'A statement tee that makes a statement. The statement is on the shirt.',
    honestDisclosure:
      'Bold text tee. We ran the math: statistically, this shirt is correct for 99.99% of people who buy it, ourselves included.',
    stats: [
      { label: 'Self-Awareness', value: '+10', positive: true },
      { label: 'Comfort', value: '+6', positive: true },
      { label: 'Plot Relevance', value: '-8', positive: false },
      { label: 'Conversation Starter', value: '+5', positive: true },
    ],
    durability: 96,
    classRequirement: 'None. Obviously.',
    variants: APPAREL_SIZES.map((size) => ({ size, inStock: true })),
    color: '#141414',
    imagePlaceholder: 'tee-not-main-character',
  },
  {
    slug: 'background-character-cap',
    name: 'Background Character Cap',
    shortName: 'Background Character Cap',
    productClass: 'ironic',
    price: 26,
    rarity: 'common',
    npcLine: 'A cap for staying exactly as visible as everyone standing behind the protagonist.',
    honestDisclosure:
      'Six-panel cap, adjustable strap. Embroidered, not printed, because even background characters deserve embroidery.',
    stats: [
      { label: 'Anonymity', value: '+7', positive: true },
      { label: 'Sun Protection', value: '+6', positive: true },
      { label: 'Camera Presence', value: '-9', positive: false },
      { label: 'Adjustability', value: '+10', positive: true },
    ],
    durability: 100,
    classRequirement: 'None. Obviously.',
    variants: ONE_SIZE.map((size) => ({ size, inStock: true })),
    color: '#5C5C58',
    imagePlaceholder: 'cap-background',
  },
  {
    slug: 'same-dialogue-mug',
    name: 'Same Dialogue Every Day Mug',
    shortName: 'Same Dialogue Mug',
    productClass: 'ironic',
    price: 18,
    rarity: 'common',
    npcLine: 'Say the same six words to it every morning. It will not respond. That is accurate to the source material.',
    honestDisclosure:
      'Ceramic mug, 11oz, dishwasher safe. Microwave safe. Emotionally safe is not guaranteed.',
    stats: [
      { label: 'Caffeine Delivery', value: '+10', positive: true },
      { label: 'Repetition', value: '+9', positive: true },
      { label: 'Plot Progression', value: '-10', positive: false },
      { label: 'Durability', value: '+8', positive: true },
    ],
    durability: 90,
    classRequirement: 'None. Obviously.',
    variants: ONE_SIZE.map((size) => ({ size, inStock: true })),
    color: '#F5F1E8',
    imagePlaceholder: 'mug-dialogue',
  },

  // --- THE META CLASS ------------------------------------------------------
  {
    slug: 'this-shirt-was-dropshipped-tee',
    name: 'This Shirt Was Dropshipped',
    shortName: 'This Shirt Was Dropshipped',
    productClass: 'meta',
    price: 32,
    rarity: 'rare',
    npcLine: 'Front: the sentence. Back: the actual supply-chain route, printed as a quest map.',
    honestDisclosure:
      'This shirt was, in fact, dropshipped. The back print shows a real simplified route: factory → warehouse → fulfillment partner → your door. We think that’s more interesting than another tiny logo on the chest.',
    stats: [
      { label: 'Radical Honesty', value: '+10', positive: true },
      { label: 'Comfort', value: '+6', positive: true },
      { label: 'Supply Chain Mystery', value: '-10', positive: false },
      { label: 'Conversation Starter', value: '+9', positive: true },
    ],
    durability: 96,
    classRequirement: 'None. Obviously.',
    variants: APPAREL_SIZES.map((size) => ({ size, inStock: true })),
    color: '#F5F1E8',
    imagePlaceholder: 'tee-dropshipped',
    featured: true,
  },
  {
    slug: 'ad-space-tee',
    name: 'Ad Space Tee',
    shortName: 'Ad Space Tee',
    productClass: 'meta',
    price: 30,
    rarity: 'rare',
    npcLine: 'A blank rectangle on the chest, labeled "your personality here." We left it empty on purpose.',
    honestDisclosure:
      'Genuinely blank front print except for a thin border and small label text. You are, correctly, the content.',
    stats: [
      { label: 'Blank Canvas', value: '+10', positive: true },
      { label: 'Comfort', value: '+6', positive: true },
      { label: 'Pre-Filled Personality', value: '-10', positive: false },
      { label: 'Marketing Self-Awareness', value: '+10', positive: true },
    ],
    durability: 96,
    classRequirement: 'None. Obviously.',
    variants: APPAREL_SIZES.map((size) => ({ size, inStock: true })),
    color: '#F5F1E8',
    imagePlaceholder: 'tee-ad-space',
  },

  // --- THE RARE DROPS -------------------------------------------------------
  {
    slug: 'npc-face-socks',
    name: 'NPC Face Socks',
    shortName: 'NPC Face Socks',
    productClass: 'rare-drops',
    price: 14,
    rarity: 'rare',
    npcLine: 'Small NPC faces, repeated, on your feet, forever, until the socks wear out.',
    honestDisclosure:
      'Crew length. Restocks are irregular because our sock supplier restocks irregularly. We are being honest about a factor outside our control.',
    stats: [
      { label: 'Comfort', value: '+8', positive: true },
      { label: 'Repetition', value: '+10', positive: true },
      { label: 'Individuality', value: '-4', positive: false },
      { label: 'Warmth', value: '+7', positive: true },
    ],
    durability: 85,
    classRequirement: 'None. Obviously.',
    variants: ONE_SIZE.map((size) => ({ size, inStock: true })),
    color: '#9A9A9A',
    imagePlaceholder: 'socks-npc-face',
  },
  {
    slug: 'fog-of-war-bucket-hat',
    name: 'Fog of War',
    shortName: 'Fog of War Bucket Hat',
    productClass: 'rare-drops',
    price: 26,
    rarity: 'rare',
    npcLine: 'An all-gray bucket hat named after the part of the map you haven’t explored yet. Or ever will.',
    honestDisclosure:
      'Cotton bucket hat, unstructured. Restocks when the algorithm feels like it — that is our actual restock policy, not a joke.',
    stats: [
      { label: 'Coverage', value: '+9', positive: true },
      { label: 'Mystery', value: '+8', positive: true },
      { label: 'Visibility', value: '-7', positive: false },
      { label: 'Packability', value: '+9', positive: true },
    ],
    durability: 92,
    classRequirement: 'None. Obviously.',
    variants: ONE_SIZE.map((size) => ({ size, inStock: true })),
    color: '#9A9A9A',
    imagePlaceholder: 'bucket-hat-fog',
  },
  {
    slug: 'render-distance-tracksuit',
    name: 'The Render Distance',
    shortName: 'Render Distance Tracksuit',
    productClass: 'rare-drops',
    price: 86,
    compareAtPrice: 96,
    rarity: 'legendary',
    npcLine: 'An all-gray tracksuit for existing right at the edge of everyone’s peripheral vision.',
    honestDisclosure:
      'Full jacket + pant set, matching gray. This is the most expensive item in the store and it is still, factually, gray sweats.',
    stats: [
      { label: 'Anonymity', value: '+10', positive: true },
      { label: 'Comfort', value: '+9', positive: true },
      { label: 'Individuality', value: '-8', positive: false },
      { label: 'Draw Distance', value: '+10', positive: true },
    ],
    durability: 99,
    classRequirement: 'None. Obviously.',
    variants: APPAREL_SIZES.map((size) => ({ size, inStock: true })),
    color: '#8C8C86',
    imagePlaceholder: 'tracksuit-render-distance',
    featured: true,
  },

  // --- SECRET AREA EXCLUSIVE (hidden from /shop, Konami / secret link only)
  {
    slug: 'missing-texture-hoodie',
    name: 'Missing Texture Hoodie',
    shortName: 'Missing Texture Hoodie',
    productClass: 'secret',
    price: 52,
    rarity: 'legendary',
    npcLine: 'The magenta-and-black checkerboard pattern your GPU shows when it gives up. Now wearable.',
    honestDisclosure:
      'This is a real product. We really will ship it to you. It is, correctly, the single most main-character item in this entire store, which is the joke.',
    stats: [
      { label: 'Chaos', value: '+10', positive: true },
      { label: 'Comfort', value: '+6', positive: true },
      { label: 'Anonymity', value: '-10', positive: false },
      { label: 'Rarity', value: '+10', positive: true },
    ],
    durability: 100,
    classRequirement: 'Konami code or a very specific footer link.',
    variants: APPAREL_SIZES.map((size) => ({ size, inStock: true })),
    color: '#E4322E',
    imagePlaceholder: 'hoodie-missing-texture',
    hidden: true,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getVisibleProducts(): Product[] {
  return PRODUCTS.filter((p) => !p.hidden);
}

export function getFeaturedProducts(): Product[] {
  return PRODUCTS.filter((p) => p.featured && !p.hidden);
}

export const PRODUCT_CLASS_LABELS: Record<ProductClass, string> = {
  default: 'The Default Class',
  ironic: 'The Ironic Class',
  meta: 'The Meta Class',
  'rare-drops': 'The Rare Drops',
  secret: 'Classified',
};
