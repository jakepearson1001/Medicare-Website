import { TICKER_ITEMS } from '../data/ticker';
import type { TickerItem } from '../types';

/**
 * Rates seam. Today this serves the static seed in src/data/ticker.ts;
 * to wire a live rates API, fetch + poll here and keep the same return shape.
 */
export function useTicker(): { items: TickerItem[] } {
  return { items: TICKER_ITEMS };
}
