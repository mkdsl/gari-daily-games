// ============================================================
//  systems/daily_challenge.js — Sarajevo ili Smrt
//  LCG seed po datumu, daily score, localStorage leaderboard.
// ============================================================

import { KVART_ORDER, KVART_NAMES } from '../config.js';

const LB_KEY = 'sarajevo-ili-smrt-daily-lb';

// ----------------------------------------------------------------
//  LCG (Linear Congruential Generator)
// ----------------------------------------------------------------
/**
 * @param {number} seed
 * @returns {number} new seed (unsigned 32-bit)
 */
function lcg(seed) {
  return ((seed * 1664525 + 1013904223) >>> 0);
}

// ----------------------------------------------------------------
//  Daily seed from date string
// ----------------------------------------------------------------
/**
 * @param {string} date_str  'YYYY-MM-DD'
 * @returns {number} seed
 */
function seedFromDate(date_str) {
  return parseInt(date_str.replace(/-/g, ''), 10);
}

// ----------------------------------------------------------------
//  Generate today's challenge params
// ----------------------------------------------------------------
/**
 * @returns {{
 *   date_str: string,
 *   kvart: string,
 *   kvart_name: string,
 *   klub_tier: number,
 *   handicap: number,
 *   handicap_label: string,
 *   lp_multiplier: number
 * }}
 */
export function generateDailyChallenge() {
  const today = new Date().toISOString().slice(0, 10);
  let s = seedFromDate(today);

  // kvart index
  s = lcg(s);
  const kvart_index = s % 3;
  const kvart = KVART_ORDER[kvart_index];

  // klub tier 1-3
  s = lcg(s);
  const klub_tier = (s % 3) + 1;

  // handicap: 0=none, 1=faster_wave, 2=crowd_cap_50, 3=double_grbavica
  s = lcg(s);
  const handicap = s % 4;

  // lp_multiplier: 1.5 + (0-9)*0.1
  s = lcg(s);
  const lp_mult_bonus = (Math.abs(s) % 10) * 0.1;
  const lp_multiplier = Math.round((1.5 + lp_mult_bonus) * 10) / 10;

  const HANDICAP_LABELS = [
    'Normalno',
    'Brži talas',
    'Cap 50 crowd',
    'Dvostruki Grbavica rizik'
  ];

  return {
    date_str: today,
    kvart,
    kvart_name: KVART_NAMES[kvart] ?? kvart,
    klub_tier,
    handicap,
    handicap_label: HANDICAP_LABELS[handicap],
    lp_multiplier
  };
}

// ----------------------------------------------------------------
//  Check if today's challenge already completed
// ----------------------------------------------------------------
/**
 * @param {object} state
 * @returns {boolean}
 */
export function isDailyCompleted(state) {
  const today = new Date().toISOString().slice(0, 10);
  return state.daily_challenge.date_str === today && state.daily_challenge.completed;
}

// ----------------------------------------------------------------
//  Complete daily challenge — save score
// ----------------------------------------------------------------
/**
 * @param {object} state
 * @param {number} lp_earned
 */
export function completeDailyChallenge(state, lp_earned) {
  const today = new Date().toISOString().slice(0, 10);
  state.daily_challenge.date_str = today;
  state.daily_challenge.completed = true;
  state.daily_challenge.score = lp_earned;

  // Save to leaderboard
  _saveToLeaderboard(today, lp_earned, state.player_name);
}

// ----------------------------------------------------------------
//  Local leaderboard (top 10 per day in localStorage)
// ----------------------------------------------------------------
function _saveToLeaderboard(date_str, score, player_name) {
  try {
    const raw = localStorage.getItem(LB_KEY);
    const lb = raw ? JSON.parse(raw) : {};
    if (!lb[date_str]) lb[date_str] = [];

    lb[date_str].push({ name: player_name, score, ts: Date.now() });
    lb[date_str].sort((a, b) => b.score - a.score);
    lb[date_str] = lb[date_str].slice(0, 10); // top 10

    // Keep only last 7 days
    const keys = Object.keys(lb).sort().slice(-7);
    const trimmed = {};
    for (const k of keys) trimmed[k] = lb[k];
    localStorage.setItem(LB_KEY, JSON.stringify(trimmed));
  } catch {
    // silent fail
  }
}

/**
 * @param {string} date_str
 * @returns {Array<{ name: string, score: number }>}
 */
export function getDailyLeaderboard(date_str) {
  try {
    const raw = localStorage.getItem(LB_KEY);
    if (!raw) return [];
    const lb = JSON.parse(raw);
    return lb[date_str] ?? [];
  } catch {
    return [];
  }
}

/**
 * Apply handicap modifiers to active session state.
 * Call right after startSession when is_daily_challenge is true.
 * @param {object} session  — state.active_session
 * @param {number} handicap
 * @param {object} state
 */
export function applyDailyHandicap(session, handicap, state) {
  switch (handicap) {
    case 1: // faster_wave — wave_time advances 2× faster (done in session.js via extra dt)
      session._daily_wave_speed_factor = 2.0;
      break;
    case 2: // crowd_cap_50
      session._daily_crowd_cap_override = 50;
      break;
    case 3: // double_grbavica — double fail chance even in non-Grbavica kvarts
      session._daily_grbavica_double = true;
      break;
    default:
      break;
  }
}
