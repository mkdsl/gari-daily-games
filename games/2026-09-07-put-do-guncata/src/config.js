/** @module config — sve konstante i konfiguracija */

export const GAME_ID = 'pdg';
export const STORAGE_KEY = 'pdg_state';

/** @type {Object} */
export const STAGE_COLORS = {
  1: { bg: '#1c1c28', accent: '#f5d87a', surface: '#2a2a3a', text: '#e8dcc8' },
  2: {
    day:   { bg: '#2a2a3a', horizon: '#f5d87a', road: '#3a3a4a', text: '#e8dcc8' },
    night: { bg: '#0a0d18', horizon: '#1a2040', road: '#12141e', text: '#8090b0' }
  },
  3: { bg: '#e8d870', accent: '#5a7a2a', surface: '#f5f0c0', text: '#2a2a1a' },
  4: { bg: '#1a2812', accent: '#3d5426', surface: '#263a18', text: '#c8d8b0' },
  5: {
    day:   { bg: '#2a7a4a', accent: '#e8dcc8', water: '#1a6a3a', text: '#f0ece0' },
    night: { bg: '#0d2a1c', accent: '#c0d8c0', water: '#081810', text: '#a0c0a0' }
  }
};

// Etapa 1 — parking radial meter
export const ETAPA1 = {
  DURATION_S: 60,
  SWEET_SPOT_DEG: 72,
  ZONE_MOVE_INTERVAL_S: 15,
  ACCURACY_COEFF: 1.4,
};

// Etapa 2 — autoput
export const ETAPA2 = {
  DURATION_S: 180,
  FUEL_DECAY_PER_S: 0.3,
  EVENT_WINDOW_MS: 2000,
  EVENT_INTERVAL_MIN_S: 12,
  EVENT_INTERVAL_MAX_S: 22,
  EVENT_CORRECT_SCORE: 3,
  EVENT_MISS_SCORE: -2,
};

export const DAY_EVENTS = {
  guzva:         { label: '🚗 Gužva!',          hint: 'Smanji gas!' },
  pojacanje:     { label: '🎵 Pojačanje!',        hint: 'Pojačaj muziku!' },
  pogresanIzlaz: { label: '⚠️ Pogrešan izlaz!', hint: 'Skreni nazad!' }
};

export const NIGHT_EVENTS = {
  magla:         { label: '🌫️ Magla!',           hint: 'Pali maglenke!' },
  farovi:        { label: '🚗 Farovi!',            hint: 'Prilagodi svetla!' },
  pogresanIzlaz: { label: '⚠️ Pogrešan izlaz!', hint: 'Skreni nazad!' }
};

// Etapa 3 — rute
export const ROUTES = {
  brze:        { label: 'Brže',        icon: '⚡', desc: 'Autoput direktno' },
  slikovitije: { label: 'Slikovitije', icon: '🌿', desc: 'Kroz sela' },
  sigurnije:   { label: 'Sigurnije',   icon: '🛡️', desc: 'Manji putevi' }
};

// Etapa 4 — prepreke
export const ROUTE_CONFIG = {
  brze:        { obstacles: 12, speedMult: 1.3,  reactionMs: 600 },
  slikovitije: { obstacles: 8,  speedMult: 0.85, reactionMs: 1000, hasDistractor: true },
  sigurnije:   { obstacles: 10, speedMult: 1.0,  reactionMs: 800 }
};

export const OBSTACLE_TYPES = [
  { id: 'saraf', label: '🔩 Šaraf', action: 'tap',      hint: 'Tapni!' },
  { id: 'blato', label: '💧 Blato', action: 'swipe',    hint: 'Swipe levo!' },
  { id: 'grana', label: '🌿 Grana', action: 'tap-down', hint: 'Tapni dole!' }
];

// Prestige
export const PRESTIGE = {
  RUNS_REQUIRED: 1,
};

// Score buckets
export const SCORE_BUCKETS = {
  green:  { min: 70, label: 'Spreman si!',        color: '#4caf50' },
  yellow: { min: 40, label: 'Ušao si u kadar!',   color: '#ffc107' },
  humor:  { min: 0,  label: 'Sledeći put!',        color: '#e57373' }
};

// Pera Period aforizmi
export const AFORIZMI = [
  'Svaki put do Guncata je malo drugačiji.',
  'Magla ne pita za pasoš.',
  'Brana zna kad si prošao.',
  'Muzika menja brzinu sveta.',
  'Svako jezero pamti prvi krug.',
  'Ne treba mapa — treba ritam.',
  'Kasno je samo kad si već stigao.',
  'Guncati prima sve koji znaju da skrenu.',
  'Farovi su svedoci.',
  'Pogrešan izlaz nije greška — to je uvod.',
  'Gorivo je metafora.',
  'Svaka grana koja te udari — nešto te uči.',
  'Radni park počinje na putu do njega.',
  'Blato ne mrzi auto — samo voli kontakt.',
  'Ako čuješ šaraf — već si kasno za njega.'
];
