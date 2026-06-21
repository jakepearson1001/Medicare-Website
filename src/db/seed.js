import { db } from './db.js';
import { generatePlan } from '../lib/plan.js';
import { mondayOf, toISO, addDays, todayISO } from '../lib/dates.js';
import { MEAL_SLOTS } from '../lib/nutrition.js';
import {
  EXERCISE_SUGGESTIONS,
  DAY_TEMPLATE_SEEDS,
  PHASE_SEEDS,
  colorForType,
} from '../lib/library.js';

export const DEFAULT_SETTINGS = {
  id: 1,
  units: 'lbs',
  dailyCalories: 2400,
  proteinTarget: 180,
  carbsTarget: 240,
  fatTarget: 70,
  goal: 'Hit a 225 lb bench press',
  goalWeight: 225,
  exerciseKey: 'bench',
  daysPerWeek: 4,
  splitType: 'ppl',
  startDate: null, // set during seeding
};

const SAMPLE_RECIPES = [
  {
    name: 'High-Protein Chicken & Rice Bowls',
    tags: ['high-protein', 'meal-prep', 'quick'],
    servings: 4,
    favorite: true,
    photo: null,
    ingredients: [
      { name: 'Chicken breast', qty: 2, unit: 'lb' },
      { name: 'Jasmine rice', qty: 2, unit: 'cup' },
      { name: 'Broccoli', qty: 4, unit: 'cup' },
      { name: 'Olive oil', qty: 2, unit: 'tbsp' },
      { name: 'Soy sauce', qty: 3, unit: 'tbsp' },
      { name: 'Garlic', qty: 3, unit: 'clove' },
    ],
    steps: [
      'Cook rice according to package directions.',
      'Season and sear diced chicken in olive oil until cooked through.',
      'Steam broccoli until tender-crisp.',
      'Add garlic and soy sauce to the chicken, toss to coat.',
      'Divide rice, chicken, and broccoli across 4 containers.',
    ],
    perServing: { calories: 520, protein: 48, carbs: 52, fat: 12 },
  },
  {
    name: 'Greek Yogurt Protein Breakfast',
    tags: ['high-protein', 'quick', 'breakfast'],
    servings: 1,
    favorite: true,
    photo: null,
    ingredients: [
      { name: 'Greek yogurt (nonfat)', qty: 1, unit: 'cup' },
      { name: 'Granola', qty: 0.5, unit: 'cup' },
      { name: 'Blueberries', qty: 0.5, unit: 'cup' },
      { name: 'Honey', qty: 1, unit: 'tbsp' },
      { name: 'Whey protein', qty: 1, unit: 'scoop' },
    ],
    steps: [
      'Stir whey protein into the Greek yogurt.',
      'Top with granola and blueberries.',
      'Drizzle with honey.',
    ],
    perServing: { calories: 430, protein: 42, carbs: 48, fat: 8 },
  },
  {
    name: 'Beef & Sweet Potato Skillet',
    tags: ['high-protein', 'meal-prep'],
    servings: 4,
    favorite: false,
    photo: null,
    ingredients: [
      { name: 'Lean ground beef (93/7)', qty: 1.5, unit: 'lb' },
      { name: 'Sweet potato', qty: 3, unit: 'medium' },
      { name: 'Bell pepper', qty: 2, unit: 'whole' },
      { name: 'Onion', qty: 1, unit: 'whole' },
      { name: 'Olive oil', qty: 1, unit: 'tbsp' },
      { name: 'Taco seasoning', qty: 2, unit: 'tbsp' },
    ],
    steps: [
      'Dice sweet potatoes and roast or pan-cook in olive oil until soft.',
      'Brown the ground beef, draining excess fat.',
      'Add diced peppers and onion, cook until softened.',
      'Stir in taco seasoning and the sweet potato.',
      'Portion into 4 containers.',
    ],
    perServing: { calories: 480, protein: 38, carbs: 40, fat: 18 },
  },
  {
    name: 'Salmon, Quinoa & Asparagus',
    tags: ['high-protein', 'meal-prep'],
    servings: 3,
    favorite: false,
    photo: null,
    ingredients: [
      { name: 'Salmon fillet', qty: 1.5, unit: 'lb' },
      { name: 'Quinoa', qty: 1, unit: 'cup' },
      { name: 'Asparagus', qty: 1, unit: 'lb' },
      { name: 'Lemon', qty: 1, unit: 'whole' },
      { name: 'Olive oil', qty: 2, unit: 'tbsp' },
    ],
    steps: [
      'Cook quinoa in 2 cups water until fluffy.',
      'Roast salmon at 400°F for 12–15 minutes.',
      'Roast asparagus with olive oil until tender.',
      'Squeeze lemon over salmon and serve over quinoa.',
    ],
    perServing: { calories: 540, protein: 44, carbs: 34, fat: 24 },
  },
  {
    name: 'Protein Overnight Oats',
    tags: ['high-protein', 'quick', 'breakfast', 'meal-prep'],
    servings: 2,
    favorite: true,
    photo: null,
    ingredients: [
      { name: 'Rolled oats', qty: 1, unit: 'cup' },
      { name: 'Whey protein', qty: 2, unit: 'scoop' },
      { name: 'Milk', qty: 1.5, unit: 'cup' },
      { name: 'Chia seeds', qty: 2, unit: 'tbsp' },
      { name: 'Peanut butter', qty: 2, unit: 'tbsp' },
      { name: 'Banana', qty: 1, unit: 'whole' },
    ],
    steps: [
      'Combine oats, protein, milk, and chia seeds in two jars.',
      'Swirl in peanut butter and sliced banana.',
      'Refrigerate overnight.',
    ],
    perServing: { calories: 460, protein: 36, carbs: 50, fat: 14 },
  },
];

function emptyDaySlots() {
  const day = {};
  for (const slot of MEAL_SLOTS) day[slot] = [];
  return day;
}

/**
 * Seed the database once on first run. Idempotent: if settings already exist,
 * it does nothing.
 */
export async function ensureSeeded() {
  const existing = await db.settings.get(1);
  if (existing) return;

  // Start the plan two weeks ago so "today" lands mid-progression with history.
  const startMonday = toISO(addDays(mondayOf(new Date()), -14));

  const settings = { ...DEFAULT_SETTINGS, startDate: startMonday };
  await db.settings.put(settings);

  // 1) Plan + sessions
  const planId = await db.plans.add({
    name: '52-Week Bench Builder',
    goal: settings.goal,
    goalWeight: settings.goalWeight,
    exerciseKey: settings.exerciseKey,
    daysPerWeek: settings.daysPerWeek,
    splitType: settings.splitType,
    startDate: startMonday,
    weeks: 52,
    createdAt: Date.now(),
  });

  const sessions = generatePlan({
    planId,
    splitType: settings.splitType,
    daysPerWeek: settings.daysPerWeek,
    startDate: startMonday,
    weeks: 52,
  });
  await db.sessions.bulkAdd(sessions);

  // Mark a couple of past workouts complete for a realistic history.
  const past = await db.sessions
    .where('date')
    .below(todayISO())
    .filter((s) => !s.isRest)
    .toArray();
  for (const s of past.slice(0, 6)) {
    s.completed = true;
    s.exercises = s.exercises.map((ex) => ({
      ...ex,
      sets: ex.sets.map((set) => ({ ...set, done: true })),
    }));
    await db.sessions.put(s);
  }

  // 2) Library, day templates, and cycles
  await ensureLibrarySeeded();

  // 3) Recipes — capture ids for the meal plan
  const recipeIds = [];
  for (const r of SAMPLE_RECIPES) {
    const id = await db.recipes.add({ ...r, createdAt: Date.now() });
    recipeIds.push(id);
  }
  const [chickenRice, yogurt, beef, salmon, oats] = recipeIds;

  // 4) Weekly meal plan for the current week
  const weekStart = toISO(mondayOf(new Date()));
  const slots = {};
  for (let d = 0; d < 7; d++) {
    slots[d] = emptyDaySlots();
    slots[d].breakfast.push({ recipeId: d % 2 === 0 ? oats : yogurt, servings: 1 });
    slots[d].lunch.push({ recipeId: chickenRice, servings: 1 });
    slots[d].dinner.push({ recipeId: d % 2 === 0 ? beef : salmon, servings: 1 });
    slots[d].snacks.push({ recipeId: yogurt, servings: 1 });
  }
  await db.mealPlans.add({ weekStart, slots });

  // 5) A sample food-log entry for today
  await db.foodLog.add({
    date: todayISO(),
    timestamp: Date.now(),
    photo: null,
    source: 'manual',
    note: 'Sample entry — edit or delete me',
    items: [
      { name: 'Protein Overnight Oats', qty: 1, calories: 460, protein: 36, carbs: 50, fat: 14 },
      { name: 'Black coffee', qty: 1, calories: 5, protein: 0, carbs: 1, fat: 0 },
    ],
  });
}

/**
 * Seed the exercise library, day templates, and training cycles. Idempotent:
 * runs once per device (guarded by settings.librarySeeded) so existing installs
 * pick up the new content on upgrade without duplicating it.
 */
export async function ensureLibrarySeeded() {
  const settings = await db.settings.get(1);
  if (settings?.librarySeeded) return;

  if ((await db.exercises.count()) === 0) {
    await db.exercises.bulkAdd(
      EXERCISE_SUGGESTIONS.map((e) => ({ ...e, notes: '', isCustom: false }))
    );
  }

  // Add any seed day templates that aren't already present (by name), so
  // existing installs gain the phase days without duplicating them.
  const existingNames = new Set((await db.templates.toArray()).map((t) => t.name));
  const missing = DAY_TEMPLATE_SEEDS.filter((t) => !existingNames.has(t.name));
  if (missing.length) {
    await db.templates.bulkAdd(missing.map((t) => ({ ...t, createdAt: Date.now() })));
  }

  if ((await db.cycles.count()) === 0) {
    const plan = await db.plans.orderBy('createdAt').last();
    const start = plan?.startDate || settings?.startDate || todayISO();
    const startMonday = mondayOf(start);
    const cycles = PHASE_SEEDS.map((p) => ({
      name: p.name,
      type: p.type,
      color: colorForType(p.type),
      startDate: toISO(addDays(startMonday, (p.weekStart - 1) * 7)),
      endDate: toISO(addDays(startMonday, p.weekEnd * 7 - 1)),
      note: p.note,
    }));
    await db.cycles.bulkAdd(cycles);
  }

  if (settings) await db.settings.update(1, { librarySeeded: true });
}
