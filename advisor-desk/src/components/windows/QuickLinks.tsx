import { useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { DEFAULT_QUICK_LINKS } from '../../data/defaults';
import { hostnameOf, useLinkList } from '../../hooks/useLinkList';

const BADGE_COLORS = ['#C9A24B', '#5B8FD9', '#4FAE82', '#D9705A'];

function badgeColor(name: string): string {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return BADGE_COLORS[Math.abs(hash) % BADGE_COLORS.length];
}

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

export function QuickLinks() {
  const { links, add, remove, move } = useLinkList('quick-links', DEFAULT_QUICK_LINKS);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const dragFrom = useRef<number | null>(null);

  return (
    <div className="flex h-full flex-col">
      <form
        className="flex shrink-0 items-center gap-2 border-b border-edge p-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          add(name, url);
          setName('');
          setUrl('');
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          aria-label="New link name"
          className="w-28 min-w-0 rounded-md border border-edge bg-desk px-2 py-1.5 text-[12px] text-slate-200 placeholder:text-slate-500"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URL (https:// added if missing)"
          aria-label="New link URL"
          className="min-w-0 flex-1 rounded-md border border-edge bg-desk px-2 py-1.5 font-mono text-[12px] text-slate-200 placeholder:text-slate-500"
        />
        <button
          type="submit"
          className="flex shrink-0 items-center gap-1 rounded-md bg-brass px-2.5 py-1.5 text-[12px] font-semibold text-desk hover:bg-brass/90"
        >
          <Plus size={13} />
          Add
        </button>
      </form>

      <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-2 gap-2 overflow-y-auto p-2.5 sm:grid-cols-3">
        {links.map((link, index) => (
          <div
            key={link.id}
            draggable
            onDragStart={() => {
              dragFrom.current = index;
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragFrom.current !== null) move(dragFrom.current, index);
              dragFrom.current = null;
            }}
            className="group relative"
          >
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-lg border border-edge bg-panel2 p-2.5 hover:border-brass/60"
            >
              <span
                aria-hidden
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-desk"
                style={{ backgroundColor: badgeColor(link.name) }}
              >
                {initials(link.name)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12px] font-semibold text-slate-100">
                  {link.name}
                </span>
                <span className="block truncate font-mono text-[10px] text-slate-500">
                  {hostnameOf(link.url)}
                </span>
              </span>
            </a>
            <button
              type="button"
              aria-label={`Remove ${link.name}`}
              onClick={() => remove(link.id)}
              className="absolute -right-1.5 -top-1.5 rounded-full border border-edge bg-panel p-0.5 text-slate-500 opacity-0 hover:bg-accred hover:text-white focus-visible:opacity-100 group-hover:opacity-100"
            >
              <X size={11} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
