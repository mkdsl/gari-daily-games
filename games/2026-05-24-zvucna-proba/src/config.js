// config.js — All constants: rounds, scoring, EQ bank

export const GAME_CONFIG = {
  TOTAL_ROUNDS: 10,
  MAX_LIVES: 3,
  SNIPPET_DURATION: 3500,   // ms
  FADE_IN: 50,
  FADE_OUT: 150,
  MAX_SCORE: 3000,
  BASE_CORRECT: 100,
  BASE_DIAG_ONLY: 40,
  BASE_MISS: 0,
  TIME_BONUS_MAX: 50,
  STREAK_MULTIPLIER_CAP: 2.0,
  STREAK_MULTIPLIER_STEP: 0.1,
  LS_KEY: 'gdg_zvucna_proba_highscore_v1',
};

export const RANKS = [
  { min: 0,    max: 999,  name: 'Početnik Tonac' },
  { min: 1000, max: 1999, name: 'Solidan Tonac' },
  { min: 2000, max: 2599, name: 'Majstor Zvuka' },
  { min: 2600, max: Infinity, name: 'Legenda Probe' },
];

// Round table
export const ROUNDS = [
  { id: 1, zone: 'Bass (80-200 Hz)',    options: 3, timeWindow: 8, tolerance: 1, boss: false },
  { id: 2, zone: 'Highs (4-12 kHz)',    options: 3, timeWindow: 8, tolerance: 1, boss: false },
  { id: 3, zone: 'BOSS — Mid+Bass',     options: 3, timeWindow: 7, tolerance: 1, boss: true,  bossType: 'double' },
  { id: 4, zone: 'Mid (500-2000 Hz)',   options: 3, timeWindow: 7, tolerance: 1, boss: false },
  { id: 5, zone: 'Sub-bass (40-80 Hz)', options: 3, timeWindow: 6, tolerance: 1, boss: false },
  { id: 6, zone: 'BOSS — Highs+Mid',   options: 4, timeWindow: 6, tolerance: 0, boss: true,  bossType: 'subtle', noTimeBonus: true },
  { id: 7, zone: 'Presence (2-4 kHz)', options: 3, timeWindow: 6, tolerance: 1, boss: false },
  { id: 8, zone: 'Air (12-16 kHz)',    options: 3, timeWindow: 5, tolerance: 1, boss: false },
  { id: 9, zone: 'BOSS — sve 3',       options: 4, timeWindow: 5, tolerance: 0, boss: true,  bossType: 'trap' },
  { id: 10, zone: 'Player-choice zone',options: 3, timeWindow: 5, tolerance: 0, boss: false },
];

export const BRAND = {
  EVENT_NAME: 'Kluboslavija',
  EVENT_YEAR: 2026,
  TARGET_DATE: new Date('2026-06-20'),  // Avala: 27 dana od 2026-05-24
  TICKET_URL: 'https://bilet.rs/show/261',
  SHARE_URL: 'https://mkdsl.github.io/gari-daily-games/games/2026-05-24-zvucna-proba/',
};
