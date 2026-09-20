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

## 3. Going live: Square + Printful

Checkout and automatic fulfillment are **implemented**, not stubbed. They
stay dormant until the env vars below are set — with none of them, the site
runs in mock mode and the cart shows the in-voice "checkout not yet
implemented in this build of reality" message instead of charging anyone.

### How the money path works

```
cart → POST /api/checkout → Square hosted checkout page (card + address)
                                        ↓ buyer pays
     Printful order ← POST /api/webhooks/square ← Square "payment.updated"
                                        ↓
                          buyer redirected to /loot-acquired
```

Two properties worth knowing, because they're deliberate:

- **Prices are read from `src/lib/products.ts` on the server**, never from
  the browser's cart payload. A tampered cart can't change what's charged.
- **Nothing is sent to the printer until Square confirms payment
  completed.** An abandoned checkout or declined card can't create a print
  job, because fulfillment only ever happens in the webhook.

### Step 1 — Square credentials

Create an app in the [Square Developer Dashboard](https://developer.squareup.com/apps),
then set in `.env.local` (and in your host's env vars):

```
SQUARE_ACCESS_TOKEN=...
SQUARE_LOCATION_ID=...
SQUARE_ENV=sandbox          # switch to "production" when you're ready
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Use **sandbox** first. Square's sandbox gives you test card numbers so you
can run the whole flow without real money.

### Step 2 — Square webhook (this is what triggers fulfillment)

1. Square Developer Dashboard → your app → **Webhooks → Add subscription**
2. URL: `https://<your-domain>/api/webhooks/square`
3. Subscribe to the **`payment.updated`** event
4. Copy the **signature key** into `SQUARE_WEBHOOK_SIGNATURE_KEY`
5. Set `SQUARE_WEBHOOK_URL` to the *exact* URL from step 2

Step 5 matters more than it looks: Square computes the signature over that
URL string concatenated with the request body, so `http` vs `https` or a
stray trailing slash makes every webhook fail verification and silently
stop fulfilling orders.

### Step 3 — Printful

1. Printful → Stores → add store → choose **API** as the platform
2. Printful → Settings → API → generate a key → `PRINTFUL_API_KEY`
3. Leave `PRINTFUL_AUTO_CONFIRM=false` until you've watched a real order
   arrive correctly. Orders land as **drafts** you confirm by hand; a draft
   costs nothing to discard, a confirmed order is money spent on a misprint.
   Flip it to `true` for fully hands-off fulfillment.

### Step 4 — Map the variant IDs (required)

Each product+size needs its Printful `sync_variant_id`. List yours with:

```bash
curl -H "Authorization: Bearer $PRINTFUL_API_KEY" \
     https://api.printful.com/store/products
```

Then record them in `src/lib/products.ts`:

```ts
variants: apparelVariants({ S: 4012345678, M: 4012345679, L: 4012345680 }),
```

**Until a size is mapped, checkout refuses to sell it** (once
`PRINTFUL_API_KEY` is set) and tells the buyer the item can't ship yet.
That's intentional — it's better than taking money for something that will
never reach a printer.

### What tax and shipping do

Shipping follows the site's own copy: free over $50, otherwise a flat
$5.95, both constants at the top of `src/lib/payments/square.ts`. Sales tax
is left to your Square account's tax settings rather than hardcoded here.

### Optional alternative: Shopify

If you'd rather run commerce through **Shopify** instead of Square +
Printful directly, there's an alternate stubbed provider at
`src/lib/commerce/shopify-provider.ts` — swap the export in
`src/lib/commerce/index.ts` away from `MockCommerceProvider`.

---

## 4. Email capture

The "JOIN THE SERVER" form posts to `src/app/api/subscribe/route.ts`, which
currently just validates and logs. Set `KLAVIYO_API_KEY` +
`KLAVIYO_LIST_ID`, or `MAILCHIMP_API_KEY` + `MAILCHIMP_LIST_ID`, in
`.env.local`, then fill in the TODO in that file.

## 5. Analytics

GA4 and Meta Pixel are stubbed with TODOs in `src/app/layout.tsx`. Set
`NEXT_PUBLIC_GA_MEASUREMENT_ID` / `NEXT_PUBLIC_META_PIXEL_ID` in
`.env.local` and add the relevant `next/script` tags where marked.

---

## 6. Project layout

```
src/app/                    Routes (App Router)
src/components/              UI components
src/lib/products.ts           ← all product data, single source of truth
src/lib/commerce/             Commerce provider abstraction (mock / Shopify)
src/lib/payments/square.ts    Square hosted checkout + order lookup
src/lib/fulfillment/printful.ts  Printful order creation
src/app/api/webhooks/square/  Payment webhook -> triggers fulfillment
src/app/loot-acquired/        Post-purchase confirmation page
src/lib/copy/                 All site copy (dialogue lines, taglines, reviews, patch notes, microcopy)
src/lib/cart/cart-store.ts    Zustand cart store (persisted to localStorage)
public/logo.png               Site logo / badge — replace with the real one
public/products/              Drop product renders here, named "<slug>.jpg"
```

---

## 7. Every easter egg we built (so you don't miss your own jokes)

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

## 8. Tech notes

- **Framework:** Next.js 14 App Router + TypeScript, static-generated
  wherever possible (products, patch notes, and most routes are prerendered
  at build time; `/shop` is dynamic because of its `?class=` query filter).
- **Styling:** Tailwind CSS. Palette, fonts, and animation tokens are in
  `tailwind.config.ts`.
- **Cart:** Zustand with `persist` middleware (localStorage), no backend
  required for the cart itself.
- **Motion:** all animations respect `prefers-reduced-motion` (dialogue
  typing, glitch effects, and rare events fall back to static/instant).
