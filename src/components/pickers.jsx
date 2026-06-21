import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db.js';
import { repMid } from '../lib/library.js';
import { Sheet, Empty } from './ui.jsx';
import { IconPlus } from './icons.jsx';

// Convert a library exercise record into a plan/template exercise block.
export function exerciseToBlock(libEx) {
  return {
    name: libEx.name,
    muscle: libEx.muscle || '',
    targetSets: libEx.defaultSets || 3,
    targetReps: repMid(libEx.repRange),
    targetWeight: 0,
    repRange: libEx.repRange || '',
    rir: '',
  };
}

/* Pick a single exercise from the library (or define a custom one). */
export function ExercisePickerSheet({ open, onClose, onPick }) {
  const exercises = useLiveQuery(() => db.exercises.orderBy('name').toArray(), []);
  const [search, setSearch] = useState('');
  const [muscle, setMuscle] = useState(null);

  if (!open) return null;

  const muscles = [...new Set((exercises || []).map((e) => e.muscle))].sort();
  const filtered = (exercises || []).filter((e) => {
    if (muscle && e.muscle !== muscle) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const addCustom = () => {
    const name = search.trim();
    if (!name) return;
    onPick({ name, muscle: muscle || '', targetSets: 3, targetReps: 10, targetWeight: 0, repRange: '', rir: '' });
  };

  return (
    <Sheet open={open} onClose={onClose} title="Add exercise">
      <input
        className="input mb"
        placeholder="Search or type a custom name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="chip-row mb">
        {muscles.map((m) => (
          <button
            key={m}
            className={`chip ${muscle === m ? 'active' : ''}`}
            onClick={() => setMuscle((cur) => (cur === m ? null : m))}
          >
            {m}
          </button>
        ))}
      </div>

      {search.trim() && !filtered.some((e) => e.name.toLowerCase() === search.trim().toLowerCase()) && (
        <button className="btn full mb" onClick={addCustom}>
          <IconPlus width={16} height={16} /> Add custom “{search.trim()}”
        </button>
      )}

      {filtered.length === 0 ? (
        <Empty icon="🏋️" title="No matches" hint="Type a name to add it as custom." />
      ) : (
        filtered.map((e) => (
          <button
            key={e.id}
            className="list-item"
            style={{ width: '100%', textAlign: 'left', background: 'none' }}
            onClick={() => onPick(exerciseToBlock(e))}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{e.name}</div>
              <div className="faint" style={{ fontSize: 13 }}>
                {e.muscle} · {e.defaultSets}×{e.repRange}
              </div>
            </div>
            <IconPlus width={18} height={18} />
          </button>
        ))
      )}
    </Sheet>
  );
}

/* Pick a whole day template from the library. */
export function DayPickerSheet({ open, onClose, onPick }) {
  const templates = useLiveQuery(() => db.templates.orderBy('createdAt').toArray(), []);
  if (!open) return null;
  return (
    <Sheet open={open} onClose={onClose} title="Add a full day">
      {(templates || []).length === 0 ? (
        <Empty icon="📋" title="No day templates" hint="Build days in the Library tab." />
      ) : (
        (templates || []).map((t) => (
          <button
            key={t.id}
            className="list-item"
            style={{ width: '100%', textAlign: 'left', background: 'none' }}
            onClick={() => onPick(t)}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{t.name}</div>
              <div className="faint" style={{ fontSize: 13 }}>
                {t.type ? `${t.type} · ` : ''}
                {t.exercises.length} exercises
              </div>
            </div>
            <IconPlus width={18} height={18} />
          </button>
        ))
      )}
    </Sheet>
  );
}
