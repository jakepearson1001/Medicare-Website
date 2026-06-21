import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db.js';
import { mondayOf, toISO, addDays, fromISO, formatShort, DOW_SHORT } from '../lib/dates.js';
import {
  MEAL_SLOTS,
  SLOT_LABELS,
  recipeIndex,
  dayTotals,
  roundMacros,
  buildShoppingList,
} from '../lib/nutrition.js';
import { Sheet, useToast, Empty } from '../components/ui.jsx';
import { IconPlus, IconTrash, IconCheck } from '../components/icons.jsx';

function emptySlots() {
  const s = {};
  for (let d = 0; d < 7; d++) {
    s[d] = {};
    for (const slot of MEAL_SLOTS) s[d][slot] = [];
  }
  return s;
}

export default function MealPrep() {
  const toast = useToast();
  const [weekStart, setWeekStart] = useState(() => toISO(mondayOf(new Date())));
  const [picker, setPicker] = useState(null); // { day, slot }
  const [showShopping, setShowShopping] = useState(false);

  const plan = useLiveQuery(() => db.mealPlans.where('weekStart').equals(weekStart).first(), [weekStart]);
  const recipes = useLiveQuery(() => db.recipes.toArray(), []);
  const recipesById = recipeIndex(recipes);

  async function getOrCreate() {
    let p = await db.mealPlans.where('weekStart').equals(weekStart).first();
    if (!p) {
      const id = await db.mealPlans.add({ weekStart, slots: emptySlots(), checked: {} });
      p = await db.mealPlans.get(id);
    }
    return p;
  }

  async function addEntry(day, slot, recipeId, servings) {
    const p = await getOrCreate();
    const slots = JSON.parse(JSON.stringify(p.slots));
    slots[day] = slots[day] || {};
    slots[day][slot] = slots[day][slot] || [];
    slots[day][slot].push({ recipeId, servings: Number(servings) || 1 });
    await db.mealPlans.update(p.id, { slots });
  }

  async function removeEntry(day, slot, idx) {
    const p = await getOrCreate();
    const slots = JSON.parse(JSON.stringify(p.slots));
    slots[day][slot].splice(idx, 1);
    await db.mealPlans.update(p.id, { slots });
  }

  async function clearWeek() {
    const p = await getOrCreate();
    await db.mealPlans.update(p.id, { slots: emptySlots(), checked: {} });
    toast('Week cleared');
  }

  async function copyLastWeek() {
    const lastWeek = toISO(addDays(fromISO(weekStart), -7));
    const prev = await db.mealPlans.where('weekStart').equals(lastWeek).first();
    if (!prev) return toast('No plan last week to copy');
    const p = await getOrCreate();
    await db.mealPlans.update(p.id, { slots: JSON.parse(JSON.stringify(prev.slots)) });
    toast('Copied last week');
  }

  async function toggleChecked(key) {
    const p = await getOrCreate();
    const checked = { ...(p.checked || {}) };
    checked[key] = !checked[key];
    await db.mealPlans.update(p.id, { checked });
  }

  const shopping = buildShoppingList(plan, recipesById);

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <h1>Meal Prep</h1>
          <div className="sub">Week of {formatShort(weekStart)}</div>
        </div>
      </div>

      <div className="between mb">
        <button className="btn sm" onClick={() => setWeekStart(toISO(addDays(fromISO(weekStart), -7)))}>
          ‹ Prev
        </button>
        <button className="btn sm" onClick={() => setWeekStart(toISO(mondayOf(new Date())))}>
          This week
        </button>
        <button className="btn sm" onClick={() => setWeekStart(toISO(addDays(fromISO(weekStart), 7)))}>
          Next ›
        </button>
      </div>

      <div className="btn-row mb">
        <button className="btn sm full" onClick={copyLastWeek}>
          Copy last week
        </button>
        <button className="btn sm full" onClick={clearWeek}>
          Clear week
        </button>
        <button className="btn sm full primary" onClick={() => setShowShopping(true)}>
          Shopping list
        </button>
      </div>

      {Array.from({ length: 7 }, (_, d) => {
        const daySlots = plan?.slots?.[d];
        const totals = roundMacros(dayTotals(daySlots, recipesById));
        const iso = toISO(addDays(fromISO(weekStart), d));
        return (
          <div key={d} className="card">
            <div className="between" style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 700 }}>
                {DOW_SHORT[d]} <span className="faint" style={{ fontWeight: 400, fontSize: 13 }}>{formatShort(iso)}</span>
              </div>
              <div className="faint" style={{ fontSize: 13 }}>
                {totals.calories} kcal · {totals.protein}g P
              </div>
            </div>
            {MEAL_SLOTS.map((slot) => {
              const entries = daySlots?.[slot] || [];
              return (
                <div key={slot} style={{ marginBottom: 8 }}>
                  <div className="between">
                    <span className="faint" style={{ fontSize: 12, textTransform: 'uppercase' }}>
                      {SLOT_LABELS[slot]}
                    </span>
                    <button
                      className="btn sm ghost"
                      style={{ minHeight: 28, padding: '0 8px' }}
                      onClick={() => setPicker({ day: d, slot })}
                    >
                      <IconPlus width={14} height={14} />
                    </button>
                  </div>
                  {entries.length === 0 ? (
                    <div className="faint" style={{ fontSize: 13, padding: '2px 0' }}>—</div>
                  ) : (
                    entries.map((e, i) => {
                      const r = recipesById[e.recipeId];
                      return (
                        <div key={i} className="flex" style={{ justifyContent: 'space-between', padding: '3px 0' }}>
                          <span style={{ fontSize: 14 }}>
                            {r ? r.name : 'Unknown'} {e.servings > 1 ? `×${e.servings}` : ''}
                          </span>
                          <button
                            className="ghost"
                            style={{ color: 'var(--text-faint)' }}
                            onClick={() => removeEntry(d, slot, i)}
                            aria-label="Remove"
                          >
                            <IconTrash width={15} height={15} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Recipe picker */}
      <PickerSheet
        picker={picker}
        recipes={recipes || []}
        onClose={() => setPicker(null)}
        onPick={async (recipeId, servings) => {
          await addEntry(picker.day, picker.slot, recipeId, servings);
          setPicker(null);
          toast('Added to plan');
        }}
      />

      {/* Shopping list */}
      <Sheet open={showShopping} onClose={() => setShowShopping(false)} title="Shopping list">
        {shopping.length === 0 ? (
          <Empty icon="🛒" title="Nothing to buy yet" hint="Assign recipes to days first." />
        ) : (
          shopping.map((item) => {
            const isChecked = plan?.checked?.[item.key];
            return (
              <div key={item.key} className="flex" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <button className={`check ${isChecked ? 'on' : ''}`} onClick={() => toggleChecked(item.key)}>
                  {isChecked && <IconCheck width={16} height={16} />}
                </button>
                <span style={{ flex: 1, textDecoration: isChecked ? 'line-through' : 'none', color: isChecked ? 'var(--text-faint)' : 'var(--text)' }}>
                  {item.name}
                </span>
                <span className="faint" style={{ fontSize: 14 }}>
                  {item.qty} {item.unit}
                </span>
              </div>
            );
          })
        )}
      </Sheet>
    </div>
  );
}

function PickerSheet({ picker, recipes, onClose, onPick }) {
  const [servings, setServings] = useState(1);
  if (!picker) return null;
  return (
    <Sheet open={!!picker} onClose={onClose} title={`Add to ${SLOT_LABELS[picker.slot]}`}>
      <div className="field">
        <label>Servings</label>
        <input
          className="input"
          type="number"
          inputMode="decimal"
          value={servings}
          onChange={(e) => setServings(e.target.value)}
        />
      </div>
      {recipes.length === 0 ? (
        <Empty icon="🍳" title="No recipes yet" hint="Create recipes first." />
      ) : (
        recipes.map((r) => (
          <button
            key={r.id}
            className="card tight"
            style={{ width: '100%', textAlign: 'left', display: 'flex', gap: 12, alignItems: 'center' }}
            onClick={() => onPick(r.id, servings)}
          >
            {r.photo ? (
              <img src={r.photo} alt="" className="thumb-sm" />
            ) : (
              <div className="thumb-sm" style={{ background: 'var(--card-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                🍽️
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{r.name}</div>
              <div className="faint" style={{ fontSize: 13 }}>
                {r.perServing.calories} kcal · {r.perServing.protein}g P
              </div>
            </div>
          </button>
        ))
      )}
    </Sheet>
  );
}
