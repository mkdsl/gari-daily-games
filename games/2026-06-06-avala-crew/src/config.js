/**
 * config.js — Sve tuning konstante za Avala Crew
 * Jova jQuery @ Gari Daily Games 2026-06-06
 */

// ============ SCENARIO RESOLUTION THRESHOLDS ============

/** Primary stat thresholds za full WIN */
export const SCENARIO_THRESHOLDS = { E: 20, S: 22, P: 19, L: 18, X_E: 20, X_S: 18 };

/** Primary stat thresholds za PARTIAL win (ako nije full win ali je > partial) */
export const SCENARIO_PARTIAL_THRESHOLDS = { E: 12, S: 14, P: 11, L: 10, X_E: 12, X_S: 10 };

// ============ AFTERMATH ============

/** Max aftermath efekta u stacku istovremeno */
export const AFTERMATH_STACK_MAX = 3;

// ============ NIGHT SCORING ============

/** Maksimalni Night Score po noći */
export const NIGHT_SCORE_CAP = 100;

/** Bonus score za završenu fazu */
export const PHASE_COMPLETION_BONUSES = {
  gathering: 5,
  peak: 8,
  departure: 7
};

/** Bonus za kompletnost ekipe */
export const CREW_INTEGRITY_BONUS = {
  all5: 10,  // svih 5 članova u ekipi
  four: 5    // 4 člana
};

// ============ SINERGIJE ============

/** Bonus score po aktiviranoj sinergiji */
export const SYNERGY_BONUS_PER_ACTIVATION = 3;

/** Max ukupni sinergija bonus */
export const MAX_SYNERGY_BONUS = 15;

// ============ XP I NAPREDOVANJE ============

/** XP dobijen po outcome-u scenarija */
export const XP_PER_OUTCOME = {
  legendary: 5,
  good: 3,
  survived: 1,
  kaos: 0
};

/** Ukupni career XP pragovi za unlock */
export const XP_UNLOCK_THRESHOLDS = {
  mirko: 9,
  stefan: 15
};

// ============ BOND SISTEM ============

/** Shared nights potreban za Bond nivo (index = nivo, vrednost = min sharedNights) */
export const BOND_LEVEL_THRESHOLDS = [0, 2, 4, 7];

// ============ PRESTIGE ============

/** Procenat bonusa za threshold koji se množi sa prestige levelom */
export const PRESTIGE_THRESHOLD_MULTIPLIER = 0.15;

/** Procenat bonusa na score koji se množi sa prestige levelom */
export const PRESTIGE_SCORE_MULTIPLIER = 0.05;

/** Ukupni career XP potreban da se proba prestige */
export const PRESTIGE_UNLOCK_XP = 50;

/** Broj legendary noći za svaki prestige nivo */
export const PRESTIGE_LEGENDARY_NIGHTS_NEEDED = [0, 3, 6, 10, 15, 21];

// ============ ROLE MODIFIERS ============

/**
 * Kako uloga utiče na primary stat doprinose (multiplikatori)
 * Karte u primaryRole dobijaju GOOD_FIT_BONUS dodatno
 */
export const ROLE_MODIFIERS = {
  navigator: { L: 1.4, P: 0.7, E: 0.9, S: 0.9 },
  hype: { E: 1.3, S: 1.3, L: 0.6, P: 0.8 },
  logistics: { L: 1.3, E: 1.3, S: 0.7, P: 0.8 },
  dance_captain: { P: 1.5, L: 0.5, E: 0.9, S: 0.7 },
  anchor: { S: 1.2, E: 1.2, L: 0.9, P: 0.9 }
};

/** Bonus multiplikator kad je karta u prirodnoj ulozi (primaryRole match) */
export const GOOD_FIT_BONUS = 0.10;

// ============ NIGHT OUTCOME THRESHOLDS ============

/** Koji Night Score daje koji outcome */
export const NIGHT_OUTCOME_THRESHOLDS = {
  legendary: 85,   // >= 85 → Legendarna noć
  good: 60,        // >= 60 → Dobra noć
  survived: 35     // >= 35 → Preživeli smo
  // < 35 → Kaos noć
};

// ============ EXTERNAL LINKS ============

/** Link za biletima za Avala 2026 */
export const TICKETING_URL = 'https://bilet.rs/show/261?utm_source=avala-crew-game&utm_medium=share';

/** Play URL za sharing */
export const PLAY_URL = 'https://mkdsl.github.io/gari-daily-games/games/2026-06-06-avala-crew/';

// ============ SAVE / LOAD ============

/** localStorage key za state */
export const SAVE_KEY = 'avala-crew-state';

/** Verzija state sheme (za migracije) */
export const STATE_VERSION = 1;

// ============ SCENARIO SELECTION ============

/** Broj scenarija po noći */
export const SCENARIOS_PER_NIGHT = 10;

/** Distribucija po fazama */
export const PHASE_SCENARIO_COUNT = {
  gathering: 3,
  peak: 4,
  departure: 3
};

// ============ UI / ANIMATION ============

/** Vreme animacije za score tick (ms) */
export const SCORE_TICK_DURATION = 1500;

/** Debounce za dugmad (ms) */
export const BUTTON_DEBOUNCE_MS = 300;

/** Toast notifikacija trajanje (ms) */
export const TOAST_DURATION_MS = 3000;

// ============ STAT LABELS ============

export const STAT_LABELS = {
  E: 'Energija',
  S: 'Socijal',
  P: 'Plesanje',
  L: 'Logistika'
};

export const STAT_ICONS = {
  E: '⚡',
  S: '🌐',
  P: '🕺',
  L: '🗺️'
};

export const SCENARIO_TYPE_LABELS = {
  E: 'Energija',
  S: 'Socijal',
  P: 'Ples',
  L: 'Logistika',
  X: 'Wild'
};

export const SCENARIO_TYPE_ICONS = {
  E: '⚡',
  S: '🌐',
  P: '🕺',
  L: '🗺️',
  X: '⭐'
};

// ============ OUTCOME LABELS ============

export const OUTCOME_LABELS = {
  legendary: 'Legendarna noć! 🌟',
  good: 'Dobra noć ✓',
  survived: 'Preživeli smo',
  kaos: 'Kaos noć 💀'
};

export const OUTCOME_COLORS = {
  legendary: '#ffd700',
  good: '#39ff14',
  survived: '#ff8c42',
  kaos: '#ff4444'
};

export const SCENARIO_OUTCOME_LABELS = {
  win: 'WIN',
  partial: 'PARTIAL',
  fail: 'FAIL'
};

// ============ ROLE LABELS ============

export const ROLE_LABELS = {
  navigator: 'Navigator 🗺️',
  hype: 'Hype 📣',
  logistics: 'Logistika 🎒',
  dance_captain: 'Kapetan poda 🕺',
  anchor: 'Sidro ⚓'
};
