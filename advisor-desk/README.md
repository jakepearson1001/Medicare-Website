# Advisor Desk

A desktop-style dashboard for Dave Pearson (Peak Financial Network Solutions) — a single-page
React + TypeScript app that mimics a windowed OS: draggable/resizable panels for the client
CRM, mail, calendar, quick links, and a to-do list, all persisted to `localStorage`.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS (design tokens in `tailwind.config.js` — brass/blue/green/red accents on a
  dark panel palette; IBM Plex Sans for UI, IBM Plex Mono for numbers/times/URLs)
- `zustand` for the window manager store
- `lucide-react` for icons

## Running it

```bash
npm install
npm run dev        # http://localhost:5180
npm run build       # type-checks then builds to dist/
npm run typecheck   # tsc -b only
```

## Architecture

### Window manager

`src/store/windowStore.ts` holds geometry (`x, y, w, h`), `open`/`minimized`/`maximized` state,
and z-index per window, persisted via the same storage seam as everything else. `src/components/
Window.tsx` is the reusable chrome: drag-by-header and resize-by-corner both apply a CSS
`transform`/explicit `width`/`height` inside `requestAnimationFrame` while the pointer is down,
and only commit final geometry to the store (and `localStorage`) on pointer-up — so dragging
never triggers layout thrash. `src/components/Desktop.tsx` renders one `<Window>` per entry in
`WINDOW_META`; `App.tsx` swaps in `MobileStack` below 900px width (see `MOBILE_BREAKPOINT` in
`src/config.ts`), which drops the floating model for full-width stacked cards while keeping the
tools bar and taskbar.

### Persistence seam

Every piece of user data — window layout, tool tabs, quick links, to-dos, the booking URL —
goes through `src/hooks/usePersistedStore.ts`, a small `useSyncExternalStore`-based hook keyed
by string. It reads/writes through `src/lib/storage.ts`, which defines a tiny `StorageAdapter`
interface (`get`/`set`/`remove`) currently implemented against `localStorage`. **To move to a
real backend, replace `localStorageAdapter` in `src/lib/storage.ts`** (e.g. an adapter that
debounces writes to your API and hydrates from a `GET` on load) — no component or hook call
site needs to change.

### Mock data → real integrations

Every mock data source lives in `src/data/` and is consumed only through a hook in
`src/hooks/`, so pointing at a live source is a one-file change per integration:

| Integration | Mock data | Hook to edit | Notes |
|---|---|---|---|
| CRM / client list | `src/data/clients.ts` | `src/hooks/useClients.ts` | Replace the static `CLIENTS` array with a fetch (SWR/React Query recommended); keep the `Client[]` shape from `src/types.ts` and the hook's `{ clients, allClients, query, setQuery }` return shape. |
| Outlook / mail | `src/data/mail.ts` | `src/hooks/useMail.ts` | Swap in Microsoft Graph (`/me/mailFolders/.../messages`). Keep folder ids (`inbox`/`sent`/`compliance`) and the flagged-filter semantics, or extend `MailFolder` in `src/types.ts`. |
| Google Calendar | `src/data/events.ts` | `src/hooks/useCalendar.ts` | Swap in the Google Calendar API (`events.list` for the selected day). Keep the `CalendarEvent` shape and the `{ date, events, prevDay, nextDay, goToday }` return shape. |
| Market/rates ticker | `src/data/ticker.ts` | `src/hooks/useTicker.ts` | Swap in a live rates API and poll on an interval; keep the `TickerItem[]` shape so `TickerStrip.tsx` needs no changes. |

### Tool tabs vs. Quick Links

These are intentionally separate persisted stores (`tool-tabs` and `quick-links` keys, both via
`src/hooks/useLinkList.ts`) — a link added in one never appears in the other. Both support
drag-to-reorder and inline add/remove.

### Company Videos

`COMPANY_VIDEO_URL` in `src/config.ts` is the single place to point at Dave's real YouTube
channel. If the URL contains a `list=` playlist id, the first tools-bar tab ("Company Videos")
opens an in-app window (`src/components/windows/CompanyVideos.tsx`) that embeds the playlist via
`youtube-nocookie.com`; otherwise (or if the embed errors) it falls back to opening the URL in a
new browser tab.

### To-dos

`src/components/windows/Todos.tsx` — items are never auto-removed. Checking one off marks it
done (strikethrough, sorts below active items) but keeps it in the persisted list; the only way
an item leaves is the ✕ delete button or "Clear completed," which asks for confirmation first.

## Accessibility & motion

- All interactive elements are reachable by keyboard with visible focus rings (`:focus-visible`
  in `src/index.css`); `Escape` closes the currently focused window.
- `prefers-reduced-motion: reduce` disables the ticker marquee and window transitions globally.
- Drag/resize use transforms + `requestAnimationFrame`, not layout-triggering style writes, to
  avoid thrash while dragging.

## Design tokens

See `tailwind.config.js`: background `#0E1620`, panels `#182230`/`#1E2A3A`, borders `#2A3A4D`,
brass accent `#C9A24B`, blue `#5B8FD9`, green `#4FAE82`, red `#D9705A`. Windows use a 10px
radius, 1px border (brass when focused), and a heavy drop shadow (`shadow-win`).
