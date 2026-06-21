import { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db.js';
import { todayISO, formatLong, addDays, fromISO, toISO } from '../lib/dates.js';
import { logTotals, roundMacros } from '../lib/nutrition.js';
import { analyzeFoodPhoto, friendlyApiError } from '../lib/api.js';
import { MacroBar, Sheet, useToast, Empty } from '../components/ui.jsx';
import { IconCamera, IconPlus, IconTrash } from '../components/icons.jsx';

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const blankItem = () => ({ name: '', qty: 1, calories: 0, protein: 0, carbs: 0, fat: 0 });

export default function Log() {
  const toast = useToast();
  const [date, setDate] = useState(todayISO());
  const [editor, setEditor] = useState(null); // entry draft or null
  const cameraRef = useRef(null);

  const settings = useLiveQuery(() => db.settings.get(1), []);
  const entries = useLiveQuery(
    () => db.foodLog.where('date').equals(date).reverse().sortBy('timestamp'),
    [date]
  );

  if (!settings) return <div className="screen" />;

  const totals = roundMacros(logTotals(entries || []));

  function newManual() {
    setEditor({ id: null, date, photo: null, note: '', source: 'manual', items: [blankItem()], analyzing: false, notice: '' });
  }

  async function onCameraFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const photo = await readFileAsDataURL(file);
    const draft = { id: null, date, photo, note: '', source: 'photo', items: [], analyzing: true, notice: '' };
    setEditor(draft);
    try {
      const { items } = await analyzeFoodPhoto(photo);
      setEditor((d) => (d ? { ...d, items: items.length ? items : [blankItem()], analyzing: false } : d));
    } catch (err) {
      setEditor((d) =>
        d ? { ...d, items: [blankItem()], analyzing: false, notice: friendlyApiError(err) } : d
      );
    }
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <h1>Log</h1>
          <div className="sub">{formatLong(date)}</div>
        </div>
      </div>

      {/* Date browse */}
      <div className="between mb">
        <button className="btn sm" onClick={() => setDate(toISO(addDays(fromISO(date), -1)))}>
          ‹ Prev
        </button>
        <input
          className="input"
          type="date"
          style={{ width: 'auto', minHeight: 36 }}
          value={date}
          max={todayISO()}
          onChange={(e) => setDate(e.target.value)}
        />
        <button
          className="btn sm"
          disabled={date >= todayISO()}
          onClick={() => setDate(toISO(addDays(fromISO(date), 1)))}
        >
          Next ›
        </button>
      </div>

      {/* Totals */}
      <div className="card">
        <div className="card-title">Daily totals</div>
        <MacroBar label="Calories" value={totals.calories} target={settings.dailyCalories} />
        <MacroBar label="Protein" value={totals.protein} target={settings.proteinTarget} unit="g" color="green" />
        <MacroBar label="Carbs" value={totals.carbs} target={settings.carbsTarget} unit="g" />
        <MacroBar label="Fat" value={totals.fat} target={settings.fatTarget} unit="g" />
      </div>

      {/* Actions */}
      <div className="btn-row mb">
        <button className="btn primary full" onClick={() => cameraRef.current?.click()}>
          <IconCamera width={18} height={18} /> Photo
        </button>
        <button className="btn full" onClick={newManual}>
          <IconPlus width={18} height={18} /> Manual
        </button>
      </div>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onCameraFile}
        style={{ display: 'none' }}
      />

      {/* Entries */}
      {(entries || []).length === 0 ? (
        <Empty icon="🍔" title="No entries yet" hint="Snap a photo or add foods manually." />
      ) : (
        (entries || []).map((entry) => {
          const t = roundMacros(logTotals([entry]));
          return (
            <div key={entry.id} className="card tight" style={{ cursor: 'pointer' }} onClick={() => setEditor({ ...entry, analyzing: false, notice: '', items: entry.items.map((i) => ({ ...i })) })}>
              <div className="flex">
                {entry.photo && <img src={entry.photo} alt="" className="thumb-sm" />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>
                    {entry.items.map((i) => i.name).filter(Boolean).join(', ') || 'Food entry'}
                  </div>
                  <div className="faint" style={{ fontSize: 13 }}>
                    {t.calories} kcal · {t.protein}g P · {t.carbs}g C · {t.fat}g F
                  </div>
                  {entry.note && <div className="faint" style={{ fontSize: 12 }}>{entry.note}</div>}
                </div>
              </div>
            </div>
          );
        })
      )}

      <EntryEditor editor={editor} onClose={() => setEditor(null)} toast={toast} />
    </div>
  );
}

function EntryEditor({ editor, onClose, toast }) {
  if (!editor) return null;
  return <EntryEditorInner editor={editor} onClose={onClose} toast={toast} />;
}

function EntryEditorInner({ editor, onClose, toast }) {
  const [draft, setDraft] = useState(editor);
  const loadedKey = draft?._k;
  const key = editor.id ?? editor.photo ?? 'manual';
  // Re-init when a different entry is opened.
  if (loadedKey !== key) {
    setDraft({ ...editor, _k: key });
  }

  const update = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const updateItem = (i, field, value) =>
    setDraft((d) => ({
      ...d,
      items: d.items.map((it, j) =>
        j === i ? { ...it, [field]: field === 'name' ? value : Number(value) || 0 } : it
      ),
    }));

  async function save() {
    const items = draft.items.filter((i) => i.name.trim());
    if (!items.length) return toast('Add at least one food');
    const record = {
      date: draft.date,
      timestamp: draft.timestamp || Date.now(),
      photo: draft.photo || null,
      source: draft.source || 'manual',
      note: draft.note || '',
      items: items.map((i) => ({
        name: i.name.trim(),
        qty: Number(i.qty) || 1,
        calories: Number(i.calories) || 0,
        protein: Number(i.protein) || 0,
        carbs: Number(i.carbs) || 0,
        fat: Number(i.fat) || 0,
      })),
    };
    if (draft.id) {
      await db.foodLog.update(draft.id, record);
    } else {
      await db.foodLog.add(record);
    }
    toast('Entry saved');
    onClose();
  }

  async function remove() {
    if (draft.id) await db.foodLog.delete(draft.id);
    toast('Entry deleted');
    onClose();
  }

  return (
    <Sheet open={!!editor} onClose={onClose} title={draft.id ? 'Edit entry' : 'New entry'}>
      {draft.photo && <img src={draft.photo} alt="" className="thumb mb" />}

      {draft.analyzing && (
        <div className="card tight center muted">📷 Analyzing photo with Claude…</div>
      )}
      {draft.notice && (
        <div className="card tight" style={{ borderColor: 'var(--yellow)', color: 'var(--text-dim)', fontSize: 14 }}>
          {draft.notice}
        </div>
      )}

      <p className="faint" style={{ fontSize: 13 }}>
        Photo estimates are approximate — edit any number before saving.
      </p>

      {draft.items.map((item, i) => (
        <div key={i} className="card tight">
          <div className="flex" style={{ marginBottom: 8 }}>
            <input
              className="input"
              style={{ flex: 1 }}
              placeholder="Food name"
              value={item.name}
              onChange={(e) => updateItem(i, 'name', e.target.value)}
            />
            <button
              className="btn sm danger"
              onClick={() => update({ items: draft.items.filter((_, j) => j !== i) })}
              aria-label="Remove food"
            >
              <IconTrash width={15} height={15} />
            </button>
          </div>
          <div className="row-2">
            <Labeled label="Qty / servings">
              <input className="input" type="number" inputMode="decimal" value={item.qty} onChange={(e) => updateItem(i, 'qty', e.target.value)} />
            </Labeled>
            <Labeled label="Calories">
              <input className="input" type="number" inputMode="numeric" value={item.calories} onChange={(e) => updateItem(i, 'calories', e.target.value)} />
            </Labeled>
            <Labeled label="Protein (g)">
              <input className="input" type="number" inputMode="numeric" value={item.protein} onChange={(e) => updateItem(i, 'protein', e.target.value)} />
            </Labeled>
            <Labeled label="Carbs (g)">
              <input className="input" type="number" inputMode="numeric" value={item.carbs} onChange={(e) => updateItem(i, 'carbs', e.target.value)} />
            </Labeled>
            <Labeled label="Fat (g)">
              <input className="input" type="number" inputMode="numeric" value={item.fat} onChange={(e) => updateItem(i, 'fat', e.target.value)} />
            </Labeled>
          </div>
        </div>
      ))}

      <button className="btn full mb" onClick={() => update({ items: [...draft.items, blankItem()] })}>
        <IconPlus width={16} height={16} /> Add food
      </button>

      <div className="field">
        <label>Note</label>
        <input className="input" value={draft.note} onChange={(e) => update({ note: e.target.value })} />
      </div>

      <button className="btn primary full mb" onClick={save} disabled={draft.analyzing}>
        Save entry
      </button>
      {draft.id && (
        <button className="btn danger full" onClick={remove}>
          Delete entry
        </button>
      )}
    </Sheet>
  );
}

function Labeled({ label, children }) {
  return (
    <div className="field" style={{ marginBottom: 8 }}>
      <label style={{ fontSize: 11 }}>{label}</label>
      {children}
    </div>
  );
}
