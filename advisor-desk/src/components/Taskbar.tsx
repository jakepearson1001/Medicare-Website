import { useState } from 'react';
import { Bell, Search } from 'lucide-react';
import { useNow } from '../hooks/useClock';
import { useWindowStore, WINDOW_META, selectFocusedId } from '../store/windowStore';

interface TaskbarProps {
  /** Mobile card view: clicking a button scrolls to that card instead. */
  onNavigate?: (id: string) => void;
}

export function Taskbar({ onNavigate }: TaskbarProps) {
  const windows = useWindowStore((s) => s.windows);
  const taskbarClick = useWindowStore((s) => s.taskbarClick);
  const openWindow = useWindowStore((s) => s.openWindow);
  const focusedId = selectFocusedId({ windows });
  const now = useNow(15_000);
  const [showNotice, setShowNotice] = useState(false);

  return (
    <div className="relative flex h-11 shrink-0 items-center gap-1.5 border-t border-edge bg-panel px-2">
      {WINDOW_META.map((meta) => {
        const win = windows[meta.id];
        const isFocused = focusedId === meta.id;
        return (
          <button
            key={meta.id}
            type="button"
            onClick={() => (onNavigate ? onNavigate(meta.id) : taskbarClick(meta.id))}
            aria-pressed={isFocused}
            title={
              !win.open
                ? `Open ${meta.title}`
                : win.minimized
                  ? `Restore ${meta.title}`
                  : isFocused
                    ? `Minimize ${meta.title}`
                    : `Focus ${meta.title}`
            }
            className={`flex max-w-[190px] items-center gap-2 rounded-md border px-2.5 py-1.5 text-[12px] font-medium ${
              isFocused
                ? 'border-brass/70 bg-panel2 text-slate-100'
                : win.open && !win.minimized
                  ? 'border-edge bg-panel2 text-slate-300 hover:text-slate-100'
                  : 'border-transparent text-slate-500 hover:border-edge hover:text-slate-300'
            }`}
          >
            <span
              aria-hidden
              className={`h-2 w-2 shrink-0 rounded-full ${win.open ? '' : 'opacity-35'}`}
              style={{ backgroundColor: meta.accent }}
            />
            <span className="truncate">{meta.title.split(' — ')[0]}</span>
          </button>
        );
      })}

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => setShowNotice((v) => !v)}
          className="rounded-md p-2 text-slate-400 hover:bg-panel2 hover:text-slate-100"
        >
          <Bell size={15} />
        </button>
        {showNotice && (
          <div className="absolute bottom-12 right-24 z-50 w-56 rounded-lg border border-edge bg-panel2 p-3 text-[12px] text-slate-400 shadow-win">
            No new notifications.
          </div>
        )}
        <button
          type="button"
          aria-label="Global search — opens Client Lookup"
          onClick={() => {
            if (onNavigate) onNavigate('clients');
            else openWindow('clients');
            requestAnimationFrame(() => {
              document.getElementById('client-search-input')?.focus();
            });
          }}
          className="rounded-md p-2 text-slate-400 hover:bg-panel2 hover:text-slate-100"
        >
          <Search size={15} />
        </button>
        <div className="ml-1 border-l border-edge pl-3 text-right leading-tight">
          <div className="font-mono text-[12px] tabular-nums text-slate-200">
            {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </div>
          <div className="text-[10px] text-slate-500">
            {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
}
