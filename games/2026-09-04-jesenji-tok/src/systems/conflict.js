/**
 * @module conflict
 * Conflict detection, error message routing, and error animation triggers.
 *
 * Works with validation.js to produce user-facing error state.
 * The conflict module is responsible for:
 *   1. Detecting conflicts from validation results
 *   2. Managing the error state lifecycle (set → display → auto-clear)
 *   3. Generating user-friendly error messages
 *   4. Providing conflict analysis summaries for the UI
 */

import { validateAssign, countValidationIssues } from './validation.js';
import { TASKS } from '../content/tasks.js';

// ─── Constants ────────────────────────────────────────────────────────────────

/** How long (ms) to show an error before auto-clearing */
export const ERROR_DISPLAY_DURATION = 2800;

/** How long (ms) to show a warning (shorter than error) */
export const WARNING_DISPLAY_DURATION = 2000;

// ─── Typedefs ─────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} ConflictState
 * @property {boolean} hasConflict     - Whether a blocking conflict exists
 * @property {string|null} taskId      - Task involved in conflict
 * @property {number|null} week        - Week involved in conflict
 * @property {string|null} message     - User-facing message
 * @property {string|null} reason_code - Machine-readable reason
 * @property {'error'|'warning'|null} severity
 * @property {number} timestamp        - When conflict was detected (ms)
 */

// ─── Conflict Detection ───────────────────────────────────────────────────────

/**
 * Check for conflicts when assigning a task to a week.
 * Returns a full conflict state including warnings.
 * @param {import('../state.js').GameState} state
 * @param {string} taskId
 * @param {number} week
 * @returns {ConflictState}
 */
export function detectConflict(state, taskId, week) {
  const validation = validateAssign(state, taskId, week);

  if (!validation.ok) {
    return {
      hasConflict: true,
      taskId,
      week,
      message: validation.reason,
      reason_code: validation.reason_code,
      severity: validation.severity ?? 'error',
      timestamp: Date.now(),
    };
  }

  if (validation.severity === 'warning') {
    return {
      hasConflict: false,
      taskId,
      week,
      message: validation.reason,
      reason_code: validation.reason_code,
      severity: 'warning',
      timestamp: Date.now(),
    };
  }

  return {
    hasConflict: false,
    taskId: null,
    week: null,
    message: null,
    reason_code: null,
    severity: null,
    timestamp: 0,
  };
}

// ─── Error Messages ───────────────────────────────────────────────────────────

/**
 * Get a user-friendly error message based on reason code.
 * Falls back to a generic message for unknown codes.
 * @param {string} reasonCode
 * @param {string} taskName
 * @param {number} week
 * @returns {string}
 */
export function getErrorMessage(reasonCode, taskName, week) {
  const messages = {
    rain_block: `🌧️ Kiša blokira radove u nedelji ${week}! "${taskName}" ne može u mokro.`,
    capacity_full: `👷 Nedelja ${week} je puna! Premesti drugi zadatak ili izaberi drugu nedelju.`,
    out_of_window: `⚠️ "${taskName}" van optimalnog prozora u nedelji ${week} — poeni ×0.6.`,
    unknown_task: `Nepoznat zadatak "${taskName}".`,
    no_weather: 'Vremenska prognoza nije inicijalizovana — osvežite stranicu.',
  };
  return messages[reasonCode] ?? `Nevažeća dodela za "${taskName}" u nedelji ${week}.`;
}

/**
 * Get a short conflict label for the HUD or inline display.
 * @param {string} reasonCode
 * @returns {string}
 */
export function getShortConflictLabel(reasonCode) {
  const labels = {
    rain_block: '🌧️ Kiša blokira',
    capacity_full: '👷 Puna nedelja',
    out_of_window: '⚠️ Van prozora',
    unknown_task: '❓ Nepoznat',
    no_weather: '⚙️ Greška',
  };
  return labels[reasonCode] ?? '❌ Greška';
}

// ─── Error State Management ───────────────────────────────────────────────────

/**
 * Apply error state to game state for UI shake/highlight.
 * This sets the transient error fields on the state object.
 * @param {import('../state.js').GameState} state
 * @param {string} taskId
 * @param {number} week
 * @param {string} message
 */
export function setErrorState(state, taskId, week, message) {
  state.error_cell = { taskId, week };
  state.error_task = taskId;
  state.error_message = message;
  state.error_timestamp = Date.now();
}

/**
 * Clear error state if it has expired (past ERROR_DISPLAY_DURATION).
 * Called on every render tick to auto-clear stale errors.
 * @param {import('../state.js').GameState} state
 */
export function tickErrorState(state) {
  if (!state.error_timestamp) return;
  const elapsed = Date.now() - state.error_timestamp;
  const duration = state.error_cell?.severity === 'warning'
    ? WARNING_DISPLAY_DURATION
    : ERROR_DISPLAY_DURATION;

  if (elapsed > duration) {
    clearErrorState(state);
  }
}

/**
 * Manually clear error state immediately.
 * @param {import('../state.js').GameState} state
 */
export function clearErrorState(state) {
  state.error_cell = null;
  state.error_task = null;
  state.error_message = null;
  state.error_timestamp = null;
}

/**
 * Check if a given cell is currently in error state.
 * @param {import('../state.js').GameState} state
 * @param {string} taskId
 * @param {number} week
 * @returns {boolean}
 */
export function isCellInError(state, taskId, week) {
  return !!(
    state.error_cell &&
    state.error_cell.taskId === taskId &&
    state.error_cell.week === week
  );
}

// ─── Capacity Summary ─────────────────────────────────────────────────────────

/**
 * Generate a visual capacity bar string for a week.
 * Uses block characters to show usage/total.
 * Example: "▓▓░ 2/3"
 * @param {import('../state.js').GameState} state
 * @param {number} week
 * @returns {string}
 */
export function getCapacitySummary(state, week) {
  const weekAssigns = state.assignments.filter((a) => a.week === week);
  let used = 0;
  for (const a of weekAssigns) {
    const task = TASKS.find((t) => t.id === a.task_id);
    let cost = task?.group_cost ?? 1;
    if (state.prestige_bonus === 'cheap_micelij' && a.task_id === 'micelij') {
      cost = 1;
    }
    used += cost;
  }
  const total = state.groups_per_week;
  const filledBar = '▓'.repeat(Math.min(used, total));
  const emptyBar = '░'.repeat(Math.max(0, total - used));
  const overBar = used > total ? ` (+${used - total} !)` : '';
  return `${filledBar}${emptyBar} ${used}/${total}${overBar}`;
}

/**
 * Get a detailed capacity breakdown for a week — which tasks and their costs.
 * @param {import('../state.js').GameState} state
 * @param {number} week
 * @returns {{ task: string, cost: number }[]}
 */
export function getWeekCapacityDetails(state, week) {
  const weekAssigns = state.assignments.filter((a) => a.week === week);
  return weekAssigns.map((a) => {
    const task = TASKS.find((t) => t.id === a.task_id);
    let cost = task?.group_cost ?? 1;
    if (state.prestige_bonus === 'cheap_micelij' && a.task_id === 'micelij') {
      cost = 1;
    }
    return { task: task?.name ?? a.task_id, cost };
  });
}

// ─── Schedule Conflict Analysis ───────────────────────────────────────────────

/**
 * Scan all current assignments for conflicts.
 * Returns a list of conflicts to display in the UI.
 * @param {import('../state.js').GameState} state
 * @returns {Array<{ taskId: string, week: number, message: string, severity: string }>}
 */
export function scanAllConflicts(state) {
  const conflicts = [];
  for (const a of state.assignments) {
    const conflict = detectConflict(state, a.task_id, a.week);
    if (conflict.hasConflict || conflict.severity === 'warning') {
      const task = TASKS.find((t) => t.id === a.task_id);
      conflicts.push({
        taskId: a.task_id,
        week: a.week,
        message: conflict.message ?? '',
        severity: conflict.severity ?? 'warning',
        taskName: task?.name ?? a.task_id,
      });
    }
  }
  return conflicts;
}

/**
 * Get a summary string describing all current conflicts.
 * Returns null if no conflicts.
 * @param {import('../state.js').GameState} state
 * @returns {string|null}
 */
export function getConflictSummary(state) {
  const { errors, warnings } = countValidationIssues(state);
  if (errors === 0 && warnings === 0) return null;

  const parts = [];
  if (errors > 0) parts.push(`${errors} blokada`);
  if (warnings > 0) parts.push(`${warnings} upozorenja`);
  return parts.join(', ');
}

/**
 * Check if any current assignment is hard-blocked (not just a warning).
 * @param {import('../state.js').GameState} state
 * @returns {boolean}
 */
export function hasHardConflicts(state) {
  for (const a of state.assignments) {
    const result = validateAssign(state, a.task_id, a.week);
    if (!result.ok) return true;
  }
  return false;
}
