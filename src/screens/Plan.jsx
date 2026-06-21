import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db.js';
import { generatePlan } from '../lib/plan.js';
import { SPLIT_OPTIONS, SPLITS } from '../lib/exercises.js';
import { repMid, CYCLE_TYPES, colorForType } from '../lib/library.js';
import { cycleForDate, cyclePosition, tint } from '../lib/cycles.js';
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
import { Sheet, useToast, Empty, NumberInput } from '../components/ui.jsx';
import { ExercisePickerSheet, DayPickerSheet } from '../components/pickers.jsx';
import { IconPlus, IconTrash } from '../components/icons.jsx';

function syncSets(ex) {
  const n = Math.max(1, Number(ex.targetSets) || 1);
  const reps = ex.repRange ? repMid(ex.repRange) : Number(ex.targetReps) || 0;
  return Array.from({ length: n }, (_, i) => ({
    reps,
    weight: Number(ex.targetWeight) || 0,
    done: ex.sets?.[i]?.done || false,
  }));
}

export default function Plan() {
  const toast = useToast();
  const [view, setView] = useState('week');
  const [weekStartDate, setWeekStartDate] = useState(() => mondayOf(new Date()));
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [editingDate, setEditingDate] = useState(null);
  const [setupOpen, setSetupOpen] = useState(false);
  const [cyclesOpen, setCyclesOpen] = useState(false);

  const settings = useLiveQuery(() => db.settings.get(1), []);
  const plan = useLiveQuery(() => db.plans.orderBy('createdAt').last(), []);
  const cycles = useLiveQuery(() => db.cycles.orderBy('startDate').toArray(), []);

  if (!settings) return <div className="screen" />;

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <h1>Plan</h1>
          <div className="sub">{plan ? plan.name : 'No plan yet'} · {settings.goal}</div>
        </div>
        <div className="flex" style={{ gap: 6 }}>
          <button className="btn sm" onClick={() => setCyclesOpen(true)}>
            Cycles
          </button>
          <button className="btn sm" onClick={() => setSetupOpen(true)}>
            Setup
          </button>
        </div>
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
          cycles={cycles}
          onEditCycles={() => setCyclesOpen(true)}
        />
      ) : (
        <MonthView monthDate={monthDate} setMonthDate={setMonthDate} onPick={setEditingDate} cycles={cycles} />
      )}

      <DayEditor date={editingDate} onClose={() => setEditingDate(null)} toast={toast} />
      <SetupSheet open={setupOpen} onClose={() => setSetupOpen(false)} settings={settings} toast={toast} />
      <CyclesSheet open={cyclesOpen} onClose={() => setCyclesOpen(false)} cycles={cycles} toast={toast} />
    </div>
  );
}

/* ---------------- Cycle banner ---------------- */
function CycleBanner({ cycle, iso, onEdit }) {
  if (!cycle) {
    return (
      <button className="card tight" style={{ width: '100%', textAlign: 'left' }} onClick={onEdit}>
        <div className="faint" style={{ fontSize: 13 }}>No cycle set for this week — tap to add one.</div>
      </button>
    );
  }
  const pos = cyclePosition(cycle, iso);
  return (
    <button
      className="card tight"
      style={{ width: '100%', textAlign: 'left', borderLeft: `4px solid ${cycle.color}` }}
      onClick={onEdit}
    >
      <div className="between">
        <div style={{ fontWeight: 700 }}>{cycle.name}</div>
        <span className="tag" style={{ background: tint(cycle.color, 0.16), color: cycle.color }}>
          {cycle.type}
        </span>
      </div>
      <div className="faint" style={{ fontSize: 13, marginTop: 3 }}>
        Week {pos.week} of {pos.total}
        {cycle.note ? ` · ${cycle.note}` : ''}
      </div>
    </button>
  );
}

/* ---------------- Week view ---------------- */
function WeekView({ weekStartDate, setWeekStartDate, onPick, cycles, onEditCycles }) {
  const isos = weekDayISOs(weekStartDate);
  const sessions = useLiveQuery(() => db.sessions.where('date').anyOf(isos).toArray(), [isos.join(',')]);
  const byDate = {};
  (sessions || []).forEach((s) => (byDate[s.date] = s));
  const today = todayISO();
  const weekCycle = cycleForDate(cycles, isos[3]);

  return (
    <>
      <div className="between mb">
        <button className="btn sm" onClick={() => setWeekStartDate(addDays(weekStartDate, -7))}>‹ Prev</button>
        <div style={{ fontWeight: 600 }}>
          {formatShort(isos[0])} – {formatShort(isos[6])}
        </div>
        <button className="btn sm" onClick={() => setWeekStartDate(addDays(weekStartDate, 7))}>Next ›</button>
      </div>

      <CycleBanner cycle={weekCycle} iso={isos[3]} onEdit={onEditCycles} />

      {isos.map((iso, i) => {
        const s = byDate[iso];
        const c = cycleForDate(cycles, iso);
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
              borderLeft: c ? `4px solid ${c.color}` : undefined,
            }}
            onClick={() => onPick(iso)}
          >
            <div style={{ width: 44, textAlign: 'center' }}>
              <div className="faint" style={{ fontSize: 11 }}>{DOW_SHORT[i]}</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{fromISO(iso).getDate()}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{s ? s.title : 'Tap to add'}</div>
              {s && !s.isRest && (
                <div className="faint" style={{ fontSize: 13 }}>{s.exercises.length} exercises</div>
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
function MonthView({ monthDate, setMonthDate, onPick, cycles }) {
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

  // Which cycles appear this month (for the legend).
  const monthCycles = (cycles || []).filter((c) => c.startDate <= lastISO && c.endDate >= firstISO);

  return (
    <>
      <div className="between mb">
        <button className="btn sm" onClick={() => setMonthDate(new Date(year, month - 1, 1))}>‹</button>
        <div style={{ fontWeight: 600 }}>{formatMonthYear(monthDate)}</div>
        <button className="btn sm" onClick={() => setMonthDate(new Date(year, month + 1, 1))}>›</button>
      </div>
      <div className="cal-grid mb">
        {DOW_SHORT.map((d) => (
          <div key={d} className="cal-dow">{d}</div>
        ))}
        {cells.map((iso, i) => {
          if (!iso) return <div key={i} className="cal-cell empty-cell" />;
          const s = byDate[iso];
          const c = cycleForDate(cycles, iso);
          const cls = ['cal-cell', iso === today ? 'today' : '', s?.completed ? 'done' : '', s?.isRest ? 'rest' : ''].join(' ');
          const style = c
            ? { background: tint(c.color, 0.16), borderBottom: `3px solid ${c.color}` }
            : undefined;
          return (
            <button key={i} className={cls} style={style} onClick={() => onPick(iso)}>
              <span>{fromISO(iso).getDate()}</span>
              {s && !s.isRest && <span className="dot" />}
            </button>
          );
        })}
      </div>

      {monthCycles.length > 0 && (
        <div className="card tight">
          <div className="card-title">Cycles this month</div>
          {monthCycles.map((c) => (
            <div key={c.id} className="flex" style={{ padding: '4px 0' }}>
              <span style={{ width: 14, height: 14, borderRadius: 4, background: c.color }} />
              <span style={{ flex: 1, fontSize: 14 }}>{c.name}</span>
              <span className="faint" style={{ fontSize: 12 }}>
                {formatShort(c.startDate)}–{formatShort(c.endDate)}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ---------------- Day editor ---------------- */
function DayEditor({ date, onClose, toast }) {
  const session = useLiveQuery(
    () => (date ? db.sessions.where('date').equals(date).first() : null),
    [date]
  );
  const [draft, setDraft] = useState(null);
  const [exPicker, setExPicker] = useState(false);
  const [dayPicker, setDayPicker] = useState(false);

  const loadedFor = draft?._date;
  if (date && session !== undefined && loadedFor !== date) {
    setDraft({
      _date: date,
      _id: session?.id ?? null,
      title: session?.title || 'Workout',
      type: session?.type || 'rest',
      completed: session?.completed || false,
      week: session?.week ?? 1,
      dayOfWeek: session ? session.dayOfWeek : dowMon0(date),
      planId: session?.planId ?? null,
      exercises: session?.exercises?.map((e) => ({ ...e, sets: [...(e.sets || [])] })) || [],
    });
  }

  if (!date || !draft) return null;

  const close = () => { onClose(); setDraft(null); };
  const update = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const updateEx = (idx, patch) =>
    setDraft((d) => ({ ...d, exercises: d.exercises.map((e, i) => (i === idx ? { ...e, ...patch } : e)) }));

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
    if (draft._id) await db.sessions.put({ ...record, id: draft._id });
    else await db.sessions.add(record);
    toast('Workout saved');
    close();
  }

  function addDay(tpl) {
    const blocks = tpl.exercises.map((e) => ({ ...e, sets: [] }));
    const titleIsBlank = !draft.title || draft.title === 'Rest Day' || draft.title === 'Workout';
    update({
      exercises: [...draft.exercises, ...blocks],
      type: 'workout',
      title: titleIsBlank ? tpl.name : draft.title,
    });
    setDayPicker(false);
    toast(`Added ${tpl.name}`);
  }

  return (
    <Sheet open={!!date} onClose={close} title={formatLong(date)}>
      <div className="field">
        <label>Workout title</label>
        <input
          className="input"
          value={draft.title}
          onChange={(e) => update({ title: e.target.value, type: draft.type === 'rest' ? 'workout' : draft.type })}
          placeholder="e.g. Push Day"
        />
      </div>

      {draft.exercises.map((ex, idx) => (
        <div key={idx} className="card tight">
          <div className="flex" style={{ marginBottom: 8 }}>
            <input className="input" style={{ flex: 1 }} value={ex.name} onChange={(e) => updateEx(idx, { name: e.target.value })} placeholder="Exercise" />
            <button
              className="btn sm danger"
              onClick={() => update({ exercises: draft.exercises.filter((_, i) => i !== idx) })}
              aria-label="Remove exercise"
            >
              <IconTrash width={16} height={16} />
            </button>
          </div>
          <div className="row-2">
            <Field label="Sets">
              <NumberInput value={ex.targetSets} onChange={(n) => updateEx(idx, { targetSets: n })} />
            </Field>
            <Field label="Reps">
              <input className="input" value={ex.repRange || ex.targetReps || ''} onChange={(e) => updateEx(idx, { repRange: e.target.value })} placeholder="8–12" />
            </Field>
            <Field label="Weight (lbs)">
              <NumberInput value={ex.targetWeight} onChange={(n) => updateEx(idx, { targetWeight: n })} />
            </Field>
            <Field label="RIR">
              <input className="input" value={ex.rir || ''} onChange={(e) => updateEx(idx, { rir: e.target.value })} placeholder="2" />
            </Field>
          </div>
        </div>
      ))}

      <div className="btn-row mb">
        <button className="btn full" onClick={() => setExPicker(true)}>
          <IconPlus width={16} height={16} /> Add exercise
        </button>
        <button className="btn full" onClick={() => setDayPicker(true)}>
          <IconPlus width={16} height={16} /> Add full day
        </button>
      </div>

      {draft.exercises.length === 0 && (
        <Empty icon="🛌" title="Rest day" hint="Add an exercise or a full day from your library." />
      )}

      <button className="btn primary full" onClick={save}>Save workout</button>

      <ExercisePickerSheet
        open={exPicker}
        onClose={() => setExPicker(false)}
        onPick={(block) => {
          update({ exercises: [...draft.exercises, block], type: draft.type === 'rest' ? 'workout' : draft.type });
          setExPicker(false);
        }}
      />
      <DayPickerSheet open={dayPicker} onClose={() => setDayPicker(false)} onPick={addDay} />
    </Sheet>
  );
}

/* ---------------- Cycles manager ---------------- */
const newCycle = () => ({
  name: '',
  type: 'Bulk',
  color: colorForType('Bulk'),
  startDate: todayISO(),
  endDate: toISO(addDays(new Date(), 7 * 12 - 1)),
  note: '',
});

function CyclesSheet({ open, onClose, cycles, toast }) {
  const [editing, setEditing] = useState(null);
  if (!open) return null;

  return (
    <Sheet open={open} onClose={onClose} title="Training cycles">
      {!editing ? (
        <>
          <p className="faint" style={{ fontSize: 13 }}>
            Cycles (bulk, cut, etc.) color-code your calendar so you can see how long each phase runs.
          </p>
          {(cycles || []).length === 0 ? (
            <Empty icon="📈" title="No cycles yet" hint="Add your first phase." />
          ) : (
            (cycles || []).map((c) => (
              <button
                key={c.id}
                className="card tight"
                style={{ width: '100%', textAlign: 'left', borderLeft: `4px solid ${c.color}` }}
                onClick={() => setEditing({ ...c })}
              >
                <div className="between">
                  <div style={{ fontWeight: 700 }}>{c.name}</div>
                  <span className="tag" style={{ background: tint(c.color, 0.16), color: c.color }}>{c.type}</span>
                </div>
                <div className="faint" style={{ fontSize: 13, marginTop: 3 }}>
                  {formatShort(c.startDate)} – {formatShort(c.endDate)}
                </div>
              </button>
            ))
          )}
          <button className="btn primary full mt" onClick={() => setEditing(newCycle())}>
            <IconPlus width={16} height={16} /> New cycle
          </button>
        </>
      ) : (
        <CycleForm
          cycle={editing}
          onCancel={() => setEditing(null)}
          onSaved={() => setEditing(null)}
          toast={toast}
        />
      )}
    </Sheet>
  );
}

function CycleForm({ cycle, onCancel, onSaved, toast }) {
  const [draft, setDraft] = useState(cycle);
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  async function save() {
    if (!draft.name.trim()) return toast('Name the cycle');
    if (draft.endDate < draft.startDate) return toast('End date is before start');
    const rec = {
      name: draft.name.trim(),
      type: draft.type,
      color: draft.color,
      startDate: draft.startDate,
      endDate: draft.endDate,
      note: draft.note || '',
    };
    if (draft.id) await db.cycles.update(draft.id, rec);
    else await db.cycles.add(rec);
    toast('Cycle saved');
    onSaved();
  }

  return (
    <>
      <div className="field">
        <label>Name</label>
        <input className="input" value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Lean Bulk" />
      </div>
      <div className="field">
        <label>Type</label>
        <div className="chip-row">
          {CYCLE_TYPES.map((t) => (
            <button
              key={t.type}
              className={`chip ${draft.type === t.type ? 'active' : ''}`}
              style={draft.type === t.type ? { background: tint(t.color, 0.18), borderColor: t.color, color: t.color } : undefined}
              onClick={() => set({ type: t.type, color: t.color, note: draft.note || t.calorieNote })}
            >
              {t.type}
            </button>
          ))}
        </div>
      </div>
      <div className="row-2">
        <div className="field">
          <label>Start date</label>
          <input className="input" type="date" value={draft.startDate} onChange={(e) => set({ startDate: e.target.value })} />
        </div>
        <div className="field">
          <label>End date</label>
          <input className="input" type="date" value={draft.endDate} onChange={(e) => set({ endDate: e.target.value })} />
        </div>
      </div>
      <div className="field">
        <label>Note (calories, focus…)</label>
        <input className="input" value={draft.note} onChange={(e) => set({ note: e.target.value })} />
      </div>
      <button className="btn primary full mb" onClick={save}>Save cycle</button>
      <div className="btn-row">
        <button className="btn full" onClick={onCancel}>Back</button>
        {draft.id && (
          <button className="btn danger full" onClick={() => { db.cycles.delete(draft.id); toast('Deleted'); onSaved(); }}>
            Delete
          </button>
        )}
      </div>
    </>
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
    await db.settings.update(1, {
      goal: form.goal,
      goalWeight: Number(form.goalWeight),
      daysPerWeek: Number(form.daysPerWeek),
      splitType: form.splitType,
      startDate: form.startDate,
    });
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
        <NumberInput value={form.goalWeight} onChange={(n) => set({ goalWeight: n })} />
      </div>
      <div className="field">
        <label>Training days per week</label>
        <div className="seg">
          {[2, 3, 4, 5, 6].map((n) => (
            <button key={n} className={Number(form.daysPerWeek) === n ? 'on' : ''} onClick={() => set({ daysPerWeek: n })}>
              {n}
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <label>Split type</label>
        <select className="select" value={form.splitType} onChange={(e) => set({ splitType: e.target.value })}>
          {SPLIT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Start date</label>
        <input className="input" type="date" value={form.startDate} onChange={(e) => set({ startDate: e.target.value })} />
      </div>
      <p className="faint" style={{ fontSize: 13 }}>
        Generates a 52-week {SPLITS[form.splitType]?.label} plan with progressive overload and
        periodic deloads. This replaces your current plan and logged workouts (your library and
        cycles are kept).
      </p>
      <button className="btn primary full" onClick={regenerate}>Generate 52-week plan</button>
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
