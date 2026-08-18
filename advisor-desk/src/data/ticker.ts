import type { TickerItem } from '../types';

/** Days until Oct 15 (Medicare AEP start), rolling to next year after it passes. */
function daysUntilAep(): number {
  const now = new Date();
  let aep = new Date(now.getFullYear(), 9, 15);
  if (aep.getTime() < now.setHours(0, 0, 0, 0)) aep = new Date(now.getFullYear() + 1, 9, 15);
  return Math.round((aep.getTime() - new Date().setHours(0, 0, 0, 0)) / 86_400_000);
}

/**
 * Static seed data for the ticker strip. Replace by pointing useTicker()
 * at a live rates API — see src/hooks/useTicker.ts.
 */
export const TICKER_ITEMS: TickerItem[] = [
  { id: 't1', label: '10Y TREASURY', value: '4.21%', change: '-0.03', direction: 'down' },
  { id: 't2', label: 'S&P 500', value: '6,412.18', change: '+0.42%', direction: 'up' },
  { id: 't3', label: 'DOW', value: '44,881.55', change: '+0.19%', direction: 'up' },
  { id: 't4', label: 'NASDAQ', value: '21,204.87', change: '-0.11%', direction: 'down' },
  { id: 't5', label: 'FED FUNDS', value: '4.25–4.50%', direction: 'flat' },
  { id: 't6', label: '30Y MORTGAGE', value: '6.58%', change: '-0.05', direction: 'down' },
  { id: 't7', label: 'MEDICARE AEP', value: `${daysUntilAep()} days`, direction: 'flat' },
];
