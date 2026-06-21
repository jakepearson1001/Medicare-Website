import Dexie from 'dexie';

/**
 * FitForge local-first database (IndexedDB via Dexie).
 *
 * ── DATA MODELS ──────────────────────────────────────────────────────────
 *
 * Settings (singleton, id = 1)
 *   { id, units: 'lbs', dailyCalories, proteinTarget, carbsTarget, fatTarget,
 *     goal, goalWeight, exerciseKey, daysPerWeek, splitType, startDate }
 *
 * WorkoutPlan
 *   { id, name, goal, goalWeight, exerciseKey, daysPerWeek, splitType,
 *     startDate (YYYY-MM-DD), weeks, createdAt }
 *
 * WorkoutSession  (one calendar day in a plan)
 *   { id, planId, date (YYYY-MM-DD), week (1..52), dayOfWeek (0..6),
 *     title, type ('workout' | 'rest' | 'deload'), isRest (bool),
 *     completed (bool),
 *     exercises: [ Exercise ] }
 *
 * Exercise (embedded in a session or template)
 *   { name, muscle, targetSets, targetReps, targetWeight,
 *     sets: [ { reps, weight, done } ] }
 *
 * WorkoutTemplate
 *   { id, name, exercises: [ Exercise (targets only) ], createdAt }
 *
 * Recipe
 *   { id, name, photo (dataURL|null), tags: [string], servings,
 *     ingredients: [ { name, qty, unit } ], steps: [string],
 *     perServing: { calories, protein, carbs, fat },
 *     favorite (bool), createdAt }
 *
 * WeeklyMealPlan
 *   { id, weekStart (YYYY-MM-DD, Monday),
 *     slots: { [dayIndex 0..6]: { breakfast:[], lunch:[], dinner:[], snacks:[] } }
 *            where each entry = { recipeId, servings } }
 *
 * FoodLogEntry
 *   { id, date (YYYY-MM-DD), timestamp (ms), photo (dataURL|null),
 *     items: [ { name, qty, calories, protein, carbs, fat } ],
 *     note, source ('photo' | 'manual') }
 * ─────────────────────────────────────────────────────────────────────────
 */
export const db = new Dexie('fitforge');

db.version(1).stores({
  settings: 'id',
  plans: '++id, createdAt',
  sessions: '++id, planId, date, week, completed',
  templates: '++id, createdAt',
  recipes: '++id, favorite, createdAt',
  mealPlans: '++id, weekStart',
  foodLog: '++id, date, timestamp',
});

export default db;
