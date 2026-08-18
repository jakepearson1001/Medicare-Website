import type { CalendarEvent } from '../types';

export function isoDate(dayOffset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Mock agenda seeded relative to today so the demo always has data.
 * Replace by pointing useCalendar() at the Google Calendar API —
 * see src/hooks/useCalendar.ts.
 */
export const EVENTS: CalendarEvent[] = [
  { id: 'e1', date: isoDate(0), start: '08:30', end: '09:00', title: 'Coffee w/ branch manager — Jordan CU', location: 'Riverton branch', type: 'internal' },
  { id: 'e2', date: isoDate(0), start: '10:00', end: '11:00', title: 'Review: Margaret Holloway', location: 'Office', type: 'client' },
  { id: 'e3', date: isoDate(0), start: '12:00', end: '12:45', title: 'Lunch — hold', location: '', type: 'personal' },
  { id: 'e4', date: isoDate(0), start: '14:00', end: '15:00', title: 'New client intake: referral (Pulliam)', location: 'Zoom', type: 'client' },
  { id: 'e5', date: isoDate(0), start: '16:00', end: '16:30', title: 'Compliance attestation — portal', location: '', type: 'compliance' },
  { id: 'e6', date: isoDate(1), start: '09:00', end: '09:30', title: 'Call: Luis Cabrera — rollover paperwork', location: 'Phone', type: 'client' },
  { id: 'e7', date: isoDate(1), start: '13:00', end: '14:30', title: 'AEP seminar prep — slide deck edits', location: 'Office', type: 'internal' },
  { id: 'e8', date: isoDate(2), start: '14:00', end: '15:00', title: 'Review: Ron & Pat Gearhart', location: 'Office', type: 'client' },
  { id: 'e9', date: isoDate(2), start: '15:30', end: '16:00', title: 'AHIP recert — module 3', location: '', type: 'compliance' },
  { id: 'e10', date: isoDate(-1), start: '11:00', end: '12:00', title: 'Marketing sync — postcard campaign', location: 'Zoom', type: 'internal' },
];
