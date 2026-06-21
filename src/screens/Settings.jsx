import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db.js';
import { SPLIT_OPTIONS } from '../lib/exercises.js';
import { useToast } from '../components/ui.jsx';
import { IconBack } from '../components/icons.jsx';

export default function Settings() {
  const navigate = useNavigate();
  const toast = useToast();
  const settings = useLiveQuery(() => db.settings.get(1), []);
  const [form, setForm] = useState(null);

  if (settings && !form) setForm({ ...settings });
  if (!form) return <div className="screen" />;

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const num = (v) => (v === '' ? '' : Number(v));

  async function save() {
    await db.settings.update(1, {
      dailyCalories: Number(form.dailyCalories) || 0,
      proteinTarget: Number(form.proteinTarget) || 0,
      carbsTarget: Number(form.carbsTarget) || 0,
      fatTarget: Number(form.fatTarget) || 0,
      units: form.units,
      goal: form.goal,
      goalWeight: Number(form.goalWeight) || 0,
      daysPerWeek: Number(form.daysPerWeek) || 4,
      splitType: form.splitType,
    });
    toast('Settings saved');
  }

  async function resetAll() {
    if (!confirm('Erase ALL data and reseed sample data? This cannot be undone.')) return;
    await Promise.all([
      db.settings.clear(),
      db.plans.clear(),
      db.sessions.clear(),
      db.templates.clear(),
      db.recipes.clear(),
      db.mealPlans.clear(),
      db.foodLog.clear(),
    ]);
    location.reload();
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="flex">
          <button className="btn sm ghost" onClick={() => navigate(-1)} aria-label="Back">
            <IconBack width={18} height={18} />
          </button>
          <h1>Settings</h1>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Daily targets</div>
        <div className="row-2">
          <div className="field">
            <label>Calories (kcal)</label>
            <input className="input" type="number" inputMode="numeric" value={form.dailyCalories} onChange={(e) => set({ dailyCalories: num(e.target.value) })} />
          </div>
          <div className="field">
            <label>Protein (g)</label>
            <input className="input" type="number" inputMode="numeric" value={form.proteinTarget} onChange={(e) => set({ proteinTarget: num(e.target.value) })} />
          </div>
          <div className="field">
            <label>Carbs (g)</label>
            <input className="input" type="number" inputMode="numeric" value={form.carbsTarget} onChange={(e) => set({ carbsTarget: num(e.target.value) })} />
          </div>
          <div className="field">
            <label>Fat (g)</label>
            <input className="input" type="number" inputMode="numeric" value={form.fatTarget} onChange={(e) => set({ fatTarget: num(e.target.value) })} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Training preferences</div>
        <div className="field">
          <label>Goal</label>
          <input className="input" value={form.goal} onChange={(e) => set({ goal: e.target.value })} />
        </div>
        <div className="field">
          <label>Target weight (lbs)</label>
          <input className="input" type="number" inputMode="numeric" value={form.goalWeight} onChange={(e) => set({ goalWeight: num(e.target.value) })} />
        </div>
        <div className="field">
          <label>Days per week</label>
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
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <p className="faint" style={{ fontSize: 13 }}>
          Changing days/split here updates your preferences. To rebuild the 52-week calendar, use
          Plan → Setup → Generate.
        </p>
      </div>

      <div className="card">
        <div className="card-title">Units</div>
        <div className="seg">
          <button className={form.units === 'lbs' ? 'on' : ''} onClick={() => set({ units: 'lbs' })}>
            Pounds (lbs)
          </button>
          <button className={form.units === 'kg' ? 'on' : ''} onClick={() => set({ units: 'kg' })}>
            Kilograms (kg)
          </button>
        </div>
      </div>

      <button className="btn primary full mb" onClick={save}>
        Save settings
      </button>
      <button className="btn danger full" onClick={resetAll}>
        Erase all data & reseed
      </button>
    </div>
  );
}
