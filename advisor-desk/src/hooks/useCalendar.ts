import { useMemo, useState } from 'react';
import { EVENTS, isoDate } from '../data/events';
import type { CalendarEvent } from '../types';

/**
 * Calendar seam. Today this serves src/data/events.ts; to wire the Google
 * Calendar API, fetch the day's events here and keep the same return shape.
 */
export function useCalendar() {
  const [dayOffset, setDayOffset] = useState(0);

  const date = isoDate(dayOffset);

  const events: CalendarEvent[] = useMemo(
    () => EVENTS.filter((e) => e.date === date).sort((a, b) => a.start.localeCompare(b.start)),
    [date],
  );

  return {
    date,
    isToday: dayOffset === 0,
    events,
    prevDay: () => setDayOffset((d) => d - 1),
    nextDay: () => setDayOffset((d) => d + 1),
    goToday: () => setDayOffset(0),
  };
}

export function formatAgendaDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}
