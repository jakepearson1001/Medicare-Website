import { useEffect, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Copy, MessageSquare, Pencil } from 'lucide-react';
import { BOOKING_COPY_MESSAGE, DEFAULT_BOOKING_URL } from '../../config';
import { formatAgendaDate, formatTime, useCalendar } from '../../hooks/useCalendar';
import { usePersistedStore } from '../../hooks/usePersistedStore';
import { normalizeUrl } from '../../hooks/useLinkList';
import type { EventType } from '../../types';

const EVENT_COLORS: Record<EventType, string> = {
  client: '#C9A24B',
  internal: '#5B8FD9',
  personal: '#4FAE82',
  compliance: '#D9705A',
};

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard API unavailable (permissions / non-secure context).
    try {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      el.remove();
      return true;
    } catch {
      return false;
    }
  }
}

function SchedulingLinkBlock() {
  const [bookingUrl, setBookingUrl] = usePersistedStore('booking-url', DEFAULT_BOOKING_URL);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(bookingUrl);
  const [copied, setCopied] = useState<'link' | 'message' | null>(null);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const flash = (which: 'link' | 'message') => {
    setCopied(which);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(null), 1800);
  };

  const saveDraft = () => {
    const clean = normalizeUrl(draft);
    if (clean) setBookingUrl(clean);
    setEditing(false);
  };

  return (
    <div className="shrink-0 border-b border-edge bg-panel2/60 p-3">
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        Client scheduling link
      </div>
      <div className="flex items-center gap-2">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={saveDraft}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveDraft();
              if (e.key === 'Escape') {
                e.stopPropagation();
                setDraft(bookingUrl);
                setEditing(false);
              }
            }}
            aria-label="Edit booking URL"
            className="min-w-0 flex-1 rounded-md border border-brass bg-desk px-2 py-1.5 font-mono text-[11px] text-slate-200"
          />
        ) : (
          <>
            <input
              readOnly
              value={bookingUrl}
              aria-label="Your public booking URL"
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 rounded-md border border-edge bg-desk px-2 py-1.5 font-mono text-[11px] text-slate-300"
            />
            <button
              type="button"
              aria-label="Edit booking URL"
              onClick={() => {
                setDraft(bookingUrl);
                setEditing(true);
              }}
              className="rounded-md border border-edge p-1.5 text-slate-400 hover:border-brass/60 hover:text-brass"
            >
              <Pencil size={12} />
            </button>
          </>
        )}
        <button
          type="button"
          onClick={async () => {
            if (await copyText(bookingUrl)) flash('link');
          }}
          className={`flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-semibold ${
            copied === 'link'
              ? 'bg-accgreen text-desk'
              : 'bg-brass text-desk hover:bg-brass/90'
          }`}
        >
          {copied === 'link' ? <Check size={13} /> : <Copy size={13} />}
          {copied === 'link' ? 'Copied ✓' : 'Copy link'}
        </button>
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <p className="text-[11px] text-slate-500">
          Paste into an email or text so clients can book their own time.
        </p>
        <button
          type="button"
          onClick={async () => {
            if (await copyText(BOOKING_COPY_MESSAGE(bookingUrl))) flash('message');
          }}
          className={`flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium ${
            copied === 'message'
              ? 'border-accgreen/60 text-accgreen'
              : 'border-edge text-slate-400 hover:border-brass/60 hover:text-brass'
          }`}
        >
          {copied === 'message' ? <Check size={11} /> : <MessageSquare size={11} />}
          {copied === 'message' ? 'Copied ✓' : 'Copy with message'}
        </button>
      </div>
    </div>
  );
}

export function CalendarWindow() {
  const { date, isToday, events, prevDay, nextDay, goToday } = useCalendar();

  return (
    <div className="flex h-full flex-col">
      <SchedulingLinkBlock />

      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-edge p-2.5">
        <h3 className="min-w-0 truncate text-[13px] font-bold text-slate-100">
          {formatAgendaDate(date)}
          {isToday && <span className="ml-2 text-[10px] font-semibold text-accgreen">TODAY</span>}
        </h3>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label="Previous day"
            onClick={prevDay}
            className="rounded-md border border-edge p-1 text-slate-400 hover:text-slate-100"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={goToday}
            className="rounded-md border border-edge px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-slate-100"
          >
            Today
          </button>
          <button
            type="button"
            aria-label="Next day"
            onClick={nextDay}
            className="rounded-md border border-edge p-1 text-slate-400 hover:text-slate-100"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-2.5">
        {events.length === 0 && (
          <li className="p-4 text-center text-[13px] text-slate-500">No events on this day.</li>
        )}
        {events.map((event) => (
          <li
            key={event.id}
            className="rounded-md border border-edge/70 bg-panel2 py-2 pl-3 pr-2"
            style={{ borderLeft: `3px solid ${EVENT_COLORS[event.type]}` }}
          >
            <div className="flex items-baseline gap-2">
              <span className="shrink-0 font-mono text-[11px] tabular-nums text-slate-400">
                {formatTime(event.start)}–{formatTime(event.end)}
              </span>
              <span className="min-w-0 truncate text-[13px] font-medium text-slate-100">
                {event.title}
              </span>
            </div>
            {event.location && (
              <div className="mt-0.5 pl-0 text-[11px] text-slate-500">{event.location}</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
