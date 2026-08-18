import { useState } from 'react';
import { CalendarClock, FileText, Mail, Phone, Search } from 'lucide-react';
import { formatAum, formatDate, initialsOf, useClients } from '../../hooks/useClients';

const AVATAR_COLORS = ['#C9A24B', '#5B8FD9', '#4FAE82', '#D9705A'];

function avatarColor(name: string): string {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function Stat({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-edge bg-panel2 p-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className={`mt-0.5 truncate text-[13px] text-slate-100 ${mono ? 'font-mono' : ''}`}>
        {value}
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  primary = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-[12px] font-medium ${
        primary
          ? 'border-brass bg-brass/15 text-brass hover:bg-brass/25'
          : 'border-edge bg-panel2 text-slate-300 hover:border-slate-500 hover:text-slate-100'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export function ClientLookup() {
  const { clients, query, setQuery } = useClients();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = clients.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-edge p-3">
        <div className="relative">
          <Search
            size={14}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
            aria-hidden
          />
          <input
            id="client-search-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, policy #, or phone…"
            aria-label="Search clients"
            className="w-full rounded-md border border-edge bg-desk py-1.5 pl-8 pr-3 text-[13px] text-slate-200 placeholder:text-slate-500 focus:border-brass"
          />
        </div>
      </div>

      <ul className="min-h-0 flex-1 divide-y divide-edge/60 overflow-y-auto" role="listbox" aria-label="Clients">
        {clients.length === 0 && (
          <li className="p-4 text-center text-[13px] text-slate-500">No clients match “{query}”.</li>
        )}
        {clients.map((client) => (
          <li key={client.id}>
            <button
              type="button"
              role="option"
              aria-selected={selectedId === client.id}
              onClick={() => setSelectedId(client.id)}
              className={`flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-panel2 ${
                selectedId === client.id ? 'bg-panel2' : ''
              }`}
            >
              <span
                aria-hidden
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-desk"
                style={{ backgroundColor: avatarColor(client.name) }}
              >
                {initialsOf(client.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-slate-100">
                  {client.name}
                </span>
                <span className="block truncate text-[11px] text-slate-400">{client.plan}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block font-mono text-[12px] text-slate-200">
                  {formatAum(client.aum)}
                </span>
                <span className="block font-mono text-[10px] text-slate-500">
                  {formatDate(client.nextReview)}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {selected && (
        <div className="shrink-0 border-t border-edge bg-panel p-3">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <h3 className="truncate text-[14px] font-bold text-slate-100">{selected.name}</h3>
            <span className="shrink-0 font-mono text-[11px] text-slate-500">
              {selected.policyNumber}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Plan" value={selected.plan} />
            <Stat label="Next review" value={formatDate(selected.nextReview)} mono />
            <Stat label="AUM" value={formatAum(selected.aum)} mono />
            <Stat label="Last contact" value={formatDate(selected.lastContact)} mono />
          </div>
          <div className="mt-2 grid grid-cols-4 gap-2">
            <ActionButton
              icon={<Phone size={13} />}
              label="Call"
              primary
              onClick={() => window.open(`tel:${selected.phone.replace(/\D/g, '')}`)}
            />
            <ActionButton
              icon={<Mail size={13} />}
              label="Email"
              onClick={() => window.open(`mailto:${selected.email}`)}
            />
            <ActionButton icon={<FileText size={13} />} label="Policy" />
            <ActionButton icon={<CalendarClock size={13} />} label="Review" />
          </div>
        </div>
      )}
    </div>
  );
}
