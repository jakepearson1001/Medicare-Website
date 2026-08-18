import { Mountain, RotateCcw } from 'lucide-react';
import { ADVISOR_NAME, COMPANY_NAME } from '../config';
import { isMarketOpen, useNow } from '../hooks/useClock';
import { useWindowStore } from '../store/windowStore';

export function TopBar() {
  const now = useNow();
  const open = isMarketOpen(now);
  const resetLayout = useWindowStore((s) => s.resetLayout);

  return (
    <div className="flex h-12 shrink-0 items-center gap-3 border-b border-edge bg-panel px-4">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brass/15 text-brass">
          <Mountain size={16} strokeWidth={2.4} />
        </span>
        <div className="leading-tight">
          <div className="text-[13px] font-bold tracking-wide text-slate-100">{COMPANY_NAME}</div>
          <div className="text-[11px] text-slate-400">{ADVISOR_NAME} · Advisor Desk</div>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
            open
              ? 'border-accgreen/40 bg-accgreen/10 text-accgreen'
              : 'border-accred/40 bg-accred/10 text-accred'
          }`}
        >
          <span
            aria-hidden
            className={`h-1.5 w-1.5 rounded-full ${open ? 'bg-accgreen' : 'bg-accred'}`}
          />
          {open ? 'MARKET OPEN' : 'MARKET CLOSED'}
        </span>
        <time className="font-mono text-sm tabular-nums text-slate-200">
          {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })}
        </time>
        <button
          type="button"
          onClick={resetLayout}
          className="flex items-center gap-1.5 rounded-md border border-edge px-2 py-1 text-[11px] font-medium text-slate-400 hover:border-brass/60 hover:text-brass"
          title="Return all windows to their default positions"
        >
          <RotateCcw size={12} />
          Reset layout
        </button>
      </div>
    </div>
  );
}
