import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db.js';
import { MUSCLES, repMid } from '../lib/library.js';
import { Sheet, useToast, Empty, NumberInput } from '../components/ui.jsx';
import { ExercisePickerSheet } from '../components/pickers.jsx';
import { IconPlus, IconTrash } from '../components/icons.jsx';

export default function Library() {
  const [tab, setTab] = useState('exercises');
  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <h1>Library</h1>
          <div className="sub">Exercises & day templates for your plan</div>
        </div>
      </div>
      <div className="seg mb">
        <button className={tab === 'exercises' ? 'on' : ''} onClick={() => setTab('exercises')}>
          Exercises
        </button>
        <button className={tab === 'days' ? 'on' : ''} onClick={() => setTab('days')}>
          Days
        </button>
      </div>
      {tab === 'exercises' ? <ExercisesTab /> : <DaysTab />}
    </div>
  );
}

/* ---------------- Exercises ---------------- */
const emptyExercise = () => ({ name: '', muscle: 'Chest', defaultSets: 3, repRange: '8–12', notes: '', isCustom: true });

function ExercisesTab() {
  const toast = useToast();
  const exercises = useLiveQuery(() => db.exercises.orderBy('name').toArray(), []);
  const [search, setSearch] = useState('');
  const [muscle, setMuscle] = useState(null);
  const [editing, setEditing] = useState(null);

  const filtered = (exercises || []).filter((e) => {
    if (muscle && e.muscle !== muscle) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <div className="between mb">
        <div className="faint" style={{ fontSize: 14 }}>{(exercises || []).length} exercises</div>
        <button className="btn sm primary" onClick={() => setEditing(emptyExercise())}>
          <IconPlus width={16} height={16} /> New
        </button>
      </div>
      <input className="input mb" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="chip-row mb">
        {MUSCLES.map((m) => (
          <button key={m} className={`chip ${muscle === m ? 'active' : ''}`} onClick={() => setMuscle((c) => (c === m ? null : m))}>
            {m}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty icon="🏋️" title="No exercises" hint="Tap New to add one." />
      ) : (
        filtered.map((e) => (
          <div key={e.id} className="list-item" onClick={() => setEditing(e)} style={{ cursor: 'pointer' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{e.name}</div>
              <div className="faint" style={{ fontSize: 13 }}>
                {e.muscle} · {e.defaultSets}×{e.repRange}
              </div>
            </div>
            <button
              className="ghost"
              style={{ color: 'var(--text-faint)' }}
              onClick={(ev) => {
                ev.stopPropagation();
                db.exercises.delete(e.id);
                toast('Deleted');
              }}
              aria-label="Delete"
            >
              <IconTrash width={16} height={16} />
            </button>
          </div>
        ))
      )}

      <ExerciseEditor exercise={editing} onClose={() => setEditing(null)} toast={toast} />
    </>
  );
}

function ExerciseEditor({ exercise, onClose, toast }) {
  const [draft, setDraft] = useState(null);
  const key = exercise ? (exercise.id ?? 'new') : null;
  if (exercise && draft?._k !== key) setDraft({ _k: key, ...exercise });
  if (!exercise || !draft) return null;

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  async function save() {
    if (!draft.name.trim()) return toast('Name required');
    const rec = {
      name: draft.name.trim(),
      muscle: draft.muscle,
      defaultSets: Number(draft.defaultSets) || 3,
      repRange: draft.repRange.trim() || '8–12',
      notes: draft.notes || '',
      isCustom: draft.isCustom ?? true,
    };
    if (draft.id) await db.exercises.update(draft.id, rec);
    else await db.exercises.add(rec);
    toast('Saved');
    onClose();
    setDraft(null);
  }

  return (
    <Sheet open={!!exercise} onClose={() => { onClose(); setDraft(null); }} title={draft.id ? 'Edit exercise' : 'New exercise'}>
      <div className="field">
        <label>Name</label>
        <input className="input" value={draft.name} onChange={(e) => set({ name: e.target.value })} />
      </div>
      <div className="field">
        <label>Muscle group</label>
        <select className="select" value={draft.muscle} onChange={(e) => set({ muscle: e.target.value })}>
          {MUSCLES.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <div className="row-2">
        <div className="field">
          <label>Default sets</label>
          <NumberInput value={draft.defaultSets} onChange={(n) => set({ defaultSets: n })} />
        </div>
        <div className="field">
          <label>Rep range</label>
          <input className="input" value={draft.repRange} onChange={(e) => set({ repRange: e.target.value })} placeholder="8–12" />
        </div>
      </div>
      <div className="field">
        <label>Notes (optional)</label>
        <input className="input" value={draft.notes} onChange={(e) => set({ notes: e.target.value })} />
      </div>
      <button className="btn primary full mb" onClick={save}>Save exercise</button>
      {draft.id && (
        <button className="btn danger full" onClick={() => { db.exercises.delete(draft.id); toast('Deleted'); onClose(); setDraft(null); }}>
          Delete exercise
        </button>
      )}
    </Sheet>
  );
}

/* ---------------- Days ---------------- */
const emptyDay = () => ({ name: '', type: 'Push', note: '', exercises: [] });

function DaysTab() {
  const toast = useToast();
  const templates = useLiveQuery(() => db.templates.orderBy('createdAt').toArray(), []);
  const [editing, setEditing] = useState(null);

  return (
    <>
      <div className="between mb">
        <div className="faint" style={{ fontSize: 14 }}>{(templates || []).length} day templates</div>
        <button className="btn sm primary" onClick={() => setEditing(emptyDay())}>
          <IconPlus width={16} height={16} /> New day
        </button>
      </div>

      {(templates || []).length === 0 ? (
        <Empty icon="📋" title="No days yet" hint="Build a push/pull/leg day to reuse in your plan." />
      ) : (
        (templates || []).map((t) => (
          <div key={t.id} className="card tight" onClick={() => setEditing(t)} style={{ cursor: 'pointer' }}>
            <div className="between">
              <div style={{ fontWeight: 700 }}>{t.name}</div>
              {t.type && <span className="tag">{t.type}</span>}
            </div>
            <div className="faint" style={{ fontSize: 13, marginTop: 4 }}>
              {t.exercises.map((e) => e.name).join(' · ')}
            </div>
          </div>
        ))
      )}

      <DayBuilder day={editing} onClose={() => setEditing(null)} toast={toast} />
    </>
  );
}

function DayBuilder({ day, onClose, toast }) {
  const [draft, setDraft] = useState(null);
  const [picker, setPicker] = useState(false);
  const key = day ? (day.id ?? 'new') : null;
  if (day && draft?._k !== key) {
    setDraft({ _k: key, ...day, exercises: day.exercises.map((e) => ({ ...e })) });
  }
  if (!day || !draft) return null;

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const updateEx = (i, patch) =>
    setDraft((d) => ({ ...d, exercises: d.exercises.map((e, j) => (j === i ? { ...e, ...patch } : e)) }));

  async function save() {
    if (!draft.name.trim()) return toast('Name your day');
    const exercises = draft.exercises.map((e) => ({
      name: e.name,
      muscle: e.muscle || '',
      targetSets: Number(e.targetSets) || 3,
      targetReps: e.repRange ? repMid(e.repRange) : Number(e.targetReps) || 10,
      targetWeight: Number(e.targetWeight) || 0,
      repRange: e.repRange || '',
      rir: e.rir || '',
    }));
    const rec = { name: draft.name.trim(), type: draft.type || '', note: draft.note || '', exercises };
    if (draft.id) await db.templates.update(draft.id, rec);
    else await db.templates.add({ ...rec, createdAt: Date.now() });
    toast('Day saved');
    onClose();
    setDraft(null);
  }

  return (
    <Sheet open={!!day} onClose={() => { onClose(); setDraft(null); }} title={draft.id ? 'Edit day' : 'New day'}>
      <div className="row-2">
        <div className="field">
          <label>Name</label>
          <input className="input" value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Push Day" />
        </div>
        <div className="field">
          <label>Type</label>
          <input className="input" value={draft.type} onChange={(e) => set({ type: e.target.value })} placeholder="Push / Upper…" />
        </div>
      </div>

      {draft.exercises.map((ex, i) => (
        <div key={i} className="card tight">
          <div className="flex" style={{ marginBottom: 8 }}>
            <input className="input" style={{ flex: 1 }} value={ex.name} onChange={(e) => updateEx(i, { name: e.target.value })} />
            <button className="btn sm danger" onClick={() => set({ exercises: draft.exercises.filter((_, j) => j !== i) })} aria-label="Remove">
              <IconTrash width={15} height={15} />
            </button>
          </div>
          <div className="row-2">
            <Field label="Sets">
              <NumberInput value={ex.targetSets} onChange={(n) => updateEx(i, { targetSets: n })} />
            </Field>
            <Field label="Reps">
              <input className="input" value={ex.repRange || ex.targetReps || ''} onChange={(e) => updateEx(i, { repRange: e.target.value })} placeholder="8–12" />
            </Field>
            <Field label="Weight (lbs)">
              <NumberInput value={ex.targetWeight} onChange={(n) => updateEx(i, { targetWeight: n })} />
            </Field>
            <Field label="RIR">
              <input className="input" value={ex.rir || ''} onChange={(e) => updateEx(i, { rir: e.target.value })} placeholder="2" />
            </Field>
          </div>
        </div>
      ))}

      <button className="btn full mb" onClick={() => setPicker(true)}>
        <IconPlus width={16} height={16} /> Add exercise
      </button>

      <div className="field">
        <label>Notes (optional)</label>
        <input className="input" value={draft.note} onChange={(e) => set({ note: e.target.value })} />
      </div>

      <button className="btn primary full mb" onClick={save}>Save day</button>
      {draft.id && (
        <button className="btn danger full" onClick={() => { db.templates.delete(draft.id); toast('Deleted'); onClose(); setDraft(null); }}>
          Delete day
        </button>
      )}

      <ExercisePickerSheet
        open={picker}
        onClose={() => setPicker(false)}
        onPick={(block) => {
          set({ exercises: [...draft.exercises, block] });
          setPicker(false);
        }}
      />
    </Sheet>
  );
}

function Field({ label, children }) {
  return (
    <div className="field" style={{ marginBottom: 8 }}>
      <label style={{ fontSize: 11 }}>{label}</label>
      {children}
    </div>
  );
}
