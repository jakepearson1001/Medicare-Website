import { useCallback, useSyncExternalStore } from 'react';
import { storage } from '../lib/storage';

type Updater<T> = T | ((prev: T) => T);

interface Entry {
  value: unknown;
  listeners: Set<() => void>;
}

const entries = new Map<string, Entry>();

function getEntry<T>(key: string, initial: T): Entry {
  let entry = entries.get(key);
  if (!entry) {
    const stored = storage.get<T>(key);
    entry = { value: stored === null ? initial : stored, listeners: new Set() };
    entries.set(key, entry);
  }
  return entry;
}

export function writePersisted<T>(key: string, updater: Updater<T>, initial: T): void {
  const entry = getEntry(key, initial);
  const next =
    typeof updater === 'function' ? (updater as (prev: T) => T)(entry.value as T) : updater;
  entry.value = next;
  storage.set(key, next);
  entry.listeners.forEach((listener) => listener());
}

/**
 * Shared, persisted state keyed by name. Every consumer of the same key sees
 * the same value and re-renders on writes. Values survive reloads via the
 * storage adapter in src/lib/storage.ts — swap that adapter to move to a
 * real backend without touching components.
 */
export function usePersistedStore<T>(key: string, initial: T): [T, (updater: Updater<T>) => void] {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const entry = getEntry(key, initial);
      entry.listeners.add(onChange);
      return () => {
        entry.listeners.delete(onChange);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  const getSnapshot = useCallback(
    () => getEntry(key, initial).value as T,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const set = useCallback(
    (updater: Updater<T>) => writePersisted(key, updater, initial),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  return [value, set];
}
