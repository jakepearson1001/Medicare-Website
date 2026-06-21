export const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner', 'snacks'];
export const SLOT_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
};

const ZERO = { calories: 0, protein: 0, carbs: 0, fat: 0 };

export function emptyMacros() {
  return { ...ZERO };
}

export function addMacros(a, b, mult = 1) {
  return {
    calories: a.calories + b.calories * mult,
    protein: a.protein + b.protein * mult,
    carbs: a.carbs + b.carbs * mult,
    fat: a.fat + b.fat * mult,
  };
}

export function roundMacros(m) {
  return {
    calories: Math.round(m.calories),
    protein: Math.round(m.protein),
    carbs: Math.round(m.carbs),
    fat: Math.round(m.fat),
  };
}

// Build an id->recipe lookup.
export function recipeIndex(recipes) {
  const map = {};
  for (const r of recipes || []) map[r.id] = r;
  return map;
}

// Totals for one day's slots object: { breakfast:[{recipeId,servings}], ... }
export function dayTotals(daySlots, recipesById) {
  let total = emptyMacros();
  if (!daySlots) return total;
  for (const slot of MEAL_SLOTS) {
    for (const entry of daySlots[slot] || []) {
      const r = recipesById[entry.recipeId];
      if (!r) continue;
      const s = entry.servings || 1;
      total = addMacros(total, r.perServing, s);
    }
  }
  return total;
}

// Totals across a whole food-log day.
export function logTotals(entries) {
  let total = emptyMacros();
  for (const e of entries || []) {
    for (const item of e.items || []) {
      total = addMacros(total, item, item.qty || 1);
    }
  }
  return total;
}

// Aggregate a week's recipes into a consolidated shopping list.
// Returns [{ key, name, unit, qty }] summing duplicate ingredients.
export function buildShoppingList(weekPlan, recipesById) {
  const agg = {};
  if (!weekPlan) return [];
  for (let d = 0; d < 7; d++) {
    const daySlots = weekPlan.slots?.[d];
    if (!daySlots) continue;
    for (const slot of MEAL_SLOTS) {
      for (const entry of daySlots[slot] || []) {
        const r = recipesById[entry.recipeId];
        if (!r) continue;
        const servingsMult = (entry.servings || 1) / (r.servings || 1);
        for (const ing of r.ingredients || []) {
          const name = (ing.name || '').trim();
          if (!name) continue;
          const unit = (ing.unit || '').trim().toLowerCase();
          const key = `${name.toLowerCase()}|${unit}`;
          const qty = (Number(ing.qty) || 0) * servingsMult;
          if (!agg[key]) agg[key] = { key, name, unit, qty: 0 };
          agg[key].qty += qty;
        }
      }
    }
  }
  return Object.values(agg)
    .map((x) => ({ ...x, qty: Math.round(x.qty * 100) / 100 }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function pct(value, target) {
  if (!target) return 0;
  return Math.min(100, Math.round((value / target) * 100));
}
