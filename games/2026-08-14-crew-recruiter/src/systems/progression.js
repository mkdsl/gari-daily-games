// systems/progression.js — Completed runs tracking, event type unlocks

import { EVENT_TYPE_CONFIGS } from '../config.js';
import { savePersistentState } from '../state.js';

/**
 * Check if a given event type is unlocked for the current run count.
 * @param {string} type
 * @param {number} completedRuns
 * @returns {boolean}
 */
export function isEventTypeUnlocked(type, completedRuns) {
  const cfg = EVENT_TYPE_CONFIGS[type];
  if (!cfg) return false;
  return completedRuns >= cfg.unlockAfter;
}

/**
 * Return all event types with their unlock status.
 * @param {number} completedRuns
 * @returns {{ type: string, unlocked: boolean, unlockAfter: number }[]}
 */
export function getUnlockedEventTypes(completedRuns) {
  return Object.keys(EVENT_TYPE_CONFIGS).map(type => ({
    type,
    unlocked:    isEventTypeUnlocked(type, completedRuns),
    unlockAfter: EVENT_TYPE_CONFIGS[type].unlockAfter
  }));
}

/**
 * Record a completed run: increments count, updates HOF, persists.
 * @param {import('../state.js').GameState} state
 * @param {number} vibeScore
 */
export function recordCompletedRun(state, vibeScore) {
  state.completedRuns++;
  // Add to HOF, keep last 3 (newest first)
  state.hallOfFame = [vibeScore, ...state.hallOfFame].slice(0, 3);
  savePersistentState(state);
}
