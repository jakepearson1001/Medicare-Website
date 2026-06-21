// Exercise library + day templates for each split type.
// baseWeight values are realistic starting working weights in lbs.

export const EXERCISES = {
  bench: { name: 'Barbell Bench Press', muscle: 'Chest', baseWeight: 135, sets: 4, reps: 6 },
  inclineDb: { name: 'Incline Dumbbell Press', muscle: 'Chest', baseWeight: 50, sets: 3, reps: 10 },
  ohp: { name: 'Overhead Press', muscle: 'Shoulders', baseWeight: 75, sets: 3, reps: 8 },
  lateralRaise: { name: 'Lateral Raise', muscle: 'Shoulders', baseWeight: 15, sets: 3, reps: 15 },
  pushdown: { name: 'Tricep Pushdown', muscle: 'Triceps', baseWeight: 40, sets: 3, reps: 12 },
  cableFly: { name: 'Cable Fly', muscle: 'Chest', baseWeight: 25, sets: 3, reps: 12 },

  deadlift: { name: 'Deadlift', muscle: 'Back', baseWeight: 185, sets: 3, reps: 5 },
  row: { name: 'Barbell Row', muscle: 'Back', baseWeight: 115, sets: 4, reps: 8 },
  pulldown: { name: 'Lat Pulldown', muscle: 'Back', baseWeight: 100, sets: 3, reps: 10 },
  seatedRow: { name: 'Seated Cable Row', muscle: 'Back', baseWeight: 90, sets: 3, reps: 10 },
  facePull: { name: 'Face Pull', muscle: 'Rear Delts', baseWeight: 30, sets: 3, reps: 15 },
  curl: { name: 'Barbell Curl', muscle: 'Biceps', baseWeight: 50, sets: 3, reps: 10 },

  squat: { name: 'Back Squat', muscle: 'Legs', baseWeight: 155, sets: 4, reps: 6 },
  rdl: { name: 'Romanian Deadlift', muscle: 'Hamstrings', baseWeight: 135, sets: 3, reps: 8 },
  legPress: { name: 'Leg Press', muscle: 'Legs', baseWeight: 230, sets: 3, reps: 12 },
  legCurl: { name: 'Leg Curl', muscle: 'Hamstrings', baseWeight: 70, sets: 3, reps: 12 },
  calfRaise: { name: 'Calf Raise', muscle: 'Calves', baseWeight: 120, sets: 4, reps: 15 },
  lunge: { name: 'Walking Lunge', muscle: 'Legs', baseWeight: 30, sets: 3, reps: 12 },
};

// Each split is a rotation of named days; each day is a list of exercise keys.
export const SPLITS = {
  ppl: {
    label: 'Push / Pull / Legs',
    rotation: [
      { title: 'Push Day', keys: ['bench', 'ohp', 'inclineDb', 'lateralRaise', 'pushdown', 'cableFly'] },
      { title: 'Pull Day', keys: ['deadlift', 'row', 'pulldown', 'seatedRow', 'facePull', 'curl'] },
      { title: 'Leg Day', keys: ['squat', 'rdl', 'legPress', 'legCurl', 'calfRaise'] },
    ],
  },
  upper_lower: {
    label: 'Upper / Lower',
    rotation: [
      { title: 'Upper Body', keys: ['bench', 'row', 'ohp', 'pulldown', 'inclineDb', 'curl', 'pushdown'] },
      { title: 'Lower Body', keys: ['squat', 'rdl', 'legPress', 'legCurl', 'calfRaise'] },
    ],
  },
  full_body: {
    label: 'Full Body',
    rotation: [
      { title: 'Full Body A', keys: ['squat', 'bench', 'row', 'ohp', 'curl'] },
      { title: 'Full Body B', keys: ['deadlift', 'inclineDb', 'pulldown', 'legPress', 'lateralRaise'] },
    ],
  },
};

export const SPLIT_OPTIONS = [
  { value: 'ppl', label: 'Push / Pull / Legs' },
  { value: 'upper_lower', label: 'Upper / Lower' },
  { value: 'full_body', label: 'Full Body' },
];

// Weekdays (Mon=0..Sun=6) used for each training frequency.
export const TRAINING_DAYS = {
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 3, 4],
  6: [0, 1, 2, 3, 4, 5],
};
