import { TrendingDown, TrendingUp } from 'lucide-react';
import { useTicker } from '../hooks/useTicker';
import type { TickerItem } from '../types';

function TickerCell({ item }: { item: TickerItem }) {
  const color =
    item.direction === 'up'
      ? 'text-accgreen'
      : item.direction === 'down'
        ? 'text-accred'
        : 'text-slate-400';
  return (
    <span className="mx-5 inline-flex items-center gap-2 whitespace-nowrap">
      <span className="text-[11px] font-semibold tracking-wider text-slate-500">{item.label}</span>
      <span className="font-mono text-[12px] font-medium text-slate-200">{item.value}</span>
      {item.change && (
        <span className={`inline-flex items-center gap-0.5 font-mono text-[11px] ${color}`}>
          {item.direction === 'up' && <TrendingUp size={11} aria-hidden />}
          {item.direction === 'down' && <TrendingDown size={11} aria-hidden />}
          {item.change}
        </span>
      )}
    </span>
  );
}

/** Scrolling market data strip. Pauses on hover; static under reduced motion. */
export function TickerStrip() {
  const { items } = useTicker();
  // Content is rendered twice; the track animates -50% for a seamless loop.
  return (
    <div
      className="ticker-strip h-8 shrink-0 overflow-hidden border-b border-edge bg-[#111B27]"
      role="marquee"
      aria-label="Market data ticker"
    >
      <div className="ticker-track flex h-full w-max items-center">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center" aria-hidden={copy === 1}>
            {items.map((item) => (
              <TickerCell key={`${copy}-${item.id}`} item={item} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
