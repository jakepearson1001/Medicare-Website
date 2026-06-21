// Seed data + helpers for the exercise library, day templates, and cycles.

export const MUSCLES = [
  'Chest',
  'Back',
  'Shoulders',
  'Triceps',
  'Biceps',
  'Quads',
  'Hamstrings',
  'Glutes',
  'Calves',
  'Core',
];

// Parse a rep-range string like "6–10" / "8-12" / "12" -> midpoint integer.
export function repMid(repRange) {
  if (repRange == null) return 10;
  const nums = String(repRange).match(/\d+/g);
  if (!nums) return 10;
  if (nums.length === 1) return Number(nums[0]);
  return Math.round((Number(nums[0]) + Number(nums[1])) / 2);
}

// ---- Exercise library suggestions ----
export const EXERCISE_SUGGESTIONS = [
  // Chest
  { name: 'Barbell Bench Press', muscle: 'Chest', defaultSets: 3, repRange: '6–10' },
  { name: 'Incline Barbell Press', muscle: 'Chest', defaultSets: 3, repRange: '6–10' },
  { name: 'Incline DB Press', muscle: 'Chest', defaultSets: 3, repRange: '8–12' },
  { name: 'Flat DB Press', muscle: 'Chest', defaultSets: 3, repRange: '8–12' },
  { name: 'Machine Chest Press', muscle: 'Chest', defaultSets: 3, repRange: '10–15' },
  { name: 'Cable Fly', muscle: 'Chest', defaultSets: 3, repRange: '12–15' },
  { name: 'Dips', muscle: 'Chest', defaultSets: 3, repRange: '8–12' },
  { name: 'Push-Up', muscle: 'Chest', defaultSets: 3, repRange: '12–20' },
  // Back
  { name: 'Deadlift', muscle: 'Back', defaultSets: 3, repRange: '4–6' },
  { name: 'Trap Bar Deadlift', muscle: 'Back', defaultSets: 3, repRange: '4–6' },
  { name: 'Barbell Row', muscle: 'Back', defaultSets: 3, repRange: '6–10' },
  { name: 'Chest-Supported Row', muscle: 'Back', defaultSets: 3, repRange: '8–12' },
  { name: 'Seated Cable Row', muscle: 'Back', defaultSets: 3, repRange: '10–15' },
  { name: 'Lat Pulldown', muscle: 'Back', defaultSets: 3, repRange: '10–15' },
  { name: 'Pull-Up', muscle: 'Back', defaultSets: 4, repRange: '6–10' },
  { name: 'Weighted Pull-Up', muscle: 'Back', defaultSets: 4, repRange: '4–8' },
  { name: 'Face Pull', muscle: 'Back', defaultSets: 3, repRange: '15–20' },
  { name: 'Straight-Arm Pulldown', muscle: 'Back', defaultSets: 3, repRange: '12–15' },
  // Shoulders
  { name: 'Overhead Press', muscle: 'Shoulders', defaultSets: 3, repRange: '6–10' },
  { name: 'Seated DB Shoulder Press', muscle: 'Shoulders', defaultSets: 3, repRange: '8–12' },
  { name: 'Lateral Raise', muscle: 'Shoulders', defaultSets: 4, repRange: '12–20' },
  { name: 'Cable Lateral Raise', muscle: 'Shoulders', defaultSets: 3, repRange: '15–20' },
  { name: 'Rear Delt Fly', muscle: 'Shoulders', defaultSets: 3, repRange: '15–20' },
  { name: 'Upright Row', muscle: 'Shoulders', defaultSets: 3, repRange: '10–15' },
  // Triceps
  { name: 'Triceps Pushdown', muscle: 'Triceps', defaultSets: 3, repRange: '12–15' },
  { name: 'Overhead Triceps Extension', muscle: 'Triceps', defaultSets: 3, repRange: '12–15' },
  { name: 'Skull Crushers', muscle: 'Triceps', defaultSets: 4, repRange: '8–12' },
  { name: 'Close-Grip Bench Press', muscle: 'Triceps', defaultSets: 3, repRange: '6–10' },
  // Biceps
  { name: 'Barbell Curl', muscle: 'Biceps', defaultSets: 3, repRange: '8–12' },
  { name: 'EZ-Bar Curl', muscle: 'Biceps', defaultSets: 3, repRange: '10–15' },
  { name: 'Dumbbell Curl', muscle: 'Biceps', defaultSets: 3, repRange: '10–15' },
  { name: 'Cable Curl', muscle: 'Biceps', defaultSets: 3, repRange: '12–15' },
  { name: 'Hammer Curl', muscle: 'Biceps', defaultSets: 3, repRange: '10–15' },
  { name: 'Preacher Curl', muscle: 'Biceps', defaultSets: 3, repRange: '10–15' },
  // Quads
  { name: 'Back Squat', muscle: 'Quads', defaultSets: 4, repRange: '5–8' },
  { name: 'Front Squat', muscle: 'Quads', defaultSets: 3, repRange: '6–10' },
  { name: 'Leg Press', muscle: 'Quads', defaultSets: 3, repRange: '10–15' },
  { name: 'Hack Squat', muscle: 'Quads', defaultSets: 3, repRange: '8–12' },
  { name: 'Leg Extension', muscle: 'Quads', defaultSets: 3, repRange: '12–15' },
  { name: 'Bulgarian Split Squat', muscle: 'Quads', defaultSets: 3, repRange: '8–12' },
  { name: 'Walking Lunge', muscle: 'Quads', defaultSets: 3, repRange: '10–12' },
  // Hamstrings
  { name: 'Romanian Deadlift', muscle: 'Hamstrings', defaultSets: 3, repRange: '8–12' },
  { name: 'Lying Leg Curl', muscle: 'Hamstrings', defaultSets: 4, repRange: '10–15' },
  { name: 'Seated Leg Curl', muscle: 'Hamstrings', defaultSets: 4, repRange: '10–15' },
  { name: 'Stiff-Leg Deadlift', muscle: 'Hamstrings', defaultSets: 3, repRange: '8–12' },
  // Glutes
  { name: 'Hip Thrust', muscle: 'Glutes', defaultSets: 3, repRange: '8–12' },
  { name: 'Glute Bridge', muscle: 'Glutes', defaultSets: 3, repRange: '10–15' },
  { name: 'Cable Kickback', muscle: 'Glutes', defaultSets: 3, repRange: '12–15' },
  // Calves
  { name: 'Standing Calf Raise', muscle: 'Calves', defaultSets: 4, repRange: '10–15' },
  { name: 'Seated Calf Raise', muscle: 'Calves', defaultSets: 4, repRange: '12–20' },
  // Core
  { name: 'Hanging Leg Raise', muscle: 'Core', defaultSets: 3, repRange: '10–15' },
  { name: 'Cable Crunch', muscle: 'Core', defaultSets: 3, repRange: '12–15' },
  { name: 'Plank', muscle: 'Core', defaultSets: 3, repRange: '30–60s' },
  { name: 'Ab Wheel', muscle: 'Core', defaultSets: 3, repRange: '8–12' },
];

// Build a plan/template exercise block from library fields.
function ex(name, muscle, sets, repRange, weight = 0, rir = '') {
  return {
    name,
    muscle,
    targetSets: sets,
    targetReps: repMid(repRange),
    targetWeight: weight,
    repRange,
    rir,
  };
}

// ---- Day templates (from the user's Phase 1–2 split, plus a couple extras) ----
export const DAY_TEMPLATE_SEEDS = [
  {
    name: 'Upper — Horizontal',
    type: 'Upper',
    note: 'Phase 1: horizontal push/pull emphasis.',
    exercises: [
      ex('Barbell Bench Press', 'Chest', 3, '6–10', 0, '2'),
      ex('Chest-Supported Row', 'Back', 3, '8–12', 0, '2'),
      ex('Incline DB Press', 'Chest', 3, '8–12', 0, '2'),
      ex('Lat Pulldown', 'Back', 3, '10–15', 0, '2'),
      ex('Lateral Raise', 'Shoulders', 4, '12–20', 0, '1'),
      ex('Triceps Pushdown', 'Triceps', 3, '12–15', 0, '1'),
    ],
  },
  {
    name: 'Lower — Quad Focus',
    type: 'Lower',
    note: 'Phase 1: quad-dominant lower.',
    exercises: [
      ex('Back Squat', 'Quads', 4, '5–8', 0, '2'),
      ex('Romanian Deadlift', 'Hamstrings', 3, '8–12', 0, '2'),
      ex('Leg Press', 'Quads', 3, '10–15', 0, '2'),
      ex('Standing Calf Raise', 'Calves', 4, '10–15', 0, '1'),
      ex('Leg Extension', 'Quads', 3, '12–15', 0, '1'),
    ],
  },
  {
    name: 'Upper — Vertical',
    type: 'Upper',
    note: 'Phase 1: vertical push/pull emphasis.',
    exercises: [
      ex('Overhead Press', 'Shoulders', 3, '6–10', 55, '2'),
      ex('Pull-Up', 'Back', 4, '6–10', 0, '1–2'),
      ex('Flat DB Press', 'Chest', 3, '10–12', 75, '2'),
      ex('Seated Cable Row', 'Back', 3, '10–15', 145, '2'),
      ex('EZ-Bar Curl', 'Biceps', 3, '10–15', 25, '1'),
      ex('Face Pull', 'Back', 3, '15–20', 50, '2'),
    ],
  },
  {
    name: 'Lower — Posterior',
    type: 'Lower',
    note: 'Phase 1: posterior-chain lower + abs.',
    exercises: [
      ex('Trap Bar Deadlift', 'Back', 3, '4–6', 275, '2'),
      ex('Hip Thrust', 'Glutes', 3, '8–12', 225, '2'),
      ex('Lying Leg Curl', 'Hamstrings', 4, '10–15', 180, '1'),
      ex('Bulgarian Split Squat', 'Quads', 3, '8–12', 55, '2'),
      ex('Hanging Leg Raise', 'Core', 3, '10–15', 0, ''),
    ],
  },
  {
    name: 'Arms + Delts',
    type: 'Arms',
    note: 'Phase 1: arm & delt specialization day.',
    exercises: [
      ex('EZ-Bar Curl', 'Biceps', 4, '8–12', 25, '1'),
      ex('Lateral Raise', 'Shoulders', 5, '15–25', 10, '1'),
      ex('Skull Crushers', 'Triceps', 4, '8–12', 30, '1'),
      ex('Cable Curl', 'Biceps', 3, '12–15', 0, '1'),
      ex('Overhead Triceps Extension', 'Triceps', 3, '12–15', 0, '1'),
    ],
  },
  {
    name: 'Upper A — Heavy',
    type: 'Upper',
    note: 'Phase 2: strength-biased upper.',
    exercises: [
      ex('Barbell Bench Press', 'Chest', 4, '3–6', 185, '1–2'),
      ex('Weighted Pull-Up', 'Back', 4, '4–8', 20, '1–2'),
      ex('Seated DB Shoulder Press', 'Shoulders', 3, '5–8', 55, '2'),
      ex('Barbell Row', 'Back', 3, '6–10', 80, '2'),
      ex('EZ-Bar Curl', 'Biceps', 3, '8–12', 25, '1'),
      ex('Triceps Pushdown', 'Triceps', 3, '10–12', 73, '1'),
    ],
  },
  {
    name: 'Lower A — Heavy',
    type: 'Lower',
    note: 'Phase 2: strength-biased lower.',
    exercises: [
      ex('Back Squat', 'Quads', 4, '3–6', 365, '1–2'),
      ex('Romanian Deadlift', 'Hamstrings', 3, '6–8', 315, '2'),
      ex('Leg Press', 'Quads', 3, '8–12', 315, '2'),
      ex('Standing Calf Raise', 'Calves', 4, '10–15', 45, '1'),
    ],
  },
  {
    name: 'Upper B — Volume',
    type: 'Upper',
    note: 'Phase 2: hypertrophy upper.',
    exercises: [
      ex('Incline DB Press', 'Chest', 3, '8–12', 0, '2'),
      ex('Lat Pulldown', 'Back', 4, '10–15', 0, '2'),
      ex('Cable Fly', 'Chest', 3, '12–15', 0, '1'),
      ex('Lateral Raise', 'Shoulders', 5, '15–25', 0, '1'),
      ex('Dumbbell Curl', 'Biceps', 4, '10–15', 0, '1'),
    ],
  },
  {
    name: 'Lower B — Volume',
    type: 'Lower',
    note: 'Phase 2: hypertrophy lower.',
    exercises: [
      ex('Stiff-Leg Deadlift', 'Hamstrings', 3, '5–8', 0, '2'),
      ex('Bulgarian Split Squat', 'Quads', 3, '8–12', 0, '2'),
      ex('Seated Leg Curl', 'Hamstrings', 4, '10–15', 0, '1'),
      ex('Cable Crunch', 'Core', 4, '12–15', 0, ''),
    ],
  },
  {
    name: 'Full Body',
    type: 'Full Body',
    note: 'Simple full-body day.',
    exercises: [
      ex('Back Squat', 'Quads', 3, '5–8'),
      ex('Barbell Bench Press', 'Chest', 3, '6–10'),
      ex('Barbell Row', 'Back', 3, '8–12'),
      ex('Overhead Press', 'Shoulders', 3, '8–12'),
      ex('Dumbbell Curl', 'Biceps', 2, '10–15'),
    ],
  },
];

// ---- Cycle (phase) presets ----
export const CYCLE_TYPES = [
  { type: 'Bulk', color: '#34d399', calorieNote: '+5–15% above maintenance' },
  { type: 'Strength', color: '#38bdf8', calorieNote: 'Slight surplus' },
  { type: 'Maintenance', color: '#a78bfa', calorieNote: 'At maintenance' },
  { type: 'Specialization', color: '#f0abfc', calorieNote: 'Maintenance / slight surplus' },
  { type: 'Cut', color: '#fbbf24', calorieNote: '−300 to −500 deficit' },
  { type: 'Recomp', color: '#fb7185', calorieNote: 'Around maintenance' },
  { type: 'Custom', color: '#9aa7b8', calorieNote: '' },
];

export function colorForType(type) {
  return (CYCLE_TYPES.find((c) => c.type === type) || CYCLE_TYPES[CYCLE_TYPES.length - 1]).color;
}

// Phases mapped to week ranges of the 52-week plan (from the user's plan).
export const PHASE_SEEDS = [
  { name: 'Phase 1 — Hypertrophy Base', type: 'Bulk', weekStart: 1, weekEnd: 12, note: 'Build muscle, perfect technique. Deloads end of wk 6 & 12.' },
  { name: 'Phase 2 — Strength-Biased Hypertrophy', type: 'Strength', weekStart: 13, weekEnd: 24, note: 'Increase mechanical tension. Deloads end of wk 18 & 24.' },
  { name: 'Phase 3 — Specialization', type: 'Specialization', weekStart: 25, weekEnd: 36, note: 'Bring up weak points. 16–24 sets/wk on target. Deloads end of wk 30 & 36.' },
  { name: 'Phase 4 — Cut / Recomp', type: 'Cut', weekStart: 37, weekEnd: 52, note: 'Fat loss, retain muscle. Keep heavy lifts, −30% volume, add cardio. Deloads wk 44 & 52.' },
];
