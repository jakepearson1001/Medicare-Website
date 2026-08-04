# NPC Outfitters

Default skins for real life. A satirical streetwear/dropshipping storefront
built with Next.js (App Router) + Tailwind CSS.

This app lives at `npc-outfitters/` in this repo, separate from whatever
else is in the repository root — it's a standalone Next.js project with its
own `package.json`.

---

## 1. Run it locally

```bash
cd npc-outfitters
npm install
npm run dev
```

Open <http://localhost:3000>. The whole site works out of the box in **mock
mode**: products come from `src/lib/products.ts`, the cart is real
(persisted in localStorage), and checkout shows the in-voice "checkout not
yet implemented in this build of reality" dialogue instead of charging
anyone, until you wire up a payment processor (see below).

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

---

## 2. Importing product renders

Product data lives in **one file**: `src/lib/products.ts`. Each entry is a
typed `Product` object (name, price, class, RPG stat block, honest
disclosure, sizes, etc.) — copy an existing entry and edit it to add a new
item, or edit the fields on an existing one.

To attach a real photo to a product, drop an image into
`public/products/<slug>.jpg` where `<slug>` matches the product's `slug`
field exactly (e.g. `public/products/the-gray-hoodie.jpg`). **No code
changes needed** — `src/components/ProductImage.tsx` looks for that file
automatically and falls back to a generated placeholder swatch if it isn't
there yet. `.png` and `.webp` also work if you update the extension in
`ProductImage.tsx`.

The site logo is `public/logo.png` — replace that file with your real logo
(square image, at least 512×512 recommended) and it updates everywhere:
header, favicon, and the generated OG image badge.

---

## 3. Connecting Square (payments)

NPC Outfitters' primary payment path is **Square**. Everything is stubbed
and clearly marked — nothing charges a card until you fill this in.

1. Create a Square app in the [Square Developer
   Dashboard](https://developer.squareup.com/apps) and grab your
   **Access Token** and **Location ID** (sandbox first, then production).
2. Copy `.env.example` to `.env.local` and fill in:
   ```
   SQUARE_ACCESS_TOKEN=...
   SQUARE_LOCATION_ID=...
   NEXT_PUBLIC_SQUARE_APP_ID=...   # only needed for the in-page card form approach
   SQUARE_ENV=sandbox              # or "production"
   ```
3. Implement `createSquareCheckout` in **`src/lib/payments/square.ts`** —
   the file has step-by-step TODOs for both the hosted Checkout Links
   approach (fastest) and the Web Payments SDK approach (more control).
4. That's the only file the rest of the app depends on:
   `src/app/api/checkout/route.ts` already calls it and falls back to mock
   mode automatically if it's not implemented yet.

## 4. Connecting Printful (fulfillment)

Once Square takes a payment, the order should be sent to **Printful** so it
gets printed and shipped automatically.

1. Create a Printful account → Stores → add a store → choose **API** as the
   platform.
2. Generate an API key: Printful dashboard → Settings → API.
3. Set `PRINTFUL_API_KEY` in `.env.local`.
4. In Printful, sync each product (Gray Hoodie, Base Layer tee, etc.) and
   note each size's `sync_variant_id`. Add that mapping to the relevant
   `Product`/`ProductVariant` entries in `src/lib/products.ts` (see the
   TODO comments in `src/lib/fulfillment/printful.ts` for the exact shape).
5. Implement `createPrintfulOrder` in **`src/lib/fulfillment/printful.ts`**
   — call it from your Square success webhook/redirect handler with the
   cart lines and shipping address.

This is the intended default path (Square + Printful, no middleman). If
you'd rather run everything through **Shopify** instead (Shopify + a
dropship app as the fulfillment backend), there's an alternate,
equally-stubbed provider at `src/lib/commerce/shopify-provider.ts` — swap
the export in `src/lib/commerce/index.ts` to use it instead of
`MockCommerceProvider`.

---

## 5. Email capture

The "JOIN THE SERVER" form posts to `src/app/api/subscribe/route.ts`, which
currently just validates and logs. Set `KLAVIYO_API_KEY` +
`KLAVIYO_LIST_ID`, or `MAILCHIMP_API_KEY` + `MAILCHIMP_LIST_ID`, in
`.env.local`, then fill in the TODO in that file.

## 6. Analytics

GA4 and Meta Pixel are stubbed with TODOs in `src/app/layout.tsx`. Set
`NEXT_PUBLIC_GA_MEASUREMENT_ID` / `NEXT_PUBLIC_META_PIXEL_ID` in
`.env.local` and add the relevant `next/script` tags where marked.

---

## 7. Project layout

```
src/app/                    Routes (App Router)
src/components/              UI components
src/lib/products.ts           ← all product data, single source of truth
src/lib/commerce/             Commerce provider abstraction (mock / Shopify)
src/lib/payments/square.ts    Square checkout stub
src/lib/fulfillment/printful.ts  Printful order stub
src/lib/copy/                 All site copy (dialogue lines, taglines, reviews, patch notes, microcopy)
src/lib/cart/cart-store.ts    Zustand cart store (persisted to localStorage)
public/logo.png               Site logo / badge — replace with the real one
public/products/              Drop product renders here, named "<slug>.jpg"
```

---

## 8. Every easter egg we built (so you don't miss your own jokes)

1. **Rotating homepage tagline** — the H1 on `/` picks one of 17 taglines
   at random on every load (`src/lib/copy/taglines.ts`,
   `src/components/HeroTagline.tsx`).
2. **NPC dialogue box** — homepage dialogue box types out one of 46 random
   lines with a typewriter animation; click it to re-roll another line
   without reloading (`src/lib/copy/dialogue-lines.ts`,
   `src/components/DialogueBox.tsx`).
3. **Fake review ticker** — a scrolling marquee of 24 labeled-fake NPC
   reviews under the hero, with an honesty disclaimer underneath
   (`src/lib/copy/reviews.ts`, `src/components/Ticker.tsx`).
4. **Konami code** — press ↑ ↑ ↓ ↓ ← → ← → B A anywhere on the site. It
   triggers a full-screen glitch flash and redirects to `/secret-area`,
   which reveals a 10%-off DLC code and an exclusive product
   (`src/components/KonamiListener.tsx`).
5. **The "do not click" footer link** — bottom-right of the footer, styled
   nearly invisible (dark text on the dark footer background). It's the
   other route into `/secret-area` (`src/components/Footer.tsx`).
6. **The Missing Texture Hoodie** — the secret-area-exclusive product uses
   the classic magenta/black "missing texture" checkerboard as its actual
   product art, not a placeholder joke — the whole `/secret-area` page
   background uses the same pattern (`src/lib/products.ts`,
   `.missing-texture-pattern` in `src/app/globals.css`).
7. **1-in-50 rare page-load events** — on roughly 1 in 50 page loads, one
   of three things happens: the header logo does a quick double-blink, the
   cursor briefly becomes the NPC face, or a small corner dialogue box
   says "You weren't supposed to see this." (`src/components/RareEventRoller.tsx`).
8. **Random 404 lines** — `/any-broken-url` shows one of 12 random
   "you wandered outside the map" style lines every time
   (`src/lib/copy/not-found-lines.ts`, `src/app/not-found.tsx`).
9. **Exit-intent dialogue** — move your mouse toward the browser chrome on
   desktop (once per session) and an NPC offers one more dialogue option:
   10% off, or "Leave forever" — which dodges your cursor once before
   giving up ("Fine. Free will. Whatever.")
   (`src/components/ExitIntentDialogue.tsx`).
10. **Rotating announcement bar** — cycles through shipping info, the
    NPC10 discount code, and pure nonesense ("This bar contains an
    announcement.") in a random order each visit
    (`src/components/AnnouncementBar.tsx`).
11. **Dialogue-tree contact form** — `/dialogue` makes you pick a
    conversation branch first ([Ask about order] / [Complain politely] /
    [Complain impolitely] / [Just browsing]); each pre-fills a different
    subject line and a different canned NPC response before showing the
    real form (`src/components/DialogueTreeForm.tsx`).
12. **OG image is dynamic** — the social preview image
    (`src/app/opengraph-image.tsx`) regenerates per-request with a random
    tagline, so link previews vary too.

---

## 9. Tech notes

- **Framework:** Next.js 14 App Router + TypeScript, static-generated
  wherever possible (products, patch notes, and most routes are prerendered
  at build time; `/shop` is dynamic because of its `?class=` query filter).
- **Styling:** Tailwind CSS. Palette, fonts, and animation tokens are in
  `tailwind.config.ts`.
- **Cart:** Zustand with `persist` middleware (localStorage), no backend
  required for the cart itself.
- **Motion:** all animations respect `prefers-reduced-motion` (dialogue
  typing, glitch effects, and rare events fall back to static/instant).
