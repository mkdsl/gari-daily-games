/**
 * config.js — sve konstante igre "Zemlja i Znanje"
 * Tuning numbers, formule params, staff bonusi, weather verovatnoce
 */

// === EKONOMIJA ===
export const BASE_BUDGET = 500; // € po sezoni pre reputation bonusa

export const BASE_PRICES = {
  suvozid: 80,
  inokulacija: 100,
  rammed_earth: 120,
  permakultura: 130,
  akvakultura: 150,
  kombinovani: 200,
  prirodna_gradnja: 140,
  muzika_prostor: 120,
  akvakultura_napredna: 180
};

export const PRICE_HARD_CAP_MULTIPLIER = 6;

export const COST_MATERIALS_PER_DAY = 60;
export const COST_FOOD_PER_PARTICIPANT_PER_DAY = 15;
export const COST_STAFF_HONORAR_PER_DAY = 80;

export const PROFIT_CARRYOVER_RATIO = 0.30;
export const TOOL_DISCOUNT = 0.20;
export const FOOD_DISCOUNT = 0.25;

// === REPUTACIJA ===
export const SEASON_MULTIPLIERS = [1.0, 1.2, 1.4, 1.6, 2.0];

export const SATISFACTION_REP_MODIFIERS = [
  { threshold: 0,    multiplier: 0 },
  { threshold: 0.50, multiplier: 0.5 },
  { threshold: 0.65, multiplier: 0.8 },
  { threshold: 0.75, multiplier: 1.0 },
  { threshold: 0.85, multiplier: 1.2 },
  { threshold: 0.95, multiplier: 1.5 }
];

export const MAX_REPUTATION = 1000;

// === PRESTIZ ===
export const PRESTIGE_SEASONS_REQUIRED = 5;
export const PRESTIGE_LEVEL_CAP = 10;
export const PRESTIGE_REP_BONUS = 0.25;
export const PRESTIGE_KEPT_STAFF = 1;
export const PRESTIGE_KEPT_TOOLS = 1;
export const PRESTIGE_EARNING_BONUS = 0.10;

// === POLAZNICI ===
export const MIN_PARTICIPANTS = 4;
export const MAX_PARTICIPANTS_BASE = 4;
export const PARTICIPANTS_HARD_CAP = 8;

// === SESIJA / MICRO ===
export const SESSION_START_HOUR = 8;
export const SESSION_END_HOUR = 16;
export const SESSION_TOTAL_MINUTES = 480;
export const SESSION_SLOTS = 8;
export const SLOT_DURATION_MINUTES = 60;

export const SPEED_MULTIPLIERS = [1, 2];

// Real-time: 1 game minute = 1 real second (x1), 0.5s (x2)
export const REAL_SECONDS_PER_GAME_MINUTE = 1.0;

// === INCIDENT SISTEM ===
export const INCIDENT_SPAWN_INTERVAL_SECONDS = 90;
export const INCIDENT_TIMER_NORMAL = 20;
export const INCIDENT_TIMER_GUIDED = 30;
export const INCIDENT_MAX_ACTIVE_EARLY = 1; // sezone 1-2

export const INTENSITY_CURVE = [
  { hour_start: 0, hour_end: 2, modifier: 0.5 },
  { hour_start: 2, hour_end: 4, modifier: 0.9 },
  { hour_start: 4, hour_end: 5, modifier: 0.7 },
  { hour_start: 5, hour_end: 6, modifier: 0.8 },
  { hour_start: 6, hour_end: 8, modifier: 1.3 }
];

// === AKTIVNOSTI ===
export const ACTIVITY_TYPES = {
  teorija: {
    id: 'teorija', name: 'Teorija', icon: '📚',
    energy_cost: 5, satisfaction_base: 8, learned_base: 15,
    min_slots: 1, max_slots: 3, color: '#2C5F6E', bg: '#1a3d47'
  },
  demonstracija: {
    id: 'demonstracija', name: 'Demonstracija', icon: '👁️',
    energy_cost: 8, satisfaction_base: 12, learned_base: 12,
    min_slots: 1, max_slots: 2, color: '#4A6741', bg: '#2d3f28'
  },
  prakticni_rad: {
    id: 'prakticni_rad', name: 'Praktični rad', icon: '🔨',
    energy_cost: 15, satisfaction_base: 18, learned_base: 20,
    min_slots: 1, max_slots: 4, color: '#A0522D', bg: '#5c2f19'
  },
  pauza: {
    id: 'pauza', name: 'Pauza', icon: '☕',
    energy_cost: -20, satisfaction_base: 5, learned_base: 0,
    min_slots: 1, max_slots: 1, color: '#C4956A', bg: '#7a5535'
  },
  evaluacija: {
    id: 'evaluacija', name: 'Evaluacija', icon: '📋',
    energy_cost: 3, satisfaction_base: 5, learned_base: 5,
    min_slots: 1, max_slots: 1, color: '#F4C430', bg: '#8a6d0d'
  }
};

export const PAUZA_FORBIDDEN_SLOTS = [0, 7];
export const EVALUACIJA_REQUIRED_SLOT = 7;

// === STAFF BONUSI ===
export const STAFF_BONUSES = {
  brana: {
    name: 'Brana Barakonja',
    satisfaction_bonus: 5,
    inc_01_bonus: { satisfaction: 12, passive_bonus: true },
    unlock_rep: 50
  },
  alatko: {
    name: 'Alatko Alatničić',
    tool_efficiency: 1.2,
    prakticni_time_reduction: 0.15,
    unlock_rep: 0
  },
  cana: {
    name: 'Cana Ćup',
    energy_per_meal: 5,
    food_cost_discount: 0.25,
    unlock_rep: 125
  },
  zemljan: {
    name: 'Zemljan Zidović',
    rammed_earth_bonus: 15,
    unlock_rep: 200
  }
};

// === WEATHER ===
export const WEATHER_TYPES = {
  sunny:  { id: 'sunny',  name: 'Sunčano',   icon: '☀️',  outdoor_bonus: 5,   energy_mod: 1.0,  incident_mod: 0.8, rain: false },
  cloudy: { id: 'cloudy', name: 'Oblačno',   icon: '☁️',  outdoor_bonus: 0,   energy_mod: 1.0,  incident_mod: 1.0, rain: false },
  rainy:  { id: 'rainy',  name: 'Kišovito',  icon: '🌧️', outdoor_bonus: -10, energy_mod: 0.85, incident_mod: 1.3, rain: true },
  windy:  { id: 'windy',  name: 'Vetrovito', icon: '💨',  outdoor_bonus: -5,  energy_mod: 0.9,  incident_mod: 1.1, rain: false },
  stormy: { id: 'stormy', name: 'Oluja',     icon: '⛈️', outdoor_bonus: -20, energy_mod: 0.7,  incident_mod: 1.8, rain: true }
};

export const WEATHER_PROBABILITIES = {
  spring: { sunny: 0.35, cloudy: 0.30, rainy: 0.25, windy: 0.08, stormy: 0.02 },
  summer: { sunny: 0.50, cloudy: 0.25, rainy: 0.15, windy: 0.07, stormy: 0.03 },
  autumn: { sunny: 0.25, cloudy: 0.35, rainy: 0.30, windy: 0.08, stormy: 0.02 },
  winter: { sunny: 0.20, cloudy: 0.35, rainy: 0.20, windy: 0.15, stormy: 0.10 }
};

// === SAVE KEYS ===
export const SAVE_KEYS = {
  MACRO:   'gari_ziz_macro_v1',
  MICRO:   'gari_ziz_micro_temp_v1',
  RESULTS: 'gari_ziz_results_v1',
  META:    'gari_ziz_meta_v1'
};

export const MACRO_SAVE_INTERVAL_SECONDS = 30;
export const MICRO_SAVE_INTERVAL_SECONDS = 10;

// === CANVAS ===
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 500;
export const ISO_TILE_W = 64;
export const ISO_TILE_H = 32;
export const FIGURE_FRAMES = 4;
export const FIGURE_FPS = 12;
export const FIGURE_SIZE = 32;

export const DAY_LIGHTING = {
  morning:   { filter: 'brightness(0.85) sepia(0.2)',          label: 'Jutro' },
  midday:    { filter: 'brightness(1.0)',                      label: 'Podne' },
  afternoon: { filter: 'hue-rotate(15deg) brightness(0.95)',   label: 'Popodne' }
};

// === GUIDED MODE ===
export const GUIDED_MODE_MAX_SEASONS = 1;
export const GUIDED_MODE_MAX_SESSIONS = 2;

// === ACHIEVEMENTS ===
export const ACHIEVEMENT_IDS = {
  FIRST_SESSION:    'prva_sesija',
  HALFWAY:          'polovina_puta',
  LIVING_SCHOOL:    'zivo_uciliste',
  RAIN_LESSON:      'kisa_ne_zaustavlja',
  FIVE_SEASONS:     'pet_sezona',
  PRESTIGE_FIRST:   'prvi_prestiz',
  JOURNALIST_BONUS: 'novinar_bonus',
  PERFECT_SESSION:  'savrsena_sesija',
  NO_INCIDENT:      'bez_incidenta',
  FULL_HOUSE:       'pun_kurs'
};

// === BRAND ===
export const BRAND_LINK_SHOWN_ON = ['season_end', 'pause'];
export const MKDSLEND_SECRET_UNLOCK_REP = 1000;
export const REPUTATION_JOURNALIST_BONUS = 10;
export const JOURNALIST_SATISFACTION_THRESHOLD = 0.80;

// === COLORS / THEME ===
export const COLORS = {
  green:  '#4A6741',
  earth:  '#C4956A',
  clay:   '#A0522D',
  stone:  '#E8E0D0',
  water:  '#2C5F6E',
  gold:   '#F4C430',
  dark:   '#1A2416',
  text:   '#F2EDE4',
  accent: '#F4C430',
  danger: '#cc3333',
  success:'#5aad5a'
};
