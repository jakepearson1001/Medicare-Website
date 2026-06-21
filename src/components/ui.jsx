import { createContext, useContext, useState, useCallback, useEffect } from 'react';

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

/* ---- Bottom sheet / modal ---- */
export function Sheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        {title && <h2 style={{ fontSize: 20, marginBottom: 14 }}>{title}</h2>}
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
