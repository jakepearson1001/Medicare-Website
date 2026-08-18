import { create } from 'zustand';
import { storage } from '../lib/storage';

export type WindowId = 'clients' | 'outlook' | 'calendar' | 'quicklinks' | 'todos' | 'videos';

export interface WinGeom {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WinState extends WinGeom {
  open: boolean;
  minimized: boolean;
  maximized: boolean;
  /** Geometry to restore after un-maximizing. */
  prev: WinGeom | null;
  z: number;
}

export interface WindowMeta {
  id: WindowId;
  title: string;
  /** Tailwind-resolvable accent hex, used for taskbar dots and headers. */
  accent: string;
}

export const WINDOW_META: WindowMeta[] = [
  { id: 'clients', title: 'Advisor Works — Client Lookup', accent: '#C9A24B' },
  { id: 'outlook', title: 'Outlook', accent: '#5B8FD9' },
  { id: 'calendar', title: 'Google Calendar', accent: '#4FAE82' },
  { id: 'quicklinks', title: 'Quick Links', accent: '#D9705A' },
  { id: 'todos', title: 'To-Dos', accent: '#C9A24B' },
  { id: 'videos', title: 'Company Videos', accent: '#D9705A' },
];

const DEFAULT_WINDOWS: Record<WindowId, WinState> = {
  clients: { x: 16, y: 16, w: 520, h: 560, open: true, minimized: false, maximized: false, prev: null, z: 6 },
  outlook: { x: 552, y: 16, w: 470, h: 396, open: true, minimized: false, maximized: false, prev: null, z: 5 },
  calendar: { x: 1038, y: 16, w: 420, h: 560, open: true, minimized: false, maximized: false, prev: null, z: 4 },
  quicklinks: { x: 552, y: 428, w: 470, h: 300, open: true, minimized: false, maximized: false, prev: null, z: 3 },
  todos: { x: 16, y: 592, w: 520, h: 260, open: true, minimized: false, maximized: false, prev: null, z: 2 },
  videos: { x: 220, y: 100, w: 680, h: 460, open: false, minimized: false, maximized: false, prev: null, z: 1 },
};

interface PersistedLayout {
  windows: Record<WindowId, WinState>;
  topZ: number;
}

const LAYOUT_KEY = 'window-layout';

function loadLayout(): PersistedLayout {
  const stored = storage.get<PersistedLayout>(LAYOUT_KEY);
  if (stored && stored.windows) {
    // Merge with defaults so newly added windows get sane geometry.
    const windows = { ...DEFAULT_WINDOWS };
    (Object.keys(windows) as WindowId[]).forEach((id) => {
      if (stored.windows[id]) windows[id] = { ...windows[id], ...stored.windows[id] };
    });
    return { windows, topZ: stored.topZ ?? 10 };
  }
  return { windows: DEFAULT_WINDOWS, topZ: 10 };
}

interface WindowStore extends PersistedLayout {
  openWindow: (id: WindowId) => void;
  closeWindow: (id: WindowId) => void;
  minimizeWindow: (id: WindowId) => void;
  toggleMaximize: (id: WindowId) => void;
  focusWindow: (id: WindowId) => void;
  /** Restore/focus a minimized or closed window; minimize it if already focused. */
  taskbarClick: (id: WindowId) => void;
  setGeometry: (id: WindowId, geom: Partial<WinGeom>) => void;
  resetLayout: () => void;
}

export const useWindowStore = create<WindowStore>((set, get) => {
  const persist = () => {
    const { windows, topZ } = get();
    storage.set<PersistedLayout>(LAYOUT_KEY, { windows, topZ });
  };

  const update = (id: WindowId, patch: Partial<WinState>) => {
    set((state) => ({
      windows: { ...state.windows, [id]: { ...state.windows[id], ...patch } },
    }));
  };

  const raise = (id: WindowId) => {
    const topZ = get().topZ + 1;
    set({ topZ });
    update(id, { z: topZ });
  };

  return {
    ...loadLayout(),

    openWindow: (id) => {
      update(id, { open: true, minimized: false });
      raise(id);
      persist();
    },

    closeWindow: (id) => {
      update(id, { open: false, minimized: false });
      persist();
    },

    minimizeWindow: (id) => {
      update(id, { minimized: true });
      persist();
    },

    toggleMaximize: (id) => {
      const win = get().windows[id];
      if (win.maximized) {
        const prev = win.prev ?? DEFAULT_WINDOWS[id];
        update(id, { maximized: false, prev: null, ...prev });
      } else {
        update(id, { maximized: true, prev: { x: win.x, y: win.y, w: win.w, h: win.h } });
      }
      raise(id);
      persist();
    },

    focusWindow: (id) => {
      const win = get().windows[id];
      if (win.z !== get().topZ) raise(id);
      persist();
    },

    taskbarClick: (id) => {
      const state = get();
      const win = state.windows[id];
      if (!win.open) {
        state.openWindow(id);
        return;
      }
      if (win.minimized) {
        update(id, { minimized: false });
        raise(id);
      } else if (win.z === state.topZ) {
        update(id, { minimized: true });
      } else {
        raise(id);
      }
      persist();
    },

    setGeometry: (id, geom) => {
      update(id, geom);
      persist();
    },

    resetLayout: () => {
      set({ windows: DEFAULT_WINDOWS, topZ: 10 });
      persist();
    },
  };
});

/** The focused window is the topmost open, non-minimized one. */
export function selectFocusedId(state: { windows: Record<WindowId, WinState> }): WindowId | null {
  let best: WindowId | null = null;
  let bestZ = -Infinity;
  (Object.keys(state.windows) as WindowId[]).forEach((id) => {
    const win = state.windows[id];
    if (win.open && !win.minimized && win.z > bestZ) {
      best = id;
      bestZ = win.z;
    }
  });
  return best;
}
