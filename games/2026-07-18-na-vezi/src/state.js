/** State management — save/load iz localStorage, migration */
import { GAME_CONFIG } from './config.js';

const STORAGE_KEY = 'navezi_state';
const STATE_VERSION = 1;

/** @type {import('./config.js').GameState} */
const DEFAULT_STATE = {
  version: STATE_VERSION,
  tutorialMode: true,
  week: 1,
  capital: GAME_CONFIG.BASE_CAPITAL,
  prestige_count: 0,
  season_multiplier: 1.0,
  emisije_u_sezoni: 0,
  signal_stabilan_streak: 0,

  audience: { ig: 100, tiktok: 50, youtube: 20 },
  reputation: { ig: 0.5, tiktok: 0.3, youtube: 0.2 },

  equipment: {
    e1: false, e2: false, e3: false, e4: false,
    a1: false, a2: false, a3: false, a4: false,
    r1: false, r2: false, r3: false,
    l1: false, l2: false, l3: false,
    b1: false, b2: false, b3: false, b4: false,
  },

  equip_levels: { signal: 0, audio: 0, lighting: 0, link: 0, offgrid: 0 },

  base_offgrid_capacity: GAME_CONFIG.BASE_OFFGRID_CAPACITY_START,

  weekly_plan: {
    format: 'dj_lajv',
    platform_alloc: { ig: 100, tiktok: 0, youtube: 0 },
    chosen_guest_id: 'g8',
    weekly_capacity: 55,
    weather_band: 'prosecno',
  },

  last_week_outcome: null,

  guest_reliability: {
    g1: 85, g2: 60, g3: 45, g4: 75, g5: 65, g6: 70, g7: 40,
  },
  guest_bookings: { g1: 0, g2: 0, g3: 0, g4: 0, g5: 0, g6: 0, g7: 0 },

  unlocked_formats: ['dj_lajv'],

  achievements: {
    ac1: false, ac2: false, ac3: false, ac4: false, ac5: false,
    ac6: false, ac7: false, ac8: false, ac9: false, ac10: false,
    ac11: false, ac12: false, ac13: false, ac14: false,
  },

  emisije_bez_critical: 0,
  emisija_sa_gostom_bez_noshow: false,
  consecutive_noshow_free: 0,

  highlights: [],

  // Sezonske statistike
  season_stats: {
    total_emisije: 0,
    total_capital_earned: 0,
    best_engagement: 0,
    alarms_resolved: 0,
    alarms_missed: 0,
    highlights_collected: 0,
  },
};

/** @type {Object} Živi state u memoriji */
let _state = null;

/**
 * Učitava state iz localStorage, migrira ako treba
 * @returns {Object} state
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      _state = deepClone(DEFAULT_STATE);
      return _state;
    }
    const saved = JSON.parse(raw);
    _state = migrateState(saved);
  } catch (e) {
    console.warn('State load failed, resetting:', e);
    _state = deepClone(DEFAULT_STATE);
  }
  return _state;
}

/**
 * Vraća trenutni state (bez učitavanja)
 * @returns {Object}
 */
export function getState() {
  if (!_state) return loadState();
  return _state;
}

/**
 * Snima state u localStorage
 */
export function saveState() {
  if (!_state) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
  } catch (e) {
    console.warn('State save failed:', e);
  }
}

/**
 * Ažurira state parcijalno (shallow merge na vrhu nivoa)
 * @param {Partial<Object>} patch
 */
export function updateState(patch) {
  if (!_state) loadState();
  Object.assign(_state, patch);
  saveState();
}

/**
 * Ažurira nested property unutar state
 * @param {string} path - npr. 'weekly_plan.format'
 * @param {*} value
 */
export function setStatePath(path, value) {
  if (!_state) loadState();
  const keys = path.split('.');
  let obj = _state;
  for (let i = 0; i < keys.length - 1; i++) {
    obj = obj[keys[i]];
  }
  obj[keys[keys.length - 1]] = value;
  saveState();
}

/**
 * Resetuje kompletan state (nova igra)
 */
export function resetState() {
  _state = deepClone(DEFAULT_STATE);
  saveState();
  return _state;
}

/**
 * Migracija starih verzija state-a
 * @param {Object} saved
 * @returns {Object}
 */
function migrateState(saved) {
  // Merge sa default da popuni nove polja
  const merged = deepMerge(deepClone(DEFAULT_STATE), saved);

  // Version migrations
  if (!merged.version || merged.version < STATE_VERSION) {
    merged.version = STATE_VERSION;
    // Buduće migracije idu ovde
  }

  return merged;
}

/**
 * Deep clone
 * @param {*} obj
 * @returns {*}
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Deep merge — base sa overrides (ne briše keys iz base koji nedostaju u override)
 * @param {Object} base
 * @param {Object} override
 * @returns {Object}
 */
function deepMerge(base, override) {
  if (!override || typeof override !== 'object') return base;
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (key in base && typeof base[key] === 'object' && base[key] !== null && !Array.isArray(base[key])) {
      result[key] = deepMerge(base[key], override[key]);
    } else if (override[key] !== undefined) {
      result[key] = override[key];
    }
  }
  return result;
}

/**
 * Ažurira guest reliability posle emisije
 * @param {string} guestId
 * @param {boolean} noShow
 * @param {boolean} standout
 */
export function updateGuestReliability(guestId, noShow, standout) {
  if (!_state || guestId === 'g8') return; // g8 = niko
  if (noShow) {
    _state.guest_reliability[guestId] = Math.max(0,
      _state.guest_reliability[guestId] - GAME_CONFIG.RELIABILITY_LOSS_NO_SHOW);
  } else if (standout) {
    _state.guest_reliability[guestId] = Math.min(100,
      _state.guest_reliability[guestId] + GAME_CONFIG.RELIABILITY_GAIN_STANDOUT);
    _state.guest_bookings[guestId] = (_state.guest_bookings[guestId] || 0) + 1;
  } else {
    _state.guest_reliability[guestId] = Math.min(100,
      _state.guest_reliability[guestId] + GAME_CONFIG.RELIABILITY_GAIN_STANDARD);
    _state.guest_bookings[guestId] = (_state.guest_bookings[guestId] || 0) + 1;
  }
  saveState();
}

/**
 * Dodaje highlight u istoriju
 * @param {Object} highlight
 */
export function addHighlight(highlight) {
  if (!_state) return;
  _state.highlights.push({ ...highlight, week: _state.week });
  // Max 50 highlights u istoriji
  if (_state.highlights.length > 50) {
    _state.highlights = _state.highlights.slice(-50);
  }
  _state.season_stats.highlights_collected++;
  saveState();
}

/**
 * Otključava format
 * @param {string} formatId
 */
export function unlockFormat(formatId) {
  if (!_state) return;
  if (!_state.unlocked_formats.includes(formatId)) {
    _state.unlocked_formats.push(formatId);
    saveState();
  }
}

/**
 * Markira achievement kao dostignut
 * @param {string} achievementId
 * @returns {boolean} true ako je novo
 */
export function unlockAchievement(achievementId) {
  if (!_state) return false;
  if (_state.achievements[achievementId]) return false;
  _state.achievements[achievementId] = true;
  saveState();
  return true;
}

/**
 * Ažurira sezonske statistike
 * @param {Object} emisijaResult
 */
export function recordEmisijaStats(emisijaResult) {
  if (!_state) return;
  _state.season_stats.total_emisije++;
  _state.season_stats.total_capital_earned += Math.max(0, emisijaResult.capitalDelta);
  _state.season_stats.best_engagement = Math.max(
    _state.season_stats.best_engagement,
    emisijaResult.engagement || 0
  );
  _state.season_stats.alarms_resolved += emisijaResult.alarmsResolved || 0;
  _state.season_stats.alarms_missed   += emisijaResult.alarmsMissed   || 0;
  saveState();
}
