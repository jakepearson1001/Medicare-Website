import { EXERCISES, SPLITS, TRAINING_DAYS } from './exercises.js';
import { mondayOf, toISO, addDays, dowMon0 } from './dates.js';

const round5 = (n) => Math.max(5, Math.round(n / 5) * 5);

// Deload every 6th week (weeks 6, 12, 18, ...).
export function isDeloadWeek(week) {
  return week % 6 === 0;
}

// Progressive overload: working weight trends up ~1.2%/week (linear).
// Deload weeks drop to ~60% of the progressed weight.
function weightForWeek(baseWeight, week) {
  const progressed = baseWeight * (1 + 0.012 * (week - 1));
  if (isDeloadWeek(week)) return round5(progressed * 0.6);
  return round5(progressed);
}

function buildExercise(key, week) {
  const def = EXERCISES[key];
  const weight = weightForWeek(def.baseWeight, week);
  const targetSets = isDeloadWeek(week) ? Math.max(2, def.sets - 1) : def.sets;
  const sets = Array.from({ length: targetSets }, () => ({
    reps: def.reps,
    weight,
    done: false,
  }));
  return {
    name: def.name,
    muscle: def.muscle,
    targetSets,
    targetReps: def.reps,
    targetWeight: weight,
    sets,
  };
}

/**
 * Generate a full 52-week plan as an array of day sessions.
 * @param {object} cfg { splitType, daysPerWeek, startDate (ISO), weeks }
 * @returns {Array} session objects (no id) ready to bulkAdd.
 */
export function generatePlan(cfg) {
  const weeks = cfg.weeks || 52;
  const splitType = SPLITS[cfg.splitType] ? cfg.splitType : 'ppl';
  const rotation = SPLITS[splitType].rotation;
  const trainingDays = TRAINING_DAYS[cfg.daysPerWeek] || TRAINING_DAYS[4];
  const startMonday = mondayOf(cfg.startDate);

  const sessions = [];
  let rotIdx = 0; // continuous rotation across weeks for a true cycle

  for (let w = 1; w <= weeks; w++) {
    const deload = isDeloadWeek(w);
    for (let dow = 0; dow < 7; dow++) {
      const date = toISO(addDays(startMonday, (w - 1) * 7 + dow));
      const isTraining = trainingDays.includes(dow);
      if (!isTraining) {
        sessions.push({
          planId: cfg.planId ?? null,
          date,
          week: w,
          dayOfWeek: dow,
          title: 'Rest Day',
          type: 'rest',
          isRest: true,
          completed: false,
          exercises: [],
        });
        continue;
      }
      const day = rotation[rotIdx % rotation.length];
      rotIdx++;
      sessions.push({
        planId: cfg.planId ?? null,
        date,
        week: w,
        dayOfWeek: dow,
        title: deload ? `${day.title} (Deload)` : day.title,
        type: deload ? 'deload' : 'workout',
        isRest: false,
        completed: false,
        exercises: day.keys.map((k) => buildExercise(k, w)),
      });
    }
  }
  return sessions;
}

// A single fresh workout day, used when editing a rest day into a workout.
export function blankExercise() {
  return {
    name: 'New Exercise',
    muscle: '',
    targetSets: 3,
    targetReps: 10,
    targetWeight: 45,
    sets: [
      { reps: 10, weight: 45, done: false },
      { reps: 10, weight: 45, done: false },
      { reps: 10, weight: 45, done: false },
    ],
  };
}
