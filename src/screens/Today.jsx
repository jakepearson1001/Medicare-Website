import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db.js';
import { todayISO, mondayOf, toISO, formatLong, dowMon0 } from '../lib/dates.js';
import {
  recipeIndex,
  dayTotals,
  logTotals,
  addMacros,
  roundMacros,
  MEAL_SLOTS,
  SLOT_LABELS,
} from '../lib/nutrition.js';
import { MacroBar, Stat, useToast, Empty } from '../components/ui.jsx';
import { IconCheck, IconCamera, IconPlan } from '../components/icons.jsx';

export default function Today() {
  const navigate = useNavigate();
  const toast = useToast();
  const date = todayISO();

  const settings = useLiveQuery(() => db.settings.get(1), []);
  const session = useLiveQuery(() => db.sessions.where('date').equals(date).first(), [date]);
  const recipes = useLiveQuery(() => db.recipes.toArray(), []);
  const mealPlan = useLiveQuery(
    () => db.mealPlans.where('weekStart').equals(toISO(mondayOf(new Date()))).first(),
    []
  );
  const logEntries = useLiveQuery(() => db.foodLog.where('date').equals(date).toArray(), [date]);

  if (!settings) return <div className="screen" />;

  const recipesById = recipeIndex(recipes);
  const dayIndex = dowMon0(date);
  const daySlots = mealPlan?.slots?.[dayIndex];
  const plannedMacros = roundMacros(dayTotals(daySlots, recipesById));
  const loggedMacros = roundMacros(logTotals(logEntries));

  async function toggleSet(exIdx, setIdx) {
    const s = { ...session };
    s.exercises = s.exercises.map((ex, i) =>
      i !== exIdx
        ? ex
        : { ...ex, sets: ex.sets.map((set, j) => (j === setIdx ? { ...set, done: !set.done } : set)) }
    );
    await db.sessions.put(s);
  }

  async function updateSetField(exIdx, setIdx, field, value) {
    const s = { ...session };
    s.exercises = s.exercises.map((ex, i) =>
      i !== exIdx
        ? ex
        : {
            ...ex,
            sets: ex.sets.map((set, j) =>
              j === setIdx ? { ...set, [field]: value === '' ? '' : Number(value) } : set
            ),
          }
    );
    await db.sessions.put(s);
  }

  async function toggleComplete() {
    const s = { ...session, completed: !session.completed };
    if (s.completed) {
      s.exercises = s.exercises.map((ex) => ({
        ...ex,
        sets: ex.sets.map((set) => ({ ...set, done: true })),
      }));
    }
    await db.sessions.put(s);
    toast(s.completed ? 'Workout complete! 💪' : 'Marked incomplete');
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <h1>Today</h1>
          <div className="sub">{formatLong(date)}</div>
        </div>
        <button className="btn sm ghost" onClick={() => navigate('/settings')}>
          Settings
        </button>
      </div>

      {/* Workout card */}
      <div className="card">
        <div className="between" style={{ marginBottom: 12 }}>
          <div>
            <div className="card-title" style={{ margin: 0 }}>
              Workout
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>
              {session ? session.title : 'No workout scheduled'}
            </div>
          </div>
          {session && !session.isRest && (
            <span className={`tag`} style={{ background: session.completed ? 'var(--green-soft)' : undefined, color: session.completed ? 'var(--green)' : undefined }}>
              {session.completed ? 'Done' : `Week ${session.week}`}
            </span>
          )}
        </div>

        {!session || session.isRest ? (
          <Empty icon="🧘" title={session ? 'Rest day' : 'Nothing scheduled'} hint="Recover and refuel." />
        ) : (
          <>
            {session.exercises.map((ex, exIdx) => (
              <div key={exIdx} style={{ marginBottom: 16 }}>
                <div className="between" style={{ marginBottom: 6 }}>
                  <div style={{ fontWeight: 600 }}>{ex.name}</div>
                  <div className="faint" style={{ fontSize: 13 }}>
                    {ex.targetSets}×{ex.targetReps} @ {ex.targetWeight} lbs
                  </div>
                </div>
                {ex.sets.map((set, setIdx) => (
                  <div key={setIdx} className="flex" style={{ marginBottom: 6 }}>
                    <button
                      className={`check ${set.done ? 'on' : ''}`}
                      onClick={() => toggleSet(exIdx, setIdx)}
                      aria-label={`Set ${setIdx + 1}`}
                    >
                      {set.done && <IconCheck width={16} height={16} />}
                    </button>
                    <span className="faint" style={{ width: 16, fontSize: 13 }}>
                      {setIdx + 1}
                    </span>
                    <input
                      className="input"
                      style={{ minHeight: 38 }}
                      type="number"
                      inputMode="numeric"
                      value={set.reps}
                      onChange={(e) => updateSetField(exIdx, setIdx, 'reps', e.target.value)}
                    />
                    <span className="faint" style={{ fontSize: 13 }}>
                      reps
                    </span>
                    <input
                      className="input"
                      style={{ minHeight: 38 }}
                      type="number"
                      inputMode="numeric"
                      value={set.weight}
                      onChange={(e) => updateSetField(exIdx, setIdx, 'weight', e.target.value)}
                    />
                    <span className="faint" style={{ fontSize: 13 }}>
                      lbs
                    </span>
                  </div>
                ))}
              </div>
            ))}
            <button className={`btn full ${session.completed ? '' : 'primary'}`} onClick={toggleComplete}>
              {session.completed ? 'Mark workout incomplete' : 'Mark workout complete'}
            </button>
          </>
        )}
      </div>

      {/* Nutrition card */}
      <div className="card">
        <div className="card-title">Nutrition</div>
        <div className="stat-grid" style={{ marginBottom: 16 }}>
          <Stat num={`${loggedMacros.calories}`} label={`/ ${settings.dailyCalories} kcal`} accent />
          <Stat num={`${loggedMacros.protein}g`} label={`/ ${settings.proteinTarget}g protein`} />
        </div>
        <MacroBar label="Calories" value={loggedMacros.calories} target={settings.dailyCalories} unit="" />
        <MacroBar label="Protein" value={loggedMacros.protein} target={settings.proteinTarget} unit="g" color="green" />
        <MacroBar label="Carbs" value={loggedMacros.carbs} target={settings.carbsTarget} unit="g" />
        <MacroBar label="Fat" value={loggedMacros.fat} target={settings.fatTarget} unit="g" />
      </div>

      {/* Planned meals */}
      <div className="card">
        <div className="card-title">Today's Planned Meals</div>
        {!daySlots || MEAL_SLOTS.every((s) => !daySlots[s]?.length) ? (
          <Empty icon="🍽️" title="No meals planned" hint="Set up your week in Meal Prep." />
        ) : (
          <>
            {MEAL_SLOTS.map((slot) => {
              const entries = daySlots[slot] || [];
              if (!entries.length) return null;
              return (
                <div key={slot} className="list-item">
                  <div style={{ flex: 1 }}>
                    <div className="faint" style={{ fontSize: 12, textTransform: 'uppercase' }}>
                      {SLOT_LABELS[slot]}
                    </div>
                    {entries.map((e, i) => {
                      const r = recipesById[e.recipeId];
                      return (
                        <div key={i} style={{ fontSize: 15 }}>
                          {r ? r.name : 'Unknown recipe'}
                          {e.servings > 1 ? ` ×${e.servings}` : ''}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div className="faint" style={{ fontSize: 13, marginTop: 10 }}>
              Planned total: {plannedMacros.calories} kcal · {plannedMacros.protein}g protein
            </div>
          </>
        )}
      </div>

      {/* Quick actions */}
      <div className="btn-row">
        <button className="btn primary full" onClick={() => navigate('/log')}>
          <IconCamera width={18} height={18} /> Log food
        </button>
        <button className="btn full" onClick={() => navigate('/plan')}>
          <IconPlan width={18} height={18} /> Full plan
        </button>
      </div>
    </div>
  );
}
