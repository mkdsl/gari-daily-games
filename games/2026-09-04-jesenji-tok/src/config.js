/**
 * @module config
 * All constants, tuning numbers, scoring thresholds, and game settings.
 * Agents: read this first to understand game parameters before touching other modules.
 */

/** Number of weeks in a season */
export const WEEKS = 12;

/** Number of work groups available per week (base, before prestige) */
export const BASE_GROUPS_PER_WEEK = 3;

/** Scoring rank thresholds */
export const RANK_THRESHOLDS = {
  savrsena: 900,   // >= 900: Savršena sezona
  solidna: 600,    // 600-899: Solidna sezona
  preziveces: 300, // 300-599: Preživećeš
  propala: 0,      // < 300: Propala sezona
};

/** Rank metadata for display */
export const RANKS = [
  { id: 'savrsena',  label: 'Savršena sezona', min: 900, emoji: '🌟', color: '#f5d020' },
  { id: 'solidna',   label: 'Solidna sezona',  min: 600, emoji: '✅', color: '#8bc34a' },
  { id: 'preziveces',label: 'Preživećeš',       min: 300, emoji: '⚠️', color: '#f5a623' },
  { id: 'propala',   label: 'Propala sezona',   min: 0,   emoji: '❌', color: '#e74c3c' },
];

/** Score multiplier for tasks placed outside their optimal window */
export const OUT_WINDOW_MULTIPLIER = 0.6;

/** Ecosystem bonus multiplier (Micelij + Jezero + Kompost all in-window) */
export const ECOSYSTEM_BONUS_MULTIPLIER = 1.5;

/** Minimum score to qualify for prestige */
export const PRESTIGE_THRESHOLD = 300;

/** localStorage keys */
export const STORAGE_KEYS = {
  state: 'jt_state',
  prestige_bonus: 'jt_prestige_bonus',
  ftue_done: 'jt_ftue_done',
  best_score: 'jt_best_score',
  total_runs: 'jt_total_runs',
};

/**
 * Prestige bonus definitions
 * Each prestige run, the player picks one of these
 */
export const PRESTIGE_OPTIONS = [
  {
    id: 'extra_group',
    label: '+1 Radna grupa',
    description: '4 group-poena nedeljno umesto 3',
    emoji: '👷',
    apply(state) {
      state.prestige_bonus = 'extra_group';
      state.groups_per_week = BASE_GROUPS_PER_WEEK + 1;
    },
  },
  {
    id: 'cheap_micelij',
    label: 'Iskusna parcela',
    description: 'Micelij inokulacija kosta 1 group-poen umesto 2',
    emoji: '🍄',
    apply(state) {
      state.prestige_bonus = 'cheap_micelij';
    },
  },
  {
    id: 'full_forecast',
    label: 'Čitljivo nebo',
    description: 'Pun weather forecast od prvog dana',
    emoji: '🌤️',
    apply(state) {
      state.prestige_bonus = 'full_forecast';
    },
  },
];

/** Weather presets */
export const WEATHER_PRESETS = [
  {
    id: 'suva_jesen',
    name: 'Suva Jesen',
    emoji: '☀️',
    description: 'Idealni uslovi — nema kiše, svi prozori otvoreni',
    rain_weeks: [],
    frost_week: null,
    hot_weeks: [],
  },
  {
    id: 'kisna_jesen',
    name: 'Kišna Jesen',
    emoji: '🌧️',
    description: '3 uzastopne kišne nedelje u prvoj polovini sezone. Blokira gradilišne radove.',
    rain_weeks: null, // generated dynamically: 3 consecutive in N1-N8
    frost_week: null,
    hot_weeks: [],
  },
  {
    id: 'rani_mraz',
    name: 'Rani Mraz',
    emoji: '🌨️',
    description: 'Mraz stiže u nedelji 10. Micelij i Rezidba imaju skraćen prozor.',
    rain_weeks: [],
    frost_week: 10,
    hot_weeks: [],
  },
  {
    id: 'vatreno_lisce',
    name: 'Vatreno Lišće',
    emoji: '🍂',
    description: 'Toplo N1–N3: Ozimo window +1, ali Kompost u N1–N2 = -10% poena.',
    rain_weeks: [],
    frost_week: null,
    hot_weeks: [1, 2, 3],
  },
];

/** How many weeks of forecast are visible without full_forecast prestige */
export const FORECAST_VISIBLE_WEEKS = 3;

/** Zimska bura animation timing (ms per week reveal) */
export const BURA_WEEK_DELAY = 320;

/** Zimska bura initial pause before starting reveal */
export const BURA_INITIAL_DELAY = 800;

/** Animation durations (ms) */
export const ANIM = {
  card_assign: 200,
  card_deselect: 150,
  error_shake: 400,
  tooltip_fade: 180,
  score_count_step: 40,
  prestige_reveal: 600,
};

/** Auto-save interval (seconds) */
export const SAVE_INTERVAL_SEC = 30;
