/**
 * systems/workers.js — Daily action system and worker management.
 *
 * Daily actions budget:
 *   base = BASE_DAILY_ACTIONS (5)
 *   +ACTIONS_PER_WORKER (3) per hired worker
 *   +achievementBonuses.dailyActions if any
 *
 * Actions reset each season. Workers persist across seasons and prestige.
 */

import { GAME_CONFIG } from '../config.js';

// ─── Action budget ────────────────────────────────────────────────────────────

/**
 * Get total daily actions available this season.
 * @param {object} state
 * @returns {number}
 */
export function getTotalDailyActions(state) {
  const base = GAME_CONFIG.BASE_DAILY_ACTIONS;
  const workerBonus = state.workers.hired * GAME_CONFIG.ACTIONS_PER_WORKER;
  const achievementBonus = state.achievementBonuses?.dailyActions || 0;
  return base + workerBonus + achievementBonus;
}

/**
 * Check if player has at least N actions remaining.
 * @param {object} state
 * @param {number} n
 * @returns {boolean}
 */
export function hasActions(state, n = 1) {
  return actionsRemaining(state) >= n;
}

/**
 * Use N daily actions. Returns true if successful.
 * @param {object} state
 * @param {number} n - Number of actions to use (default 1)
 * @returns {boolean}
 */
export function useAction(state, n = 1) {
  if (!hasActions(state, n)) return false;
  state.workers.dailyActionsUsed += n;
  return true;
}

/**
 * Actions remaining this season.
 * @param {object} state
 * @returns {number}
 */
export function actionsRemaining(state) {
  const total = getTotalDailyActions(state);
  return Math.max(0, total - state.workers.dailyActionsUsed);
}

/**
 * Reset daily actions (called at season end).
 * @param {object} state
 */
export function resetDailyActions(state) {
  state.workers.dailyActionsUsed = 0;
  state.workers.dailyActionsTotal = getTotalDailyActions(state);
}

// ─── Worker hiring ────────────────────────────────────────────────────────────

/**
 * Try to hire a worker. Costs WORKER_HIRE_COST din.
 * @param {object} state
 * @param {object|null} audio
 * @returns {{ success: boolean, reason?: string, hired?: number }}
 */
export function hireWorker(state, audio) {
  if (state.workers.hired >= GAME_CONFIG.MAX_WORKERS) {
    return {
      success: false,
      reason: `Maksimalan broj radnika (${GAME_CONFIG.MAX_WORKERS}) dostignut.`,
    };
  }

  const cost = GAME_CONFIG.WORKER_HIRE_COST;
  if (state.capital < cost) {
    return {
      success: false,
      reason: `Nedovoljno kapitala. Potrebno ${cost.toLocaleString()} din, imas ${Math.floor(state.capital).toLocaleString()} din.`,
    };
  }

  state.capital -= cost;
  state.workers.hired++;
  state.workers.dailyActionsTotal = getTotalDailyActions(state);

  if (audio) audio.playSfx('purchase');

  return { success: true, hired: state.workers.hired };
}

/**
 * Fire a worker (refund 50% of cost). Optional management operation.
 * @param {object} state
 * @returns {{ success: boolean, reason?: string }}
 */
export function fireWorker(state) {
  if (state.workers.hired <= 0) {
    return { success: false, reason: 'Nema radnika za otpuštanje.' };
  }
  const refund = Math.floor(GAME_CONFIG.WORKER_HIRE_COST * 0.5);
  state.workers.hired--;
  state.capital += refund;
  state.workers.dailyActionsTotal = getTotalDailyActions(state);
  return { success: true, refund };
}

// ─── Worker unlock tiers ──────────────────────────────────────────────────────

const WORKER_TIERS = [
  {
    phase: '0',
    slot: 0,
    title: 'Sezonski radnik',
    desc: 'Pomaže sa beranjem i inokulacijom. +3 dnevne akcije.',
    actions: 3,
  },
  {
    phase: 'A',
    slot: 1,
    title: 'Iskusniji radnik',
    desc: 'Zna da radi u plastenicima i ribnjaku. +3 dnevne akcije.',
    actions: 3,
  },
  {
    phase: 'B',
    slot: 2,
    title: 'Tim vođa',
    desc: 'Koordinira sve operacije. Masterclass podrška. +3 dnevne akcije.',
    actions: 3,
  },
];

/**
 * Get available worker tier info for the current phase.
 * @param {object} state
 * @returns {Array} Array of tier objects player can hire
 */
export function getWorkerUnlockPhase(state) {
  const phaseOrder = ['0', 'A', 'B', 'C'];
  const currentIdx = phaseOrder.indexOf(state.phase);
  return WORKER_TIERS.filter((t, i) => {
    const tierPhaseIdx = phaseOrder.indexOf(t.phase);
    return tierPhaseIdx <= currentIdx && i >= state.workers.hired;
  });
}

/**
 * Get the next available worker slot info.
 * @param {object} state
 * @returns {object|null}
 */
export function getNextWorkerSlot(state) {
  if (state.workers.hired >= GAME_CONFIG.MAX_WORKERS) return null;
  return WORKER_TIERS[state.workers.hired] || null;
}

// ─── Display helpers ──────────────────────────────────────────────────────────

/**
 * Get worker status summary for UI display.
 * @param {object} state
 * @returns {object} Status object for UI rendering
 */
export function getWorkerStatus(state) {
  const total = getTotalDailyActions(state);
  const used = state.workers.dailyActionsUsed;
  const remaining = Math.max(0, total - used);
  const nextSlot = getNextWorkerSlot(state);

  return {
    hired: state.workers.hired,
    maxWorkers: GAME_CONFIG.MAX_WORKERS,
    cost: GAME_CONFIG.WORKER_HIRE_COST,
    canAfford: state.capital >= GAME_CONFIG.WORKER_HIRE_COST,
    canHire: state.workers.hired < GAME_CONFIG.MAX_WORKERS,
    totalActions: total,
    usedActions: used,
    remainingActions: remaining,
    depletedPct: total > 0 ? (used / total) * 100 : 0,
    nextSlot,
    nextSlotTitle: nextSlot?.title || 'Maksimalan tim dostignut',
    actionsDisplay: `${remaining}/${total}`,
  };
}

/**
 * Get formatted action breakdown string for tooltip.
 * @param {object} state
 * @returns {string}
 */
export function getActionBreakdownTooltip(state) {
  const base = GAME_CONFIG.BASE_DAILY_ACTIONS;
  const workerBonus = state.workers.hired * GAME_CONFIG.ACTIONS_PER_WORKER;
  const achieveBonus = state.achievementBonuses?.dailyActions || 0;
  const total = base + workerBonus + achieveBonus;

  let parts = [`Baza: ${base}`];
  if (workerBonus > 0) parts.push(`Radnici (${state.workers.hired}×3): +${workerBonus}`);
  if (achieveBonus > 0) parts.push(`Achievement bonus: +${achieveBonus}`);
  parts.push(`Ukupno: ${total}`);
  return parts.join(' | ');
}

/**
 * Return efficiency percentage (actions used / total) — for HUD indicator.
 * 0% = fresh, 100% = all used.
 * @param {object} state
 * @returns {number} 0–100
 */
export function getActionUsagePct(state) {
  const total = getTotalDailyActions(state);
  if (total === 0) return 100;
  return Math.min(100, (state.workers.dailyActionsUsed / total) * 100);
}
