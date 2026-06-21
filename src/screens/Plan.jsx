import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db.js';
import { generatePlan, blankExercise } from '../lib/plan.js';
import { SPLIT_OPTIONS, SPLITS } from '../lib/exercises.js';
import {
  todayISO,
  toISO,
  fromISO,
  mondayOf,
  addDays,
  weekDayISOs,
  formatShort,
  formatLong,
  formatMonthYear,
  DOW_SHORT,
  dowMon0,
} from '../lib/dates.js';
import { Sheet, useToast, Empty } from '../components/ui.jsx';
import { IconPlus, IconTrash } from '../components/icons.jsx';

function syncSets(ex) {
  const n = Math.max(1, Number(ex.targetSets) || 1);
  return Array.from({ length: n }, (_, i) => ({
    reps: Number(ex.targetReps) || 0,
    weight: Number(ex.targetWeight) || 0,
    done: ex.sets?.[i]?.done || false,
  }));
}

export default function Plan() {
  const toast = useToast();
  const [view, setView] = useState('week'); // 'week' | 'month'
  const [weekStartDate, setWeekStartDate] = useState(() => mondayOf(new Date()));
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [editingDate, setEditingDate] = useState(null);
  const [setupOpen, setSetupOpen] = useState(false);

  const settings = useLiveQuery(() => db.settings.get(1), []);
  const plan = useLiveQuery(() => db.plans.orderBy('createdAt').last(), []);

  if (!settings) return <div className="screen" />;

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <h1>Plan</h1>
          <div className="sub">{plan ? plan.name : 'No plan yet'} · Goal: {settings.goal}</div>
        </div>
        <button className="btn sm" onClick={() => setSetupOpen(true)}>
          Setup
        </button>
      </div>

      <div className="seg mb">
        <button className={view === 'week' ? 'on' : ''} onClick={() => setView('week')}>
          Week
        </button>
        <button className={view === 'month' ? 'on' : ''} onClick={() => setView('month')}>
          Month
        </button>
      </div>

      {view === 'week' ? (
        <WeekView
          weekStartDate={weekStartDate}
          setWeekStartDate={setWeekStartDate}
          onPick={setEditingDate}
        />
      ) : (
        <MonthView monthDate={monthDate} setMonthDate={setMonthDate} onPick={setEditingDate} />
      )}

      <DayEditor date={editingDate} onClose={() => setEditingDate(null)} toast={toast} />
      <SetupSheet
        open={setupOpen}
        onClose={() => setSetupOpen(false)}
        settings={settings}
        toast={toast}
      />
    </div>
  );
}

/* ---------------- Week view ---------------- */
function WeekView({ weekStartDate, setWeekStartDate, onPick }) {
  const isos = weekDayISOs(weekStartDate);
  const sessions = useLiveQuery(
    () => db.sessions.where('date').anyOf(isos).toArray(),
    [isos.join(',')]
  );
  const byDate = {};
  (sessions || []).forEach((s) => (byDate[s.date] = s));
  const today = todayISO();

  return (
    <>
      <div className="between mb">
        <button className="btn sm" onClick={() => setWeekStartDate(addDays(weekStartDate, -7))}>
          ‹ Prev
        </button>
        <div style={{ fontWeight: 600 }}>
          {formatShort(isos[0])} – {formatShort(isos[6])}
        </div>
        <button className="btn sm" onClick={() => setWeekStartDate(addDays(weekStartDate, 7))}>
          Next ›
        </button>
      </div>

      {isos.map((iso, i) => {
        const s = byDate[iso];
        return (
          <button
            key={iso}
            className="card tight"
            style={{
              width: '100%',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              borderColor: iso === today ? 'var(--accent)' : undefined,
            }}
            onClick={() => onPick(iso)}
          >
            <div style={{ width: 44, textAlign: 'center' }}>
              <div className="faint" style={{ fontSize: 11 }}>
                {DOW_SHORT[i]}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{fromISO(iso).getDate()}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{s ? s.title : 'Tap to add'}</div>
              {s && !s.isRest && (
                <div className="faint" style={{ fontSize: 13 }}>
                  {s.exercises.length} exercises
                </div>
              )}
            </div>
            {s?.completed && <span className="tag" style={{ background: 'var(--green-soft)', color: 'var(--green)' }}>Done</span>}
            {s?.type === 'deload' && <span className="tag" style={{ background: 'rgba(56,189,248,.14)', color: 'var(--blue)' }}>Deload</span>}
          </button>
        );
      })}
    </>
  );
}

/* ---------------- Month view ---------------- */
function MonthView({ monthDate, setMonthDate, onPick }) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  const lead = dowMon0(first);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstISO = toISO(new Date(year, month, 1));
  const lastISO = toISO(new Date(year, month, daysInMonth));

  const sessions = useLiveQuery(
    () => db.sessions.where('date').between(firstISO, lastISO, true, true).toArray(),
    [firstISO, lastISO]
  );
  const byDate = {};
  (sessions || []).forEach((s) => (byDate[s.date] = s));
  const today = todayISO();

  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(toISO(new Date(year, month, d)));

  return (
    <>
      <div className="between mb">
        <button className="btn sm" onClick={() => setMonthDate(new Date(year, month - 1, 1))}>
          ‹
        </button>
        <div style={{ fontWeight: 600 }}>{formatMonthYear(monthDate)}</div>
        <button className="btn sm" onClick={() => setMonthDate(new Date(year, month + 1, 1))}>
          ›
        </button>
      </div>
      <div className="cal-grid mb">
        {DOW_SHORT.map((d) => (
          <div key={d} className="cal-dow">
            {d}
          </div>
        ))}
        {cells.map((iso, i) => {
          if (!iso) return <div key={i} className="cal-cell empty-cell" />;
          const s = byDate[iso];
          const cls = [
            'cal-cell',
            iso === today ? 'today' : '',
            s?.completed ? 'done' : '',
            s?.isRest ? 'rest' : '',
            s?.type === 'deload' ? 'deload' : '',
          ].join(' ');
          return (
            <button key={i} className={cls} onClick={() => onPick(iso)}>
              <span>{fromISO(iso).getDate()}</span>
              {s && !s.isRest && <span className="dot" />}
            </button>
          );
        })}
      </div>
      <div className="flex wrap faint" style={{ fontSize: 12, gap: 14 }}>
        <span className="flex" style={{ gap: 5 }}>
          <span className="dot" style={{ position: 'static' }} /> Workout
        </span>
        <span>Green = completed</span>
        <span style={{ color: 'var(--blue)' }}>Blue border = deload</span>
      </div>
    </>
  );
}

/* ---------------- Day editor ---------------- */
function DayEditor({ date, onClose, toast }) {
  const session = useLiveQuery(
    () => (date ? db.sessions.where('date').equals(date).first() : null),
    [date]
  );
  const templates = useLiveQuery(() => db.templates.toArray(), []);
  const [draft, setDraft] = useState(null);
  const [tplName, setTplName] = useState('');

  // Sync local draft when a new session loads.
  const loadedFor = draft?._date;
  if (date && session !== undefined && loadedFor !== date) {
    setDraft({
      _date: date,
      _id: session?.id ?? null,
      title: session?.title || 'Workout',
      isRest: session?.isRest ?? true,
      type: session?.type || 'rest',
      completed: session?.completed || false,
      week: session?.week ?? 1,
      dayOfWeek: session ? session.dayOfWeek : dowMon0(date),
      planId: session?.planId ?? null,
      exercises: session?.exercises?.map((e) => ({ ...e, sets: [...(e.sets || [])] })) || [],
    });
  }

  if (!date || !draft) return null;

  const update = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const updateEx = (idx, patch) =>
    setDraft((d) => ({
      ...d,
      exercises: d.exercises.map((e, i) => (i === idx ? { ...e, ...patch } : e)),
    }));

  async function save() {
    const exercises = draft.exercises.map((e) => ({ ...e, sets: syncSets(e) }));
    const isRest = exercises.length === 0;
    const record = {
      date: draft._date,
      week: draft.week,
      dayOfWeek: draft.dayOfWeek,
      planId: draft.planId,
      title: isRest ? 'Rest Day' : draft.title,
      type: isRest ? 'rest' : draft.type === 'rest' ? 'workout' : draft.type,
      isRest,
      completed: draft.completed,
      exercises,
    };
    if (draft._id) {
      await db.sessions.put({ ...record, id: draft._id });
    } else {
      await db.sessions.add(record);
    }
    toast('Workout saved');
    onClose();
    setDraft(null);
  }

  async function saveTemplate() {
    if (!draft.exercises.length) return toast('Add exercises first');
    await db.templates.add({
      name: tplName.trim() || draft.title || 'Template',
      createdAt: Date.now(),
      exercises: draft.exercises.map((e) => ({
        name: e.name,
        muscle: e.muscle,
        targetSets: e.targetSets,
        targetReps: e.targetReps,
        targetWeight: e.targetWeight,
        sets: [],
      })),
    });
    setTplName('');
    toast('Template saved');
  }

  function useTemplate(tpl) {
    update({
      isRest: false,
      type: 'workout',
      title: tpl.name,
      exercises: tpl.exercises.map((e) => ({ ...e, sets: [] })),
    });
    toast(`Loaded "${tpl.name}"`);
  }

  return (
    <Sheet open={!!date} onClose={() => { onClose(); setDraft(null); }} title={formatLong(date)}>
      <div className="field">
        <label>Workout title</label>
        <input
          className="input"
          value={draft.title}
          onChange={(e) => update({ title: e.target.value, isRest: false })}
          placeholder="e.g. Push Day"
        />
      </div>

      {draft.exercises.map((ex, idx) => (
        <div key={idx} className="card tight">
          <div className="flex" style={{ marginBottom: 8 }}>
            <input
              className="input"
              style={{ flex: 1 }}
              value={ex.name}
              onChange={(e) => updateEx(idx, { name: e.target.value })}
              placeholder="Exercise"
            />
            <button
              className="btn sm danger"
              onClick={() =>
                update({ exercises: draft.exercises.filter((_, i) => i !== idx) })
              }
              aria-label="Remove exercise"
            >
              <IconTrash width={16} height={16} />
            </button>
          </div>
          <div className="row-3">
            <div>
              <label className="faint" style={{ fontSize: 11 }}>
                Sets
              </label>
              <input
                className="input"
                type="number"
                inputMode="numeric"
                value={ex.targetSets}
                onChange={(e) => updateEx(idx, { targetSets: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="faint" style={{ fontSize: 11 }}>
                Reps
              </label>
              <input
                className="input"
                type="number"
                inputMode="numeric"
                value={ex.targetReps}
                onChange={(e) => updateEx(idx, { targetReps: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="faint" style={{ fontSize: 11 }}>
                Weight (lbs)
              </label>
              <input
                className="input"
                type="number"
                inputMode="numeric"
                value={ex.targetWeight}
                onChange={(e) => updateEx(idx, { targetWeight: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
      ))}

      <button
        className="btn full mb"
        onClick={() =>
          update({ exercises: [...draft.exercises, blankExercise()], isRest: false })
        }
      >
        <IconPlus width={18} height={18} /> Add exercise
      </button>

      {draft.exercises.length === 0 && (
        <Empty icon="🛌" title="Rest day" hint="Add an exercise to make this a workout." />
      )}

      <button className="btn primary full mb" onClick={save}>
        Save workout
      </button>

      {/* Templates */}
      <div className="card tight">
        <div className="card-title">Templates</div>
        <div className="flex" style={{ marginBottom: 10 }}>
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder="Template name"
            value={tplName}
            onChange={(e) => setTplName(e.target.value)}
          />
          <button className="btn sm" onClick={saveTemplate}>
            Save current
          </button>
        </div>
        {(templates || []).length === 0 ? (
          <div className="faint" style={{ fontSize: 13 }}>
            No saved templates yet.
          </div>
        ) : (
          (templates || []).map((tpl) => (
            <div key={tpl.id} className="list-item">
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{tpl.name}</div>
                <div className="faint" style={{ fontSize: 12 }}>
                  {tpl.exercises.length} exercises
                </div>
              </div>
              <button className="btn sm" onClick={() => useTemplate(tpl)}>
                Use
              </button>
              <button
                className="btn sm danger"
                onClick={() => db.templates.delete(tpl.id)}
                aria-label="Delete template"
              >
                <IconTrash width={15} height={15} />
              </button>
            </div>
          ))
        )}
      </div>
    </Sheet>
  );
}

/* ---------------- Setup sheet ---------------- */
function SetupSheet({ open, onClose, settings, toast }) {
  const [form, setForm] = useState(null);
  if (open && !form) {
    setForm({
      goal: settings.goal,
      goalWeight: settings.goalWeight,
      daysPerWeek: settings.daysPerWeek,
      splitType: settings.splitType,
      startDate: settings.startDate || todayISO(),
    });
  }
  if (!open) {
    if (form) setForm(null);
    return null;
  }
  if (!form) return null;

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  async function regenerate() {
    // Update settings
    await db.settings.update(1, {
      goal: form.goal,
      goalWeight: Number(form.goalWeight),
      daysPerWeek: Number(form.daysPerWeek),
      splitType: form.splitType,
      startDate: form.startDate,
    });

    // Replace plan + sessions
    await db.sessions.clear();
    await db.plans.clear();
    const planId = await db.plans.add({
      name: '52-Week Plan',
      goal: form.goal,
      goalWeight: Number(form.goalWeight),
      exerciseKey: settings.exerciseKey,
      daysPerWeek: Number(form.daysPerWeek),
      splitType: form.splitType,
      startDate: form.startDate,
      weeks: 52,
      createdAt: Date.now(),
    });
    const sessions = generatePlan({
      planId,
      splitType: form.splitType,
      daysPerWeek: Number(form.daysPerWeek),
      startDate: form.startDate,
      weeks: 52,
    });
    await db.sessions.bulkAdd(sessions);
    toast('52-week plan generated');
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="Plan setup">
      <div className="field">
        <label>Goal</label>
        <input className="input" value={form.goal} onChange={(e) => set({ goal: e.target.value })} />
      </div>
      <div className="field">
        <label>Target weight (lbs)</label>
        <input
          className="input"
          type="number"
          inputMode="numeric"
          value={form.goalWeight}
          onChange={(e) => set({ goalWeight: e.target.value })}
        />
      </div>
      <div className="field">
        <label>Training days per week</label>
        <div className="seg">
          {[2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              className={Number(form.daysPerWeek) === n ? 'on' : ''}
              onClick={() => set({ daysPerWeek: n })}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <label>Split type</label>
        <select
          className="select"
          value={form.splitType}
          onChange={(e) => set({ splitType: e.target.value })}
        >
          {SPLIT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Start date</label>
        <input
          className="input"
          type="date"
          value={form.startDate}
          onChange={(e) => set({ startDate: e.target.value })}
        />
      </div>
      <p className="faint" style={{ fontSize: 13 }}>
        Generates a 52-week {SPLITS[form.splitType]?.label} plan with progressive overload and
        periodic deload weeks. This replaces your current plan and any logged workouts.
      </p>
      <button className="btn primary full" onClick={regenerate}>
        Generate 52-week plan
      </button>
    </Sheet>
  );
}
