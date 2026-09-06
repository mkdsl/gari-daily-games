/**
 * @module validation
 * Assignment validation: checks rain blocks, group capacity, and scheduling window.
 *
 * Validation is split into:
 *   - Hard blocks (ok: false)     → assignment is forbidden
 *   - Soft warnings (severity: 'warning') → assignment allowed but suboptimal
 *
 * Rain block and capacity full are hard blocks.
 * Out-of-window is a soft warning (reduced score, not blocked).
 */

import { TASKS } from '../content/tasks.js';
import { isBlockedByRain, isInWindow, getEffectiveWindow } from './weather.js';
import { getWeekGroupUsage } from '../state.js';

// ─── Typedefs ──────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} ok              - Whether assignment is allowed
 * @property {string|null} reason      - Human-readable reason (for error display)
 * @property {string|null} reason_code - Machine-readable code
 * @property {'error'|'warning'|null} severity - Severity level
 */

// ─── Core Validation ──────────────────────────────────────────────────────────

/**
 * Validate whether a task can be assigned to a week.
 *
 * Checks (in order):
 *   1. Task exists
 *   2. Weather initialized
 *   3. Rain block (hard — only tasks with blocked_by_rain: true)
 *   4. Group capacity (hard — week must have room)
 *   5. Window alignment (soft warning — out-of-window reduces score but allowed)
 *
 * @param {import('../state.js').GameState} state
 * @param {string} taskId
 * @param {number} week
 * @returns {ValidationResult}
 */
export function validateAssign(state, taskId, week) {
  const task = TASKS.find((t) => t.id === taskId);

  if (!task) {
    return {
      ok: false,
      reason: 'Nepoznat zadatak.',
      reason_code: 'unknown_task',
      severity: 'error',
    };
  }

  if (!state.weather) {
    return {
      ok: false,
      reason: 'Vreme nije inicijalizovano.',
      reason_code: 'no_weather',
      severity: 'error',
    };
  }

  // 1. Rain block check
  if (isBlockedByRain(task, week, state.weather)) {
    return {
      ok: false,
      reason: `🌧️ Kiša blokira "${task.name}" u nedelji ${week}.`,
      reason_code: 'rain_block',
      severity: 'error',
    };
  }

  // 2. Capacity check (account for the task being moved, not double-counting it)
  const taskCost = getEffectiveTaskCost(state, task);
  const currentUsage = getWeekGroupUsage(state, week);

  // If this task is already assigned to this week, don't count it again
  const alreadyHere = state.assignments.some((a) => a.task_id === taskId && a.week === week);
  const usageWithoutThisTask = alreadyHere ? currentUsage - taskCost : currentUsage;

  if (usageWithoutThisTask + taskCost > state.groups_per_week) {
    return {
      ok: false,
      reason: `👷 Nedelja ${week} nema mesta! (${usageWithoutThisTask + taskCost}/${state.groups_per_week} grupe)`,
      reason_code: 'capacity_full',
      severity: 'error',
    };
  }

  // 3. Window check (soft warning, not blocking)
  if (!isInWindow(task, week, state.weather)) {
    const { start, end } = getEffectiveWindow(task, state.weather);
    return {
      ok: true,
      reason: `⚠️ "${task.name}" van optimalnog prozora (N${start}–N${end}). Poeni ×0.6.`,
      reason_code: 'out_of_window',
      severity: 'warning',
    };
  }

  // All good
  return {
    ok: true,
    reason: null,
    reason_code: null,
    severity: null,
  };
}

// ─── Bulk Validation ──────────────────────────────────────────────────────────

/**
 * Validate all current assignments in the state.
 * Returns a map of taskId → ValidationResult for each assigned task.
 * @param {import('../state.js').GameState} state
 * @returns {Map<string, ValidationResult>}
 */
export function validateAllAssignments(state) {
  const results = new Map();
  for (const a of state.assignments) {
    const result = validateAssign(state, a.task_id, a.week);
    results.set(a.task_id, result);
  }
  return results;
}

/**
 * Count how many current assignments have errors.
 * @param {import('../state.js').GameState} state
 * @returns {{ errors: number, warnings: number }}
 */
export function countValidationIssues(state) {
  let errors = 0;
  let warnings = 0;
  for (const a of state.assignments) {
    const result = validateAssign(state, a.task_id, a.week);
    if (!result.ok) errors++;
    else if (result.severity === 'warning') warnings++;
  }
  return { errors, warnings };
}

// ─── Cell State Computation ───────────────────────────────────────────────────

/**
 * Get the display status for a grid cell.
 * Used by ui/grid.js to apply CSS classes.
 *
 * Possible states:
 *   'empty'        — nothing assigned here
 *   'assigned'     — task assigned, in window
 *   'out-of-window'— task assigned, out of window
 *   'blocked-rain' — this week has rain blocking this task
 *   'capacity-full'— week is full
 *   'selected'     — this cell's task row is currently selected (no assignment yet)
 *   'error'        — this cell has an active error
 *   'valid-target' — selected task could be assigned here
 *
 * @param {import('../state.js').GameState} state
 * @param {string} taskId
 * @param {number} week
 * @returns {string}
 */
export function getCellStatus(state, taskId, week) {
  const task = TASKS.find((t) => t.id === taskId);
  if (!task) return 'empty';

  const assignment = state.assignments.find((a) => a.task_id === taskId);

  // Is this cell in the error state?
  if (state.error_cell && state.error_cell.taskId === taskId && state.error_cell.week === week) {
    return 'error';
  }

  // Does this task have an assignment anywhere?
  if (assignment) {
    if (assignment.week !== week) return 'empty';
    // This is the assigned cell
    if (!state.weather) return 'assigned';
    const inWindow = isInWindow(task, week, state.weather);
    return inWindow ? 'assigned' : 'out-of-window';
  }

  // Unassigned task — check if a card is selected and this is a valid target
  if (state.selected_task_id) {
    if (state.selected_task_id !== taskId) return 'empty';

    if (!state.weather) return 'selected';

    // Check if selected task can go here
    if (isBlockedByRain(task, week, state.weather)) {
      return 'blocked-rain';
    }
    const taskCost = getEffectiveTaskCost(state, task);
    const usage = getWeekGroupUsage(state, week);
    if (usage + taskCost > state.groups_per_week) {
      return 'capacity-full';
    }
    return 'valid-target';
  }

  return 'empty';
}

// ─── Valid Weeks for Task ─────────────────────────────────────────────────────

/**
 * Get all weeks where a task can be validly assigned (no hard blocks, within capacity).
 * Does NOT filter by window — out-of-window weeks are still "valid" (just with reduced score).
 * @param {import('../state.js').GameState} state
 * @param {string} taskId
 * @returns {number[]}
 */
export function getValidWeeksForTask(state, taskId) {
  const valid = [];
  for (let week = 1; week <= 12; week++) {
    const result = validateAssign(state, taskId, week);
    if (result.ok) valid.push(week);
  }
  return valid;
}

/**
 * Get all weeks where a task would be in its optimal window AND valid.
 * These are the "best" weeks for a task (full score potential).
 * @param {import('../state.js').GameState} state
 * @param {string} taskId
 * @returns {number[]}
 */
export function getOptimalWeeksForTask(state, taskId) {
  const task = TASKS.find((t) => t.id === taskId);
  if (!task || !state.weather) return [];

  const optimal = [];
  for (let week = 1; week <= 12; week++) {
    const result = validateAssign(state, taskId, week);
    if (result.ok && result.severity !== 'warning') {
      optimal.push(week);
    }
  }
  return optimal;
}

/**
 * Get blocked weeks for a task (rain block or capacity).
 * @param {import('../state.js').GameState} state
 * @param {string} taskId
 * @returns {{ week: number, reason: string }[]}
 */
export function getBlockedWeeksForTask(state, taskId) {
  const blocked = [];
  for (let week = 1; week <= 12; week++) {
    const result = validateAssign(state, taskId, week);
    if (!result.ok) {
      blocked.push({ week, reason: result.reason_code ?? 'unknown' });
    }
  }
  return blocked;
}

/**
 * Get a suggestion for the best week to assign an unassigned task.
 * Prefers in-window weeks with available capacity and no rain.
 * @param {import('../state.js').GameState} state
 * @param {string} taskId
 * @returns {number|null} suggested week, or null if none found
 */
export function suggestWeekForTask(state, taskId) {
  const task = TASKS.find((t) => t.id === taskId);
  if (!task || !state.weather) return null;

  // Score each week: higher = better
  let bestWeek = null;
  let bestScore = -Infinity;

  for (let week = 1; week <= 12; week++) {
    const result = validateAssign(state, taskId, week);
    if (!result.ok) continue;

    let score = 0;
    // Prefer in-window
    if (result.severity !== 'warning') score += 10;
    // Prefer weeks with some remaining capacity
    const remaining = state.groups_per_week - getWeekGroupUsage(state, week);
    score += remaining;
    // Prefer center of window
    if (state.weather) {
      const { start, end } = getEffectiveWindow(task, state.weather);
      const center = (start + end) / 2;
      score -= Math.abs(week - center);
    }

    if (score > bestScore) {
      bestScore = score;
      bestWeek = week;
    }
  }

  return bestWeek;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Get the effective group cost for a task given prestige bonus.
 * @param {import('../state.js').GameState} state
 * @param {import('../content/tasks.js').Task} task
 * @returns {number}
 */
export function getEffectiveTaskCost(state, task) {
  if (state.prestige_bonus === 'cheap_micelij' && task.id === 'micelij') {
    return 1;
  }
  return task.group_cost;
}

/**
 * Build a human-readable validation summary for all current assignments.
 * @param {import('../state.js').GameState} state
 * @returns {string}
 */
export function buildValidationSummary(state) {
  const issues = [];
  for (const a of state.assignments) {
    const result = validateAssign(state, a.task_id, a.week);
    if (!result.ok || result.severity === 'warning') {
      const task = TASKS.find((t) => t.id === a.task_id);
      const taskName = task?.name ?? a.task_id;
      issues.push(`${taskName} (N${a.week}): ${result.reason}`);
    }
  }
  if (issues.length === 0) return 'Sve dodele su validne.';
  return issues.join('\n');
}
