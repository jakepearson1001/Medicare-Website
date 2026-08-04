import type { MetadataRoute } from 'next';
import { getVisibleProducts } from '@/lib/products';
import { PATCH_NOTES } from '@/lib/copy/patch-notes';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://npcoutfitters.example.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '',
    '/shop',
    '/lore',
    '/patch-notes',
    '/respawn-point',
    '/dialogue',
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }));

  const productRoutes = getVisibleProducts().map((p) => ({
    url: `${SITE_URL}/product/${p.slug}`,
    lastModified: new Date(),
  }));

  const patchNoteRoutes = PATCH_NOTES.map((n) => ({
    url: `${SITE_URL}/patch-notes/${n.slug}`,
    lastModified: n.date,
  }));

  // /secret-area intentionally omitted — it's easter-egg-only.
  return [...staticRoutes, ...productRoutes, ...patchNoteRoutes];
}
