// eq_bank.js — EQ problems + glossary definitions
// Bug 6 fix: 3 distinct boss problems (indices 7, 8, 9 — one per boss round)
// LOW fix: typo 'preooostre' → 'preooštre'; added 'Mid-bas' to GLOSSARY

export const EQ_PROBLEMS = [
  // --- Regular problems (indices 0-6) ---
  {
    id: 'boom_bass',
    label: 'Boom Basa',
    filterType: 'lowshelf',
    frequency: 120,
    gain: 9,
    Q: undefined,
    diagnosis: 'Bas je preglasan',
    zone: 'bass',
    correction: { axis: 'bas', direction: 'smanjiti' },
    distractors: [
      'Visoke frekvencije su preooštre',
      'Mid je ugušen',
      'Nema zraka u visokim',
      'Sub-bas preplavljuje mix',
    ],
    glossaryTerms: ['Bas'],
  },
  {
    id: 'harsh_highs',
    label: 'Oštre Visoke',
    filterType: 'highshelf',
    frequency: 8000,
    gain: 10,
    Q: undefined,
    diagnosis: 'Visoke frekvencije su preooštre',
    zone: 'highs',
    correction: { axis: 'visoke', direction: 'smanjiti' },
    distractors: [
      'Bas je preglasan',
      'Mid je ugušen',
      'Presence frekvencija nedostaje',
      'Nema zraka u visokim',
    ],
    glossaryTerms: ['Visoke'],
  },
  {
    id: 'muffled_mid',
    label: 'Ugušen Mid',
    filterType: 'peaking',
    frequency: 1000,
    gain: -8,
    Q: 1.4,
    diagnosis: 'Mid je ugušen',
    zone: 'mid',
    correction: { axis: 'mid', direction: 'pojacati' },
    distractors: [
      'Bas je preglasan',
      'Visoke frekvencije su preooštre',
      'Mid-bas je muljev',
      'Presence frekvencija nedostaje',
    ],
    glossaryTerms: ['Mid'],
  },
  {
    id: 'sub_flood',
    label: 'Sub-bas Flood',
    filterType: 'lowshelf',
    frequency: 60,
    gain: 12,
    Q: undefined,
    diagnosis: 'Sub-bas preplavljuje mix',
    zone: 'subbass',
    correction: { axis: 'sub-bas', direction: 'smanjiti' },
    distractors: [
      'Bas je preglasan',
      'Mid je ugušen',
      'Mid-bas je muljev',
      'Nema zraka u visokim',
    ],
    glossaryTerms: ['Sub-bas'],
  },
  {
    id: 'presence_dip',
    label: 'Presence Rupa',
    filterType: 'peaking',
    frequency: 3000,
    gain: -10,
    Q: 2.0,
    diagnosis: 'Presence frekvencija nedostaje',
    zone: 'presence',
    correction: { axis: 'presence', direction: 'pojacati' },
    distractors: [
      'Visoke frekvencije su preooštre',
      'Mid je ugušen',
      'Nema zraka u visokim',
      'Mid-bas je muljev',
    ],
    glossaryTerms: ['Presence'],
  },
  {
    id: 'no_air',
    label: 'Air Nedostaje',
    filterType: 'highshelf',
    frequency: 12000,
    gain: -8,
    Q: undefined,
    diagnosis: 'Nema zraka u visokim',
    zone: 'air',
    correction: { axis: 'air', direction: 'pojacati' },
    distractors: [
      'Visoke frekvencije su preooštre',
      'Presence frekvencija nedostaje',
      'Mid je ugušen',
      'Bas je preglasan',
    ],
    glossaryTerms: ['Air'],
  },
  {
    id: 'muddy_midbass',
    label: 'Muljavi Mid-bas',
    filterType: 'peaking',
    frequency: 250,
    gain: 7,
    Q: 0.8,
    diagnosis: 'Mid-bas je muljev',
    zone: 'midbass',
    correction: { axis: 'mid-bas', direction: 'smanjiti' },
    distractors: [
      'Bas je preglasan',
      'Mid je ugušen',
      'Sub-bas preplavljuje mix',
      'Presence frekvencija nedostaje',
    ],
    glossaryTerms: ['Mid-bas'],
  },
  // --- Boss problems (indices 7, 8, 9 — one per boss round) ---
  {
    // Boss 3 (round index 2): "Boom + Oštar Vrh"
    id: 'boss3_boom_sharp',
    label: 'Boom + Oštar Vrh',
    filterType: 'double',
    filters: [
      { filterType: 'lowshelf', frequency: 120, gain: 9 },
      { filterType: 'highshelf', frequency: 8000, gain: 10 },
    ],
    diagnosis: 'Bas i visoke su preglasni',
    zone: 'boss',
    correction: [
      { axis: 'bas', direction: 'smanjiti' },
      { axis: 'visoke', direction: 'smanjiti' },
    ],
    distractors: [
      'Bas je preglasan',
      'Visoke frekvencije su preooštre',
      'Mid je ugušen',
      'Sub-bas preplavljuje mix',
    ],
    glossaryTerms: ['Bas', 'Visoke'],
  },
  {
    // Boss 6 (round index 5): "Sub + Presence Rupa"
    id: 'boss6_sub_presence',
    label: 'Sub + Presence Rupa',
    filterType: 'double',
    filters: [
      { filterType: 'lowshelf', frequency: 60, gain: 12 },
      { filterType: 'peaking', frequency: 3000, gain: -10, Q: 2.0 },
    ],
    diagnosis: 'Sub-bas preplavljuje, presence nedostaje',
    zone: 'boss',
    correction: [
      { axis: 'sub-bas', direction: 'smanjiti' },
      { axis: 'presence', direction: 'pojacati' },
    ],
    distractors: [
      'Bas je preglasan',
      'Visoke frekvencije su preooštre',
      'Mid je ugušen',
      'Nema zraka u visokim',
    ],
    glossaryTerms: ['Sub-bas', 'Presence'],
  },
  {
    // Boss 9 (round index 8): "Smiley" — original double_boost
    id: 'boss9_smiley',
    label: 'Smiley EQ',
    filterType: 'double',
    filters: [
      { filterType: 'lowshelf', frequency: 100, gain: 8 },
      { filterType: 'highshelf', frequency: 10000, gain: 7 },
    ],
    diagnosis: 'Bas i visoke su preglasni',
    zone: 'boss',
    correction: [
      { axis: 'bas', direction: 'smanjiti' },
      { axis: 'visoke', direction: 'smanjiti' },
    ],
    distractors: [
      'Bas je preglasan',
      'Visoke frekvencije su preooštre',
      'Mid je ugušen',
      'Sub-bas preplavljuje mix',
    ],
    glossaryTerms: ['Bas', 'Visoke'],
  },
];

export const GLOSSARY = {
  'Bas': 'Bas = niske frekvencije, ritam i udaraljke.',
  'Visoke': 'Visoke = iznad 4 kHz — sjaj, zviždanje.',
  'Mid': 'Mid = 500Hz-2kHz — glas, gitara.',
  'Sub-bas': 'Sub-bas = ispod 80 Hz — oseća se više nego čuje.',
  'Presence': 'Presence = 2-5 kHz, jasnoća glasu i gitari.',
  'Air': 'Air = iznad 12 kHz — osećaj prostora.',
  'Mid-bas': 'Mid-bas = 150-300 Hz — punoća zvuka, ali i mulj ako je preglasan.',
};

// Map round index → which EQ problem to use
// Rounds 0-6: regular problems (indices 0-6)
// Boss rounds: index 2 → boss problem 7, index 5 → boss problem 8, index 8 → boss problem 9
export function getProblemForRound(roundIndex) {
  const mapping = [0, 1, 7, 2, 3, 8, 4, 5, 9, 6];
  return EQ_PROBLEMS[mapping[roundIndex] ?? 0];
}

// Build distractor list for a round
export function buildOptions(problem, count, isRound9Trap = false) {
  const correct = problem.diagnosis;
  let pool = problem.distractors.filter(d => d !== correct);
  // shuffle pool
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const chosen = [correct, ...pool.slice(0, count - 1)];
  if (isRound9Trap) {
    chosen[chosen.length - 1] = 'Nema problema'; // replace last with trap
  }
  // shuffle chosen
  for (let i = chosen.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chosen[i], chosen[j]] = [chosen[j], chosen[i]];
  }
  return chosen;
}
