import { fromISO, diffDays } from './dates.js';

// Return the cycle covering a given ISO date (first match), or null.
export function cycleForDate(cycles, iso) {
  if (!cycles) return null;
  for (const c of cycles) {
    if (iso >= c.startDate && iso <= c.endDate) return c;
  }
  return null;
}

// Which week of its own cycle a date falls in, plus total weeks (1-indexed).
export function cyclePosition(cycle, iso) {
  if (!cycle) return null;
  const total = Math.max(1, Math.ceil((diffDays(cycle.endDate, cycle.startDate) + 1) / 7));
  const wk = Math.floor(diffDays(iso, cycle.startDate) / 7) + 1;
  return { week: Math.min(Math.max(wk, 1), total), total };
}

// rgba tint of a hex color at the given alpha.
export function tint(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export { fromISO };
