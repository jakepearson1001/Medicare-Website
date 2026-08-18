import type { ReactNode } from 'react';
import { Window } from './Window';
import { useWindowStore, WINDOW_META, selectFocusedId } from '../store/windowStore';
import type { WindowId } from '../store/windowStore';

interface DesktopProps {
  renderContent: (id: WindowId) => ReactNode;
}

export function Desktop({ renderContent }: DesktopProps) {
  const windows = useWindowStore((s) => s.windows);
  const focusedId = selectFocusedId({ windows });

  return (
    <main className="relative min-h-0 flex-1 overflow-hidden bg-desk" aria-label="Desktop">
      {WINDOW_META.map((meta) => (
        <Window
          key={meta.id}
          id={meta.id}
          title={meta.title}
          accent={meta.accent}
          focused={focusedId === meta.id}
        >
          {renderContent(meta.id)}
        </Window>
      ))}
    </main>
  );
}
