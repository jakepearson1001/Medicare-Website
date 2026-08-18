/**
 * Single persistence seam for the whole app. Every piece of user data —
 * window layout, tool tabs, quick links, to-dos, booking URL — goes through
 * this adapter. To move persistence to a real backend, replace
 * `localStorageAdapter` with an adapter that talks to your API; no component
 * code changes.
 */
export interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
}

const PREFIX = 'advisor-desk:';

const localStorageAdapter: StorageAdapter = {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? null : (JSON.parse(raw) as T);
    } catch {
      return null;
    }
  },
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // Quota exceeded / private mode — data stays in memory for the session.
    }
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      // ignore
    }
  },
};

export const storage: StorageAdapter = localStorageAdapter;
