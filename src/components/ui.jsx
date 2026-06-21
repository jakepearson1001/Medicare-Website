import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

/* ---- Toast ---- */
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null);
  const show = useCallback((text) => setMsg(text), []);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 1800);
    return () => clearTimeout(t);
  }, [msg]);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && <div className="toast">{msg}</div>}
    </ToastCtx.Provider>
  );
}

/* ---- Bottom sheet / modal ----
   Closes on backdrop tap, Escape, the ✕ button, or a downward swipe on the
   top handle — none of which require saving. */
export function Sheet({ open, onClose, title, children }) {
  const sheetRef = useRef(null);
  const drag = useRef({ startY: 0, dy: 0, active: false });

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const setTranslate = (y) => {
    if (sheetRef.current) sheetRef.current.style.transform = y ? `translateY(${y}px)` : '';
  };

  const onStart = (e) => {
    drag.current = { startY: e.touches[0].clientY, dy: 0, active: true };
  };
  const onMove = (e) => {
    if (!drag.current.active) return;
    const dy = e.touches[0].clientY - drag.current.startY;
    drag.current.dy = dy;
    if (dy > 0) setTranslate(dy);
  };
  const onEnd = () => {
    if (!drag.current.active) return;
    const { dy } = drag.current;
    drag.current.active = false;
    if (dy > 110) onClose();
    else setTranslate(0);
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div ref={sheetRef} className="sheet" onClick={(e) => e.stopPropagation()}>
        <div
          className="sheet-grab"
          onTouchStart={onStart}
          onTouchMove={onMove}
          onTouchEnd={onEnd}
        >
          <div className="sheet-handle" />
        </div>
        <div className="between" style={{ marginBottom: 14 }}>
          <h2 style={{ fontSize: 20 }}>{title || ''}</h2>
          <button className="sheet-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---- Progress bar with label ---- */
export function MacroBar({ label, value, target, unit = '', color }) {
  const pct = target ? Math.min(100, Math.round((value / target) * 100)) : 0;
  const over = target && value > target;
  return (
    <div style={{ marginBottom: 12 }}>
      <div className="between" style={{ marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          {Math.round(value)}
          {unit} <span className="faint">/ {target}{unit}</span>
        </span>
      </div>
      <div className={`bar ${color === 'green' ? 'green' : ''} ${over ? 'over' : ''}`}>
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ---- Number input that can actually be cleared ----
   Keeps its own text so you can empty it (shows a 0 placeholder) and type
   decimals like 0.5, while reporting a number to the parent. */
export function NumberInput({ value, onChange, className = 'input', placeholder = '0', ...rest }) {
  const [text, setText] = useState(value === 0 || value == null ? '' : String(value));
  const ext = useRef(value);
  useEffect(() => {
    if (value !== ext.current) {
      ext.current = value;
      setText(value === 0 || value == null ? '' : String(value));
    }
  }, [value]);
  return (
    <input
      {...rest}
      className={className}
      type="number"
      inputMode={rest.inputMode || 'decimal'}
      placeholder={placeholder}
      value={text}
      onChange={(e) => {
        const t = e.target.value;
        setText(t);
        const n = t === '' ? 0 : Number(t);
        if (!Number.isNaN(n)) {
          ext.current = n;
          onChange(n);
        }
      }}
    />
  );
}

/* ---- Stat tile ---- */
export function Stat({ num, label, accent }) {
  return (
    <div className="stat">
      <div className="num" style={accent ? { color: 'var(--accent)' } : undefined}>
        {num}
      </div>
      <div className="lbl">{label}</div>
    </div>
  );
}

/* ---- Empty state ---- */
export function Empty({ icon = '✨', title, hint }) {
  return (
    <div className="empty">
      <div className="big">{icon}</div>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{title}</div>
      {hint && <div style={{ fontSize: 14 }}>{hint}</div>}
    </div>
  );
}
