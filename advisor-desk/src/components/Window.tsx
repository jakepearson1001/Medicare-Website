import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Minus, Square, X } from 'lucide-react';
import { useWindowStore } from '../store/windowStore';
import type { WindowId } from '../store/windowStore';

const MIN_W = 280;
const MIN_H = 160;
const HEADER_H = 40;

interface WindowProps {
  id: WindowId;
  title: string;
  accent: string;
  focused: boolean;
  children: ReactNode;
}

interface DragSession {
  kind: 'move' | 'resize';
  startX: number;
  startY: number;
  base: { x: number; y: number; w: number; h: number };
  dx: number;
  dy: number;
  raf: number;
}

/**
 * Draggable, resizable desktop window. During a drag, movement is applied via
 * transform inside requestAnimationFrame (no layout writes); the final
 * geometry is committed to the store — and persisted — on pointer-up.
 */
export function Window({ id, title, accent, focused, children }: WindowProps) {
  const win = useWindowStore((s) => s.windows[id]);
  const { focusWindow, closeWindow, minimizeWindow, toggleMaximize, setGeometry } =
    useWindowStore.getState();

  const rootRef = useRef<HTMLDivElement>(null);
  const session = useRef<DragSession | null>(null);

  // Keep pointermove/up handlers attached to the element that captured the pointer.
  useEffect(() => () => {
    if (session.current) cancelAnimationFrame(session.current.raf);
  }, []);

  if (!win.open || win.minimized) return null;

  const deskSize = () => {
    const parent = rootRef.current?.parentElement;
    return parent
      ? { w: parent.clientWidth, h: parent.clientHeight }
      : { w: window.innerWidth, h: window.innerHeight };
  };

  const clampMove = (x: number, y: number) => {
    const desk = deskSize();
    return {
      x: Math.max(0, Math.min(x, Math.max(0, desk.w - win.w))),
      y: Math.max(0, Math.min(y, Math.max(0, desk.h - HEADER_H))),
    };
  };

  const clampSize = (w: number, h: number) => {
    const desk = deskSize();
    return {
      w: Math.max(MIN_W, Math.min(w, desk.w - win.x)),
      h: Math.max(MIN_H, Math.min(h, desk.h - win.y)),
    };
  };

  const beginDrag = (e: React.PointerEvent, kind: DragSession['kind']) => {
    if (win.maximized) return;
    if (e.button !== 0) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    session.current = {
      kind,
      startX: e.clientX,
      startY: e.clientY,
      base: { x: win.x, y: win.y, w: win.w, h: win.h },
      dx: 0,
      dy: 0,
      raf: 0,
    };
    focusWindow(id);
  };

  const onDragMove = (e: React.PointerEvent) => {
    const s = session.current;
    if (!s) return;
    s.dx = e.clientX - s.startX;
    s.dy = e.clientY - s.startY;
    cancelAnimationFrame(s.raf);
    s.raf = requestAnimationFrame(() => {
      const el = rootRef.current;
      if (!el || !session.current) return;
      if (s.kind === 'move') {
        const next = clampMove(s.base.x + s.dx, s.base.y + s.dy);
        el.style.transform = `translate(${next.x - s.base.x}px, ${next.y - s.base.y}px)`;
      } else {
        const next = clampSize(s.base.w + s.dx, s.base.h + s.dy);
        el.style.width = `${next.w}px`;
        el.style.height = `${next.h}px`;
      }
    });
  };

  const onDragEnd = () => {
    const s = session.current;
    if (!s) return;
    session.current = null;
    cancelAnimationFrame(s.raf);
    const el = rootRef.current;
    if (el) {
      el.style.transform = '';
      el.style.width = '';
      el.style.height = '';
    }
    if (s.kind === 'move') {
      setGeometry(id, clampMove(s.base.x + s.dx, s.base.y + s.dy));
    } else {
      setGeometry(id, clampSize(s.base.w + s.dx, s.base.h + s.dy));
    }
  };

  const geometry = win.maximized
    ? { left: 0, top: 0, width: '100%', height: '100%' }
    : { left: win.x, top: win.y, width: win.w, height: win.h };

  return (
    <section
      ref={rootRef}
      role="dialog"
      aria-label={title}
      tabIndex={-1}
      className={`win-transition absolute flex flex-col overflow-hidden rounded-win border bg-panel shadow-win ${
        focused ? 'border-brass' : 'border-edge'
      }`}
      style={{ ...geometry, zIndex: win.z }}
      onPointerDown={() => focusWindow(id)}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !e.defaultPrevented) {
          closeWindow(id);
        }
      }}
    >
      <header
        className="flex h-10 shrink-0 cursor-grab select-none items-center gap-2 border-b border-edge bg-panel2 px-3 active:cursor-grabbing"
        onPointerDown={(e) => beginDrag(e, 'move')}
        onPointerMove={onDragMove}
        onPointerUp={onDragEnd}
        onPointerCancel={onDragEnd}
        onDoubleClick={() => toggleMaximize(id)}
      >
        <span
          aria-hidden
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: accent }}
        />
        <h2 className="min-w-0 flex-1 truncate text-[13px] font-semibold text-slate-200">
          {title}
        </h2>
        <div
          className="flex shrink-0 items-center gap-1"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            aria-label={`Minimize ${title}`}
            className="rounded p-1 text-slate-400 hover:bg-edge hover:text-slate-100"
            onClick={() => minimizeWindow(id)}
          >
            <Minus size={14} />
          </button>
          <button
            type="button"
            aria-label={win.maximized ? `Restore ${title}` : `Maximize ${title}`}
            className="rounded p-1 text-slate-400 hover:bg-edge hover:text-slate-100"
            onClick={() => toggleMaximize(id)}
          >
            <Square size={12} />
          </button>
          <button
            type="button"
            aria-label={`Close ${title}`}
            className="rounded p-1 text-slate-400 hover:bg-accred hover:text-white"
            onClick={() => closeWindow(id)}
          >
            <X size={14} />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto">{children}</div>

      {!win.maximized && (
        <div
          role="separator"
          aria-label={`Resize ${title}`}
          className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize"
          onPointerDown={(e) => beginDrag(e, 'resize')}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4 text-edge" aria-hidden>
            <path d="M15 9v6H9l6-6zM15 3v3L6 15H3L15 3z" fill="currentColor" opacity="0.8" />
          </svg>
        </div>
      )}
    </section>
  );
}
