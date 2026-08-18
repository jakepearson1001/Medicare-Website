import { useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { DEFAULT_TOOL_TABS } from '../data/defaults';
import { useLinkList } from '../hooks/useLinkList';
import { useWindowStore } from '../store/windowStore';
import type { LinkItem } from '../types';

/**
 * Chrome-tab-style quick-link row. Tabs open in a new browser tab, except
 * built-ins (Company Videos), which open an in-app window. Reorder by drag;
 * hover a tab for its remove button. Persisted separately from Quick Links.
 */
export function ToolsBar() {
  const { links, add, remove, move } = useLinkList('tool-tabs', DEFAULT_TOOL_TABS);
  const openWindow = useWindowStore((s) => s.openWindow);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const dragFrom = useRef<number | null>(null);

  const activate = (tab: LinkItem) => {
    if (tab.builtin === 'videos') {
      openWindow('videos');
    } else {
      window.open(tab.url, '_blank', 'noopener,noreferrer');
    }
  };

  const submit = () => {
    add(name, url);
    setName('');
    setUrl('');
    setAdding(false);
  };

  return (
    <div className="flex h-9 shrink-0 items-end gap-0.5 overflow-x-auto border-b border-edge bg-panel px-2">
      {links.map((tab, index) => (
        <div
          key={tab.id}
          draggable
          onDragStart={() => {
            dragFrom.current = index;
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (dragFrom.current !== null) move(dragFrom.current, index);
            dragFrom.current = null;
          }}
          className="group relative flex shrink-0 items-center rounded-t-lg border border-b-0 border-edge bg-panel2 hover:bg-edge/60"
        >
          <button
            type="button"
            onClick={() => activate(tab)}
            className="max-w-[180px] truncate rounded-t-lg py-1.5 pl-3 pr-6 text-[12px] font-medium text-slate-300 hover:text-slate-100"
            title={tab.url}
          >
            {tab.name}
          </button>
          <button
            type="button"
            aria-label={`Remove ${tab.name} tab`}
            onClick={() => remove(tab.id)}
            className="absolute right-1 rounded-full p-0.5 text-slate-500 opacity-0 hover:bg-accred hover:text-white focus-visible:opacity-100 group-hover:opacity-100"
          >
            <X size={10} />
          </button>
        </div>
      ))}

      {adding ? (
        <form
          className="flex items-center gap-1 rounded-t-lg border border-b-0 border-brass/50 bg-panel2 px-2 py-1"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.stopPropagation();
              setAdding(false);
            }
          }}
        >
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            aria-label="New tab name"
            className="w-24 rounded border border-edge bg-desk px-1.5 py-0.5 text-[11px] text-slate-200 placeholder:text-slate-500"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL"
            aria-label="New tab URL"
            className="w-40 rounded border border-edge bg-desk px-1.5 py-0.5 font-mono text-[11px] text-slate-200 placeholder:text-slate-500"
          />
          <button
            type="submit"
            className="rounded bg-brass px-2 py-0.5 text-[11px] font-semibold text-desk hover:bg-brass/90"
          >
            Add
          </button>
          <button
            type="button"
            aria-label="Cancel adding tab"
            onClick={() => setAdding(false)}
            className="rounded p-0.5 text-slate-500 hover:text-slate-200"
          >
            <X size={12} />
          </button>
        </form>
      ) : (
        <button
          type="button"
          aria-label="Add a tool tab"
          onClick={() => setAdding(true)}
          className="mb-0.5 flex shrink-0 items-center justify-center rounded-md p-1.5 text-slate-400 hover:bg-edge hover:text-brass"
        >
          <Plus size={14} />
        </button>
      )}
    </div>
  );
}
