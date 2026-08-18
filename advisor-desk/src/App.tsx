import type { ReactNode } from 'react';
import { TopBar } from './components/TopBar';
import { TickerStrip } from './components/TickerStrip';
import { ToolsBar } from './components/ToolsBar';
import { Taskbar } from './components/Taskbar';
import { Desktop } from './components/Desktop';
import { ClientLookup } from './components/windows/ClientLookup';
import { Outlook } from './components/windows/Outlook';
import { CalendarWindow } from './components/windows/CalendarWindow';
import { QuickLinks } from './components/windows/QuickLinks';
import { Todos } from './components/windows/Todos';
import { CompanyVideos } from './components/windows/CompanyVideos';
import { useIsMobile } from './hooks/useIsMobile';
import { WINDOW_META } from './store/windowStore';
import type { WindowId } from './store/windowStore';

function contentFor(id: WindowId): ReactNode {
  switch (id) {
    case 'clients':
      return <ClientLookup />;
    case 'outlook':
      return <Outlook />;
    case 'calendar':
      return <CalendarWindow />;
    case 'quicklinks':
      return <QuickLinks />;
    case 'todos':
      return <Todos />;
    case 'videos':
      return <CompanyVideos />;
  }
}

/** Below 900px: no floating windows — panels stack as full-width cards. */
function MobileStack() {
  return (
    <main className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3" aria-label="Panels">
      {WINDOW_META.map((meta) => (
        <section
          key={meta.id}
          id={`card-${meta.id}`}
          aria-label={meta.title}
          className="scroll-mt-3 overflow-hidden rounded-win border border-edge bg-panel shadow-win"
        >
          <header className="flex h-10 items-center gap-2 border-b border-edge bg-panel2 px-3">
            <span
              aria-hidden
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: meta.accent }}
            />
            <h2 className="text-[13px] font-semibold text-slate-200">{meta.title}</h2>
          </header>
          <div className="max-h-[70vh] overflow-y-auto" style={{ minHeight: 200 }}>
            {contentFor(meta.id)}
          </div>
        </section>
      ))}
    </main>
  );
}

export default function App() {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-full flex-col">
      <TopBar />
      <TickerStrip />
      <ToolsBar />
      {isMobile ? <MobileStack /> : <Desktop renderContent={contentFor} />}
      <Taskbar
        onNavigate={
          isMobile
            ? (id) => document.getElementById(`card-${id}`)?.scrollIntoView({ behavior: 'smooth' })
            : undefined
        }
      />
    </div>
  );
}
