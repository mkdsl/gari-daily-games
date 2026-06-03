// ============================================================
//  state.js — Sarajevo ili Smrt
//  Canonical game state shape, save/load, offline progress.
// ============================================================

import { SAVE_KEY, PRESTIGE_MULTIPLIER, UPGRADE_COSTS, DK_SHOP_ITEMS } from './config.js';
import { calcIdleLPPerHour } from './systems/idle.js';

const STATE_VERSION = 2;
const OFFLINE_CAP_HOURS = 24;

// ----------------------------------------------------------------
//  createInitialState
// ----------------------------------------------------------------
export function createInitialState() {
  return {
    version: STATE_VERSION,

    // --- Meta progression ---
    prestige_level: 0,
    prestige_multiplier: 1.0,
    dk: 0,
    total_dk_earned: 0,

    // --- Current run resources ---
    lp: 0,
    total_lp_earned_this_run: 0,

    // --- Upgrades (each = current level, 0-based) ---
    upgrades: {
      A: 0,
      B: 0,
      C: 0,
      Cplus: 0, // 0 = not started; 1 or 2 = bought
      D: 0,
      E: 0
    },

    // --- Kvartovi ---
    kvartovi: {
      bascarsija: {
        active: true,
        locked: false,
        mahala_reputacija: 0,   // 0-100
        klub_tier: 1,            // 1-3
        sessions_played: 0,
        bad_rep_events_this_season: 0,
        next_night_income_modifier: 1.0,
        clean_tech_triggered_this_session: false,
        max_crowd_this_session: 0
      },
      marijin_dvor: {
        active: false,
        locked: false,
        mahala_reputacija: 0,
        klub_tier: 1,
        sessions_played: 0,
        bad_rep_events_this_season: 0,
        next_night_income_modifier: 1.0,
        clean_tech_triggered_this_session: false,
        max_crowd_this_session: 0
      },
      grbavica: {
        active: false,
        locked: true,
        mahala_reputacija: 0,
        klub_tier: 1,
        sessions_played: 0,
        bad_rep_events_this_season: 0,
        next_night_income_modifier: 1.0,
        clean_tech_triggered_this_session: false,
        max_crowd_this_session: 0
      }
    },

    // --- Season ---
    season: {
      number: 1,
      nights_played: 0,
      bad_rep_events_total: 0
    },

    // --- Active session (null when not in session) ---
    active_session: null,
    /*  active_session shape:
        {
          kvart: 'bascarsija' | 'marijin_dvor' | 'grbavica',
          start_time_ms: Number,
          elapsed_sec: 0,
          slider_pos: 0,          // -100..+100
          wave_pos: 0,            // current wave value
          wave_time: 0,           // accumulated time for sin
          crowd_level: 30,        // 0-100 (capped per A upgrade)
          seconds_in_vibe: 0,
          lp_earned: 0,
          failed: false,
          is_daily_challenge: false,
          daily_lp_multiplier: 1.0
        }
    */

    // --- Screens ---
    current_screen: 'start', // 'start' | 'macro' | 'session' | 'prestige' | 'win'
    selected_kvart: null,    // kvart name player has highlighted on macro map

    // --- Achievements ---
    achievements: {
      sarajevo_achievement: false,    // sva 3 kvarta pokrivena bar 1×
      avala_headliner_eligible: false,
      first_legend_moment: false,
      first_prestige: false,
      grbavica_legend: false
    },

    // --- DK Shop ---
    dk_shop_purchases: [],   // array of DK_SHOP_ITEMS.id strings

    // --- Daily Challenge ---
    daily_challenge: {
      date_str: null,
      completed: false,
      score: 0
    },

    // --- Idle / offline ---
    last_tick_timestamp: Date.now(),

    // --- Player meta ---
    player_name: 'DJ Neznani',
    created_at: Date.now()
  };
}

// ----------------------------------------------------------------
//  loadState — from localStorage; applies migrations
// ----------------------------------------------------------------
export function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== STATE_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

// ----------------------------------------------------------------
//  saveState — to localStorage
// ----------------------------------------------------------------
export function saveState(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // quota or private mode — silent fail
  }
}

// ----------------------------------------------------------------
//  resetState — wipe save (used when starting fresh game)
// ----------------------------------------------------------------
export function resetState() {
  localStorage.removeItem(SAVE_KEY);
}

// ----------------------------------------------------------------
//  applyOfflineProgress — called on load if timestamp stale
//  Returns { gained_lp, hours_elapsed } for UI display
// ----------------------------------------------------------------
export function applyOfflineProgress(state) {
  const now = Date.now();
  const elapsed_ms = now - state.last_tick_timestamp;
  const elapsed_hours = Math.min(elapsed_ms / 3600000, OFFLINE_CAP_HOURS);

  if (elapsed_hours < 0.016) {
    // Less than ~1 minute — nothing meaningful
    state.last_tick_timestamp = now;
    return { gained_lp: 0, hours_elapsed: 0 };
  }

  const lp_per_hour = calcIdleLPPerHour(state);
  const gained_lp = lp_per_hour * elapsed_hours;

  state.lp += gained_lp;
  state.total_lp_earned_this_run += gained_lp;
  state.last_tick_timestamp = now;

  return { gained_lp: Math.floor(gained_lp), hours_elapsed: Math.round(elapsed_hours * 10) / 10 };
}

// ----------------------------------------------------------------
//  Helpers
// ----------------------------------------------------------------

/** @returns {number} current crowd cap based on A upgrade */
export function getCrowdCap(state) {
  const caps = [60, 70, 80, 90, 95, 100];
  return caps[state.upgrades.A] || 60;
}

/** @returns {number} crowd floor (min crowd) from E upgrade */
export function getCrowdFloor(state) {
  const floors = [0, 3, 6, 9, 12, 15];
  let floor = floors[state.upgrades.E] || 0;
  // DK shop "Sarajevo duh" adds 6
  if (state.dk_shop_purchases.includes('sarajevo_duh')) floor += 6;
  // A5 adds 5
  if (state.upgrades.A >= 5) floor += 5;
  return floor;
}

/** @returns {number} LP multiplier from upgrade B */
export function getBGenreBonus(state, kvart) {
  const b = state.upgrades.B;
  const bonuses = [0, 0.10, 0.20, 0.35, 0.50, 0.75];
  let bonus = bonuses[b] || 0;
  // B5: all kvarts get extra +10%
  if (b >= 5) bonus += 0.10;
  return bonus;
}

/** @returns {number} booking fee multiplier from C/C+ */
export function getBookingFeeMulti(state) {
  const c_fees = [1.0, 1.20, 1.45, 1.75, 2.10];
  let fee = c_fees[Math.min(state.upgrades.C, 4)];
  if (state.upgrades.Cplus >= 1) fee = 2.5;
  if (state.upgrades.Cplus >= 2) fee = 3.0;
  return fee;
}

/** @returns {number} viral multiplier from D */
export function getViralMulti(state) {
  const vms = [1.0, 1.15, 1.35, 1.60, 2.0];
  return vms[Math.min(state.upgrades.D, 4)];
}

/** @returns {number} Grbavica instant fail chance */
export function getGrbavicaFailChance(state) {
  const base = 0.20;
  const reduction = state.upgrades.E * 0.03;
  const chance = Math.max(0, base - reduction);
  // E5: eliminates fail in Baščaršija and MD, but E alone doesn't eliminate Grbavica
  return chance;
}

/** @returns {boolean} is prestige 1 available? */
export function canPrestige1(state) {
  return (
    state.prestige_level === 0 &&
    state.total_lp_earned_this_run >= 500 &&
    state.achievements.sarajevo_achievement
  );
}

/** @returns {boolean} is prestige 2 available? */
export function canPrestige2(state) {
  if (state.prestige_level < 1) return false;
  if (state.total_lp_earned_this_run < 2500) return false;
  // All 3 kvarts must have tier-2+ rep (50+)
  return Object.values(state.kvartovi).every(k => k.mahala_reputacija >= 50);
}

/** @returns {number} LP per hour idle for the whole state */
// (full calc lives in idle.js; this is a thin wrapper for state.js consumers)
export function idleLPPerHour(state) {
  return calcIdleLPPerHour(state);
}
