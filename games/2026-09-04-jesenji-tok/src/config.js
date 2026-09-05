/**
 * @module config
 * All constants, tuning numbers, scoring thresholds, weather presets,
 * and game settings for Jesenji Tok.
 *
 * Agents: read this first to understand all game parameters before touching
 * other modules. This is the single source of truth for numeric tuning.
 */

// ─── Calendar ─────────────────────────────────────────────────────────────────

/** Number of weeks in a season (Aug 20 – Nov 5) */
export const WEEKS = 12;

/** First week number */
export const WEEK_MIN = 1;

/** Last week number */
export const WEEK_MAX = 12;

// ─── Group Capacity ───────────────────────────────────────────────────────────

/** Number of work groups (radne grupe) available per week, base value */
export const BASE_GROUPS_PER_WEEK = 3;

/** Maximum groups with the extra_group prestige */
export const MAX_GROUPS_PER_WEEK = BASE_GROUPS_PER_WEEK + 1;

// ─── Scoring ──────────────────────────────────────────────────────────────────

/**
 * Rank thresholds (score ranges).
 * These are minimum scores for each rank (inclusive).
 */
export const RANK_THRESHOLDS = {
  savrsena:   900, // >= 900: Savršena sezona (perfect)
  solidna:    600, // 600-899: Solidna sezona (solid)
  preziveces: 300, // 300-599: Preživećeš (you'll survive)
  propala:    0,   // < 300: Propala sezona (failed)
};

/**
 * Rank metadata for display (ordered highest to lowest).
 * @type {Array<{ id: string, label: string, min: number, emoji: string, color: string }>}
 */
export const RANKS = [
  { id: 'savrsena',   label: 'Savršena sezona', min: 900, emoji: '🌟', color: '#f5d020' },
  { id: 'solidna',    label: 'Solidna sezona',  min: 600, emoji: '✅', color: '#8bc34a' },
  { id: 'preziveces', label: 'Preživećeš',       min: 300, emoji: '⚠️', color: '#f5a623' },
  { id: 'propala',    label: 'Propala sezona',   min: 0,   emoji: '❌', color: '#e74c3c' },
];

/** Score multiplier applied to tasks placed outside their optimal window */
export const OUT_WINDOW_MULTIPLIER = 0.6;

/** Score multiplier for ecosystem bonus (Micelij + Jezero + Kompost all in-window) */
export const ECOSYSTEM_BONUS_MULTIPLIER = 1.5;

/** Hot weather penalty for kompost in hot weeks */
export const HOT_KOMPOST_PENALTY = 0.9; // ×0.9 = -10%

/** Task IDs that form the ecosystem bonus trio */
export const ECO_BONUS_TASK_IDS = ['micelij', 'jezero', 'kompost'];

// ─── Prestige ─────────────────────────────────────────────────────────────────

/** Minimum score required to unlock prestige at end of season */
export const PRESTIGE_THRESHOLD = 300;

/**
 * Prestige bonus option definitions.
 * Player picks one per eligible run.
 * @type {Array<{ id: string, label: string, description: string, emoji: string }>}
 */
export const PRESTIGE_OPTIONS = [
  {
    id: 'extra_group',
    label: '+1 Radna grupa',
    description: '4 group-poena nedeljno umesto 3 — više fleksibilnosti u rasporedu.',
    emoji: '👷',
  },
  {
    id: 'cheap_micelij',
    label: 'Iskusna parcela',
    description: 'Micelij inokulacija košta 1 group-poen umesto 2 — otvara kombos sa Jezerom.',
    emoji: '🍄',
  },
  {
    id: 'full_forecast',
    label: 'Čitljivo nebo',
    description: 'Svih 12 nedelja prognoze vidljivo od prvog dana — savršena informacija.',
    emoji: '🌤️',
  },
];

// ─── Weather Presets ──────────────────────────────────────────────────────────

/**
 * Weather preset definitions.
 * One preset is picked randomly each run.
 * rain_weeks: null = generated dynamically (kisna_jesen picks 3 consecutive)
 * @type {Array<{
 *   id: string, name: string, emoji: string, description: string,
 *   rain_weeks: number[]|null, frost_week: number|null, hot_weeks: number[]
 * }>}
 */
export const WEATHER_PRESETS = [
  {
    id: 'suva_jesen',
    name: 'Suva Jesen',
    emoji: '☀️',
    description: 'Idealni uslovi — nema kiše, nema mraza, svi prozori otvoreni.',
    rain_weeks: [],
    frost_week: null,
    hot_weeks: [],
  },
  {
    id: 'kisna_jesen',
    name: 'Kišna Jesen',
    emoji: '🌧️',
    description: '3 uzastopne kišne nedelje u prvoj polovini sezone. Blokira gradilišne radove.',
    rain_weeks: null, // generated dynamically: 3 consecutive starting N1–N6
    frost_week: null,
    hot_weeks: [],
  },
  {
    id: 'rani_mraz',
    name: 'Rani Mraz',
    emoji: '🌨️',
    description: 'Mraz stiže u nedelji N10. Micelij i Rezidba imaju skraćen prozor.',
    rain_weeks: [],
    frost_week: 10,
    hot_weeks: [],
  },
  {
    id: 'vatreno_lisce',
    name: 'Vatreno Lišće',
    emoji: '🍂',
    description: 'Toplo N1–N3: Ozimo +1 nedelja, ali Kompost u N1–N2 = -10% poena.',
    rain_weeks: [],
    frost_week: null,
    hot_weeks: [1, 2, 3],
  },
];

/** How many weeks of forecast are revealed at start (without full_forecast prestige) */
export const FORECAST_VISIBLE_WEEKS = 3;

/** How many forecast weeks are revealed when player assigns their first task */
export const FORECAST_FIRST_ASSIGN_REVEAL = 1;

// ─── Animation Timing ─────────────────────────────────────────────────────────

/** Zimska bura: pause before reveal starts (ms) */
export const BURA_INITIAL_DELAY = 800;

/** Zimska bura: delay between each week reveal (ms) */
export const BURA_WEEK_DELAY = 320;

/** Zimska bura: pause before score display after all weeks revealed (ms) */
export const BURA_POST_REVEAL_DELAY = 600;

/**
 * Animation timing constants (ms).
 * Used by CSS animation controllers.
 */
export const ANIM = {
  card_assign:      200, // Card flash on assignment
  card_deselect:    150, // Card deselect visual
  error_shake:      400, // Error shake animation
  tooltip_fade:     180, // Tooltip appear/disappear
  score_count_step:  40, // Score counter update interval
  prestige_reveal:  600, // Prestige options slide-in
  eco_bonus_flash:  800, // Eco bonus achieved flash
  bura_week_flash:  250, // Week-reveal highlight during bura
};

// ─── Persistence ──────────────────────────────────────────────────────────────

/**
 * localStorage keys used by the game.
 * All keys are prefixed with 'jt_' to avoid collisions.
 */
export const STORAGE_KEYS = {
  state:          'jt_state',
  prestige_bonus: 'jt_prestige_bonus',
  ftue_done:      'jt_ftue_done',
  best_score:     'jt_best_score',
  total_runs:     'jt_total_runs',
  audio_enabled:  'jt_audio_enabled',
};

/** Auto-save interval in seconds */
export const SAVE_INTERVAL_SEC = 30;

// ─── Debug & Dev ──────────────────────────────────────────────────────────────

/**
 * Debug flags (set to true in browser console to enable).
 * These are checked at runtime, not build-time.
 */
export const DEBUG = {
  /** Show all 12 weeks of forecast regardless of what's revealed */
  show_full_forecast: false,
  /** Log all state changes to console */
  log_state: false,
  /** Skip FTUE tutorial */
  skip_ftue: false,
};

// ─── Derived Constants ────────────────────────────────────────────────────────

/** Theoretical maximum score (all tasks in-window + full eco bonus) */
export const THEORETICAL_MAX_SCORE =
  // micelij=180, ozimo=150, jezero=160, graditeljski=170, rezidba=130, kompost=140 = 930
  // eco bonus: (180+160+140)*0.5 = 240
  930 + 240; // = 1170

/** Total base score if all tasks assigned in-window (no eco bonus) */
export const TOTAL_BASE_SCORE = 930;
