import { usePersistedStore } from './usePersistedStore';
import type { LinkItem } from '../types';

export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * A persisted, reorderable list of links. Used independently by the tools bar
 * and the Quick Links window — separate keys, separate stores.
 */
export function useLinkList(key: string, seed: LinkItem[]) {
  const [links, setLinks] = usePersistedStore<LinkItem[]>(key, seed);

  const add = (name: string, url: string) => {
    const cleanName = name.trim();
    const cleanUrl = normalizeUrl(url);
    if (!cleanName || !cleanUrl) return;
    setLinks((prev) => [
      ...prev,
      { id: `${key}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: cleanName, url: cleanUrl },
    ]);
  };

  const remove = (id: string) => setLinks((prev) => prev.filter((l) => l.id !== id));

  const move = (fromIndex: number, toIndex: number) =>
    setLinks((prev) => {
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return prev;
      if (fromIndex >= prev.length || toIndex >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    });

  return { links, add, remove, move };
}
