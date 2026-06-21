# FitForge — Personal Fitness & Meal-Prep PWA

A mobile-first, installable Progressive Web App for tracking a 1-year workout
plan, weekly meal prep, recipes, and photo-based calorie logging. Single user,
no accounts — all your data lives locally on your device in IndexedDB.

- **Stack:** React + Vite, Dexie.js (IndexedDB), vite-plugin-pwa (manifest +
  service worker), one serverless proxy for the photo-calorie feature.
- **Works offline** for everything except the photo → calorie analysis (which
  needs the network + the Anthropic API).
- **6 bottom tabs:** Today · Plan · Library · Meals · Recipes · Log (+ Settings).
- **Library** of exercises and reusable "day" templates (push/pull/etc.) you
  build once and drop into any day of the plan.
- **Training cycles** (bulk / cut / etc.) with editable date ranges, shown as a
  banner in the week view and a color-coded band across the month calendar.
- On first run it seeds realistic sample data so every screen is usable
  immediately — edit or delete any of it.

---

## 1. Run it locally

```bash
npm install
npm run dev
```

Open the printed URL (default <http://localhost:5173>). The app seeds itself on
first load.

> **Note on the camera/calorie feature in `npm run dev`:** the photo-analysis
> proxy in `/api/analyze-food.js` is a serverless function and does **not** run
> under plain `vite dev`. The Log screen still works fully — it just falls back
> to **manual food entry**. To exercise the live photo analysis locally, run it
> through Vercel (next section).

### Run with the live photo-calorie feature (optional)

```bash
npm i -g vercel        # one-time
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
vercel dev             # serves the app AND the /api function together
```

---

## 2. Add your Anthropic API key

The key is read **only** by the serverless function on the server side and is
never bundled into the browser code.

- **Local (`vercel dev`):** put it in `.env.local` (see `.env.example`):
  ```
  ANTHROPIC_API_KEY=sk-ant-...
  # optional: ANTHROPIC_MODEL=claude-opus-4-8
  ```
- **Hosted (Vercel):** Project → Settings → Environment Variables → add
  `ANTHROPIC_API_KEY`.

If no key is configured, the Log screen automatically degrades to manual entry —
nothing breaks.

The vision call uses Claude with structured JSON output to identify foods and
estimate calories + protein/carbs/fat. Every number is editable before you save,
since photo estimates are approximate.

---

## 3. Deploy + install to your phone's home screen

PWA install requires HTTPS (or `localhost`). The simplest path:

```bash
npm i -g vercel
vercel            # deploy (set ANTHROPIC_API_KEY in the dashboard)
```

Then on your phone, open the deployed URL and:

- **iPhone (Safari):** Share → **Add to Home Screen**.
- **Android (Chrome):** menu (⋮) → **Install app** / **Add to Home Screen**.

It launches full-screen like a native app, with offline support for everything
except photo analysis.

### Build a production bundle yourself

```bash
npm run build     # outputs to dist/
npm run preview   # serve the built app locally
```

Any static host works for `dist/`, but you'll need a serverless function host
(Vercel/Netlify) for the `/api/analyze-food` proxy if you want live photo
analysis. Without it, manual entry still works everywhere.

---

## Data models (all stored locally via Dexie / IndexedDB)

| Store        | Shape (summary) |
|--------------|-----------------|
| `settings`   | targets (calories/macros), units, goal, days/week, split, start date |
| `plans`      | the 52-week plan metadata (goal, split, start date) |
| `sessions`   | one record per calendar day: title, week, type, `exercises[]` with per-set reps/weight/done, `completed` |
| `templates`  | reusable "day" templates (push/pull/etc.) used by the Library |
| `exercises`  | the exercise library (seeded suggestions + your own) |
| `cycles`     | training/diet phases: name, type, color, start/end dates |
| `recipes`    | name, photo, tags, ingredients, steps, servings, per-serving macros, favorite |
| `mealPlans`  | one per week: 7 days × {breakfast, lunch, dinner, snacks} → recipe refs + shopping-list checkmarks |
| `foodLog`    | per entry: photo, foods with macros, timestamp, date |

Models are documented in `src/db/db.js`.

## Project layout

```
api/analyze-food.js     Serverless vision proxy (key stays server-side)
src/db/                 Dexie schema (db.js) + first-run seed (seed.js)
src/lib/                Plan generator, exercise library, date & nutrition helpers, API client
src/components/         Bottom nav, icons, shared UI (sheets, toasts, bars)
src/screens/            Today, Plan, MealPrep, Recipes, Log, Settings
scripts/gen-icons.mjs   Regenerates the PWA PNG icons
```
