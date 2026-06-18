# Changes — JCU Medicare Advisor Page

## Files Added

| File | Purpose |
|------|---------|
| `package.json` | Astro project manifest |
| `astro.config.mjs` | Astro build config (site URL set to jordan-cu.org) |
| `src/styles/global.css` | JCU design tokens: brand colors, fonts, button/card styles, layout utilities |
| `src/layouts/BaseLayout.astro` | Shared page shell: imports global CSS, renders Header + Footer, injects SEO meta + OG tags |
| `src/components/Header.astro` | JCU header replica: utility bar, centered logo, desktop nav with dropdown, mobile hamburger |
| `src/components/Footer.astro` | JCU footer replica: green CTA band, multi-column links, dark green bottom bar |
| `src/pages/index.astro` | Minimal homepage placeholder (links through to jordan-cu.org and /medicare/) |
| `src/pages/medicare/index.astro` | **Full Medicare advisor landing page** — all 9 sections (see below) |
| `public/images/placeholder-headshot.svg` | SVG placeholder for Cherlynn's headshot |

## Files Touched (existing)

None — this is a net-new project. No existing files were modified.

---

## Medicare Page Sections (`/medicare/`)

1. **Hero** — dark green, split layout, headline + subhead, two CTA buttons
2. **Member Benefit** — 4 icon cards (no cost, local, personalized, ongoing)
3. **Meet Cherlynn** — advisor card with headshot, bio, phone, email, NPN
4. **How It Works** — 5 numbered steps
5. **Medicare Options** — 4 cards (Parts A/B, C, D, Medigap)
6. **Timing & Enrollment** — green band with timeline visual
7. **FAQ** — 6 accordion items (JS-enhanced, accessible)
8. **Consultation Form** — name, phone, email, ZIP, best-time, message, TCPA checkbox
9. **Compliance Disclaimers** — footer-level disclaimer block

---

## TODOs Before Launch

| # | What | Where |
|---|------|--------|
| 1 | Replace `[[CHERLYNN_PHONE]]` | `src/pages/medicare/index.astro` line ~8 |
| 2 | Replace `[[CHERLYNN_PHONE_TEL]]` (E.164 format, e.g. `+18015550100`) | same file line ~9 |
| 3 | Replace `[[CHERLYNN_EMAIL]]` | same file line ~10 |
| 4 | Replace `[[CHERLYNN_BIO]]` (1–3 sentence bio) | same file line ~11 |
| 5 | Replace `[[CHERLYNN_NPN]]` (National Producer Number) | same file line ~12 |
| 6 | Replace headshot: put real photo at `public/images/cherlynn-pearson.jpg` and update `CHERLYNN_HEADSHOT` constant | same file line ~13 |
| 7 | Set `[[FORM_ENDPOINT]]` to your form handler URL | same file line ~14 — options: Formspree, JCU CRM webhook, WordPress CF7 endpoint, custom API |
| 8 | Add partner/FMO/agency name to compliance section if required by your compliance agreement | `src/pages/medicare/index.astro` — compliance section comment |
| 9 | **Compliance review**: Have FMO/compliance team approve all disclaimer text before launch | `src/pages/medicare/index.astro` — Section 9 |
| 10 | Add a real `favicon.ico` to `/public/` | `public/favicon.ico` |
| 11 | Add OG share image at `public/images/jcu-og-default.png` (1200×630) | `public/images/` |

---

## Placeholders Summary

```
[[CHERLYNN_PHONE]]      — e.g. "801-555-0100"
[[CHERLYNN_PHONE_TEL]]  — e.g. "+18015550100" (E.164 for tel: links)
[[CHERLYNN_EMAIL]]      — e.g. "cherlynn@jordan-cu.org"
[[CHERLYNN_BIO]]        — 1–3 sentence bio about Cherlynn
[[CHERLYNN_NPN]]        — National Producer Number (remove if not displaying)
[[CHERLYNN_HEADSHOT]]   — replace with real photo path
[[FORM_ENDPOINT]]       — URL that handles POST form submissions
```

---

## Nav Integration

The Medicare page is linked in the **About Us** dropdown in `Header.astro`:

```
About Us
  ├── About JCU          → https://jordan-cu.org/about-us/
  ├── Locations & Hours  → https://jordan-cu.org/about-us/locations-and-hours/
  └── Medicare Benefits  → /medicare/   ← NEW
```

And in the footer under the **About Us** column.

---

## Integration Notes (when dropping into the real jordan-cu.org WordPress site)

The real site at jordan-cu.org appears to be WordPress. When you're ready to integrate:

1. **Option A — Standalone page in WordPress**: Create a new WordPress page, set template to "Full Width" or "No Sidebar", and paste the compiled HTML output from `astro build` into the page body or a custom HTML block. Inline the CSS.
2. **Option B — Custom page template**: Copy the `medicare/index.astro` content into a custom WordPress page template (`page-medicare.php`), adapting the Astro syntax to PHP/WordPress template tags. Use `get_header()` and `get_footer()` to pull in the real header/footer.
3. **Option C — iFrame embed**: Build and host this Astro page on a subdomain (`medicare.jordan-cu.org`), then embed or redirect from the main site.

For the form endpoint, the easiest drop-in for WordPress is **Formspree** (free tier works for low volume) or **WPForms/CF7** with a webhook integration to your CRM.
