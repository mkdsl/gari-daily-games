import { GAME_CONFIG } from '../config.js';

/** Get total daily actions available */
export function getTotalDailyActions(state) {
  return GAME_CONFIG.BASE_DAILY_ACTIONS
    + state.workers.hired * GAME_CONFIG.ACTIONS_PER_WORKER
    + (state.achievementBonuses?.dailyActions || 0);
}

/** Try to hire a worker */
export function hireWorker(state, audio) {
  if (state.workers.hired >= GAME_CONFIG.MAX_WORKERS) {
    return { success: false, reason: `Maksimalan broj radnika (${GAME_CONFIG.MAX_WORKERS}) dostignut.` };
  }
  const cost = GAME_CONFIG.WORKER_HIRE_COST;
  if (state.capital < cost) {
    return { success: false, reason: `Nedovoljno kapitala (${cost} din potrebno).` };
  }
  state.capital -= cost;
  state.workers.hired++;
  state.workers.dailyActionsTotal = getTotalDailyActions(state);
  if (audio) audio.playSfx('purchase');
  return { success: true };
}

/** Use a daily action. Returns true if action was available. */
export function useAction(state) {
  const total = getTotalDailyActions(state);
  if (state.workers.dailyActionsUsed >= total) return false;
  state.workers.dailyActionsUsed++;
  return true;
}

/** Actions remaining */
export function actionsRemaining(state) {
  const total = getTotalDailyActions(state);
  return Math.max(0, total - state.workers.dailyActionsUsed);
}

/** Reset daily actions (called on season end) */
export function resetDailyActions(state) {
  state.workers.dailyActionsUsed = 0;
  state.workers.dailyActionsTotal = getTotalDailyActions(state);
}
