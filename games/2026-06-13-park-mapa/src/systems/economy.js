/**
 * economy.js — PT zarađivanje, trošenje, Budget tracker, weekly reset
 * Park Mapa | Jova jQuery
 */

import { CONFIG } from '../config.js';

/**
 * Add amount to state.pt, state.totalPtEarned, state.weeklyPtEarned.
 * Mutates state in place.
 * @param {Object} state
 * @param {number} amount
 * @param {string} [reason] - Optional label for debug/logbook
 * @returns {{ state: Object, earned: number }}
 */
export function earnPT(state, amount, reason = '') {
  const earned = Math.max(0, Math.floor(amount));
  state.pt = (state.pt || 0) + earned;
  state.totalPtEarned = (state.totalPtEarned || 0) + earned;
  state.weeklyPtEarned = (state.weeklyPtEarned || 0) + earned;

  if (reason && CONFIG.DEBUG) {
    console.log(`[economy] +${earned} PT (${reason}) | total: ${state.pt}`);
  }

  return { state, earned };
}

/**
 * Subtract amount from state.pt, add to state.weeklyPtSpent.
 * Mutates state in place.
 * @param {Object} state
 * @param {number} amount
 * @returns {boolean} True if successful, false if insufficient funds
 */
export function spendPT(state, amount) {
  const cost = Math.max(0, Math.floor(amount));
  if ((state.pt || 0) < cost) return false;

  state.pt -= cost;
  state.weeklyPtSpent = (state.weeklyPtSpent || 0) + cost;
  return true;
}

/**
 * Check if state has enough PT to cover cost.
 * @param {Object} state
 * @param {number} cost
 * @returns {boolean}
 */
export function canAfford(state, cost) {
  return (state.pt || 0) >= cost;
}

/**
 * Returns how much PT is unspent this week.
 * @param {Object} state
 * @returns {number}
 */
export function getWeeklyBudgetRemaining(state) {
  return (state.weeklyPtEarned || 0) - (state.weeklyPtSpent || 0);
}

/**
 * Get the ISO date string for the most recent Monday (UTC).
 * @returns {string} 'YYYY-MM-DD'
 */
function getMondayUTC() {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = (day === 0 ? -6 : 1 - day); // days back to Monday
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + diff);
  return monday.toISOString().slice(0, 10);
}

/**
 * Reset weekly counters. Sets weekStart to current Monday (UTC).
 * Call this on Monday.
 * @param {Object} state
 */
export function resetWeeklyBudget(state) {
  state.weeklyPtEarned = 0;
  state.weeklyPtSpent = 0;
  state.weekStart = getMondayUTC();
}

/**
 * Check if it's a new week (Monday UTC). If so, reset weekly budget.
 * @param {Object} state
 * @returns {boolean} True if reset happened
 */
export function checkAndResetWeeklyBudget(state) {
  const thisMonday = getMondayUTC();
  if (!state.weekStart || state.weekStart !== thisMonday) {
    resetWeeklyBudget(state);
    return true;
  }
  return false;
}

/**
 * Format PT amount for display.
 * 1500 → "1.5k", 1000000 → "1.0M", 999 → "999"
 * @param {number} amount
 * @returns {string}
 */
export function formatPT(amount) {
  if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1) + 'M';
  if (amount >= 1_000) return (amount / 1_000).toFixed(1) + 'k';
  return Math.floor(amount).toString();
}
