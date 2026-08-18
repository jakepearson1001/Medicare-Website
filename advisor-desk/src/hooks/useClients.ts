import { useMemo, useState } from 'react';
import { CLIENTS } from '../data/clients';
import type { Client } from '../types';

/**
 * CRM seam. Today this serves the mock list from src/data/clients.ts;
 * to wire a real CRM/API, fetch here (e.g. with SWR/React Query) and keep
 * the same return shape — no component changes needed.
 */
export function useClients() {
  const [query, setQuery] = useState('');

  const clients: Client[] = CLIENTS;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    const qDigits = q.replace(/\D/g, '');
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.policyNumber.toLowerCase().includes(q) ||
        (qDigits.length > 0 && c.phone.replace(/\D/g, '').includes(qDigits)),
    );
  }, [clients, query]);

  return { clients: filtered, allClients: clients, query, setQuery };
}

export function formatAum(aum: number): string {
  if (aum >= 1_000_000) return `$${(aum / 1_000_000).toFixed(2)}M`;
  return `$${Math.round(aum / 1000)}K`;
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function initialsOf(name: string): string {
  const parts = name.replace(/&/g, ' ').split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}
