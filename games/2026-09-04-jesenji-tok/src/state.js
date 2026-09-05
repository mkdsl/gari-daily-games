/**
 * @module state
 * Game state shape, localStorage save/load, and state mutations.
 * All game state lives here. Other modules read state; only designated
 * mutation functions should write to it.
 *
 * State is partitioned:
 *   - Persistent: saved to localStorage on every change
 *   - Transient: ephemeral UI state that is NOT saved (error states, tooltip, selection)
 */

import { STORAGE_KEYS, BASE_GROUPS_PER_WEEK, WEEKS } from './config.js';
import { TASKS } from './content/tasks.js';

// ─── Typedefs ──────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} Assignment
 * @property {string} task_id    - ID of the assigned task
 * @property {number} week       - Week number (1-12)
 */

/**
 * @typedef {Object} WeatherState
 * @property {string}   preset_id          - ID of the weather preset
 * @property {string}   preset_name        - Display name
 * @property {string}   preset_emoji       - Emoji
 * @property {string}   preset_description - Full description
 * @property {number[]} rain_weeks         - Week numbers with rain
 * @property {number|null} frost_week      - Week when frost arrives (or null)
 * @property {number[]} hot_weeks          - Week numbers with hot weather
 * @property {number[]} forecast_revealed  - Which weeks the player knows about
 */

/**
 * @typedef {Object} GameState
 * @property {string}           phase            - 'ftue'|'planning'|'bura'|'score'|'prestige'
 * @property {number}           run_number       - Current run index (0-based)
 * @property {Assignment[]}     assignments      - Task assignments for this season
 * @property {WeatherState|null} weather         - Current weather state
 * @property {number}           groups_per_week  - Group points available per week
 * @property {string|null}      prestige_bonus   - Active prestige bonus ID
 * @property {string|null}      selected_task_id - Currently selected task card (transient)
 * @property {number|null}      last_score       - Score from last completed run
 * @property {string|null}      last_rank        - Rank from last completed run
 * @property {boolean}          bura_complete    - Whether zimska bura animation has finished
 * @property {number}           bura_week        - Which week the bura is currently revealing
 * @property {Record<string, boolean>} achievements - Unlocked achievements map
 * @property {Record<string, Object>}  score_breakdown - Score breakdown per task
 * @property {Object|null}      error_cell       - Cell with error (transient)
 * @property {string|null}      error_task       - Task ID with error (transient)
 * @property {string|null}      error_message    - Human-readable error (transient)
 * @property {number|null}      error_timestamp  - When error was set (transient)
 */

// ─── Factory ───────────────────────────────────────────────────────────────────

/**
 * Create a fresh game state with all defaults.
 * @returns {GameState}
 */
export function createState() {
  return {
    // Core
    phase: 'planning',
    run_number: 0,
    assignments: [],
    weather: null,
    groups_per_week: BASE_GROUPS_PER_WEEK,
    prestige_bonus: null,

    // Results
    last_score: null,
    last_rank: null,
    score_breakdown: {},

    // Bura animation tracking
    bura_complete: false,
    bura_week: 0,

    // Progression
    achievements: {},

    // Transient UI state (NOT persisted)
    selected_task_id: null,
    tooltip_target: null,
    tooltip_text: null,
    error_cell: null,
    error_task: null,
    error_message: null,
    error_timestamp: null,
  };
}

// ─── Persistence ───────────────────────────────────────────────────────────────

/**
 * Load game state from localStorage.
 * Returns null if no saved state exists or parsing fails.
 * Merges with defaults to handle schema changes between versions.
 * @returns {GameState|null}
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.state);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Merge with defaults to handle new fields added after a user played
    const merged = { ...createState(), ...parsed };
    // Always start transient state clean
    merged.selected_task_id = null;
    merged.error_cell = null;
    merged.error_task = null;
    merged.error_message = null;
    merged.error_timestamp = null;
    return merged;
  } catch (e) {
    console.warn('JT: failed to load state', e);
    return null;
  }
}

/**
 * Save game state to localStorage.
 * Strips transient UI state — only persistent fields are written.
 * @param {GameState} state
 */
export function saveState(state) {
  try {
    const toSave = {
      phase: state.phase,
      run_number: state.run_number,
      assignments: state.assignments,
      weather: state.weather,
      groups_per_week: state.groups_per_week,
      prestige_bonus: state.prestige_bonus,
      last_score: state.last_score,
      last_rank: state.last_rank,
      bura_complete: state.bura_complete,
      bura_week: state.bura_week,
      achievements: state.achievements,
      score_breakdown: state.score_breakdown,
    };
    localStorage.setItem(STORAGE_KEYS.state, JSON.stringify(toSave));
  } catch (e) {
    console.warn('JT: failed to save state', e);
  }
}

/**
 * Clear saved state from localStorage (for new game or reset).
 */
export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEYS.state);
  } catch (e) {
    console.warn('JT: failed to clear state', e);
  }
}

// ─── Prestige Persistence ──────────────────────────────────────────────────────

/**
 * Load prestige bonus from localStorage.
 * @returns {string|null}
 */
export function loadPrestigeBonus() {
  try {
    return localStorage.getItem(STORAGE_KEYS.prestige_bonus) || null;
  } catch (e) {
    return null;
  }
}

/**
 * Save prestige bonus to localStorage.
 * @param {string|null} bonusId
 */
export function savePrestigeBonus(bonusId) {
  try {
    if (bonusId) {
      localStorage.setItem(STORAGE_KEYS.prestige_bonus, bonusId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.prestige_bonus);
    }
  } catch (e) {
    console.warn('JT: failed to save prestige bonus', e);
  }
}

// ─── Score Persistence ────────────────────────────────────────────────────────

/**
 * Load best score ever achieved.
 * @returns {number}
 */
export function loadBestScore() {
  try {
    return parseInt(localStorage.getItem(STORAGE_KEYS.best_score) || '0', 10);
  } catch (e) {
    return 0;
  }
}

/**
 * Save best score if this run beat the previous record.
 * @param {number} score
 * @returns {boolean} whether this was a new best
 */
export function saveBestScore(score) {
  try {
    const current = loadBestScore();
    if (score > current) {
      localStorage.setItem(STORAGE_KEYS.best_score, String(score));
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

/**
 * Load the all-time best score as a formatted string, or empty string if none.
 * @returns {string}
 */
export function getBestScoreString() {
  const val = loadBestScore();
  return val > 0 ? String(val) : '';
}

// ─── Run Tracking ─────────────────────────────────────────────────────────────

/**
 * Increment and save total runs counter.
 * @returns {number} new total
 */
export function incrementTotalRuns() {
  try {
    const current = parseInt(localStorage.getItem(STORAGE_KEYS.total_runs) || '0', 10);
    const next = current + 1;
    localStorage.setItem(STORAGE_KEYS.total_runs, String(next));
    return next;
  } catch (e) {
    return 0;
  }
}

/**
 * Load total runs count.
 * @returns {number}
 */
export function loadTotalRuns() {
  try {
    return parseInt(localStorage.getItem(STORAGE_KEYS.total_runs) || '0', 10);
  } catch (e) {
    return 0;
  }
}

// ─── Assignment Mutations ─────────────────────────────────────────────────────

/**
 * Assign a task to a week.
 * Does NOT validate — call validateAssign() from systems/validation.js first.
 * If this task was previously assigned, the old assignment is replaced.
 * @param {GameState} state
 * @param {string} taskId
 * @param {number} week
 */
export function assignTask(state, taskId, week) {
  state.assignments = state.assignments.filter((a) => a.task_id !== taskId);
  state.assignments.push({ task_id: taskId, week });
}

/**
 * Unassign a task from any week, returning it to the unassigned pool.
 * @param {GameState} state
 * @param {string} taskId
 */
export function unassignTask(state, taskId) {
  state.assignments = state.assignments.filter((a) => a.task_id !== taskId);
}

/**
 * Unassign all tasks from a specific week.
 * @param {GameState} state
 * @param {number} week
 */
export function unassignWeek(state, week) {
  state.assignments = state.assignments.filter((a) => a.week !== week);
}

/**
 * Move an existing assignment from its current week to a new week.
 * No-op if the task is not currently assigned.
 * @param {GameState} state
 * @param {string} taskId
 * @param {number} newWeek
 * @returns {boolean} whether the move happened
 */
export function moveAssignment(state, taskId, newWeek) {
  const idx = state.assignments.findIndex((a) => a.task_id === taskId);
  if (idx === -1) return false;
  state.assignments[idx] = { task_id: taskId, week: newWeek };
  return true;
}

// ─── Assignment Queries ───────────────────────────────────────────────────────

/**
 * Get the assignment record for a task, or null if not assigned.
 * @param {GameState} state
 * @param {string} taskId
 * @returns {Assignment|null}
 */
export function getAssignment(state, taskId) {
  return state.assignments.find((a) => a.task_id === taskId) ?? null;
}

/**
 * Get all assignments for a given week.
 * @param {GameState} state
 * @param {number} week
 * @returns {Assignment[]}
 */
export function getWeekAssignments(state, week) {
  return state.assignments.filter((a) => a.week === week);
}

/**
 * Calculate how many group points are used in a given week.
 * Accounts for prestige bonus that reduces micelij cost.
 * @param {GameState} state
 * @param {number} week
 * @returns {number}
 */
export function getWeekGroupUsage(state, week) {
  const weekAssigns = getWeekAssignments(state, week);
  let total = 0;
  for (const a of weekAssigns) {
    const task = TASKS.find((t) => t.id === a.task_id);
    if (!task) continue;
    let cost = task.group_cost;
    if (state.prestige_bonus === 'cheap_micelij' && a.task_id === 'micelij') {
      cost = 1;
    }
    total += cost;
  }
  return total;
}

/**
 * Calculate remaining group capacity in a week.
 * @param {GameState} state
 * @param {number} week
 * @returns {number} remaining points (0 = full, negative = over capacity)
 */
export function getWeekGroupRemaining(state, week) {
  return state.groups_per_week - getWeekGroupUsage(state, week);
}

/**
 * Check if a specific week is at capacity.
 * @param {GameState} state
 * @param {number} week
 * @returns {boolean}
 */
export function isWeekFull(state, week) {
  return getWeekGroupUsage(state, week) >= state.groups_per_week;
}

/**
 * Check if a task has been assigned.
 * @param {GameState} state
 * @param {string} taskId
 * @returns {boolean}
 */
export function isTaskAssigned(state, taskId) {
  return state.assignments.some((a) => a.task_id === taskId);
}

/**
 * Check if all tasks are assigned.
 * @param {GameState} state
 * @returns {boolean}
 */
export function allTasksAssigned(state) {
  return TASKS.every((t) => isTaskAssigned(state, t.id));
}

/**
 * Get list of task IDs that are not yet assigned.
 * @param {GameState} state
 * @returns {string[]}
 */
export function getUnassignedTaskIds(state) {
  const assignedIds = new Set(state.assignments.map((a) => a.task_id));
  return TASKS.filter((t) => !assignedIds.has(t.id)).map((t) => t.id);
}

/**
 * Get count of assigned tasks.
 * @param {GameState} state
 * @returns {number}
 */
export function getAssignedCount(state) {
  return state.assignments.length;
}

/**
 * Get list of all weeks that have at least one assignment.
 * @param {GameState} state
 * @returns {number[]}
 */
export function getOccupiedWeeks(state) {
  const weeks = new Set(state.assignments.map((a) => a.week));
  return Array.from(weeks).sort((a, b) => a - b);
}

// ─── State Health Queries ─────────────────────────────────────────────────────

/**
 * Get a quick health summary of the current schedule.
 * Used by the HUD to show at-a-glance status.
 * @param {GameState} state
 * @returns {{ assigned: number, total: number, pct: number, allDone: boolean, hasConflicts: boolean }}
 */
export function getScheduleHealth(state) {
  const assigned = state.assignments.length;
  const total = TASKS.length;
  const pct = Math.round((assigned / total) * 100);
  const allDone = assigned === total;

  // Quick conflict check: any week over capacity?
  let hasConflicts = false;
  for (let w = 1; w <= WEEKS; w++) {
    if (getWeekGroupUsage(state, w) > state.groups_per_week) {
      hasConflicts = true;
      break;
    }
  }

  return { assigned, total, pct, allDone, hasConflicts };
}

/**
 * Get per-week capacity summary for all 12 weeks.
 * @param {GameState} state
 * @returns {Array<{ week: number, used: number, total: number, tasks: string[] }>}
 */
export function getWeekCapacitySummary(state) {
  return Array.from({ length: WEEKS }, (_, i) => {
    const week = i + 1;
    const weekAssigns = getWeekAssignments(state, week);
    const used = getWeekGroupUsage(state, week);
    const tasks = weekAssigns.map((a) => a.task_id);
    return { week, used, total: state.groups_per_week, tasks };
  });
}

// ─── Phase Management ─────────────────────────────────────────────────────────

/**
 * Transition to a new phase.
 * @param {GameState} state
 * @param {'planning'|'bura'|'score'|'prestige'} newPhase
 */
export function setPhase(state, newPhase) {
  state.phase = newPhase;
}

/**
 * Reset state for a new run, preserving prestige bonus and achievements.
 * @param {GameState} state
 * @param {string|null} newPrestigeBonus - prestige bonus for the new run
 */
export function resetForNewRun(state, newPrestigeBonus) {
  const runNumber = state.run_number + 1;
  const achievements = { ...state.achievements };
  Object.assign(state, createState());
  state.run_number = runNumber;
  state.prestige_bonus = newPrestigeBonus;
  state.achievements = achievements;
  // Apply prestige bonus effects
  if (newPrestigeBonus === 'extra_group') {
    state.groups_per_week = BASE_GROUPS_PER_WEEK + 1;
  }
}
