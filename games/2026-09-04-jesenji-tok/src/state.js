/**
 * @module state
 * Game state shape, localStorage save/load, and state mutations.
 * All game state lives here. Other modules read state; only designated
 * mutation functions should write to it.
 */

import { STORAGE_KEYS, BASE_GROUPS_PER_WEEK, WEEKS } from './config.js';
import { TASKS } from './content/tasks.js';

/**
 * @typedef {Object} Assignment
 * @property {string} task_id - ID of the assigned task
 * @property {number} week - Week number (1-12)
 * @property {boolean} in_window - Whether this was in the optimal window
 * @property {boolean} blocked_by_rain - Whether task was blocked by rain (invalid assign)
 */

/**
 * @typedef {Object} WeatherState
 * @property {string} preset_id - ID of the weather preset
 * @property {string} preset_name - Display name
 * @property {string} preset_emoji - Emoji
 * @property {number[]} rain_weeks - Week numbers with rain
 * @property {number|null} frost_week - Week when frost arrives (or null)
 * @property {number[]} hot_weeks - Week numbers with hot weather
 * @property {number[]} forecast_revealed - Which weeks the player knows about
 */

/**
 * @typedef {Object} GameState
 * @property {string} phase - 'ftue' | 'planning' | 'bura' | 'score' | 'prestige'
 * @property {number} run_number - Total number of completed runs (for prestige tracking)
 * @property {Assignment[]} assignments - Current season task assignments
 * @property {WeatherState} weather - Current weather state
 * @property {number} groups_per_week - Group points available per week
 * @property {string|null} prestige_bonus - Active prestige bonus ID
 * @property {string|null} selected_task_id - Currently selected task card
 * @property {number|null} last_score - Score from last completed run
 * @property {string|null} last_rank - Rank from last completed run
 * @property {boolean} bura_complete - Whether zimska bura animation has finished
 * @property {number} bura_week - Which week the bura is currently revealing
 * @property {Record<string, boolean>} achievements - Unlocked achievements
 * @property {Object} score_breakdown - Score breakdown per task
 */

/**
 * Create a fresh game state
 * @returns {GameState}
 */
export function createState() {
  return {
    phase: 'planning',
    run_number: 0,
    assignments: [],          // [{task_id, week}]
    weather: null,            // populated by weather system at game init
    groups_per_week: BASE_GROUPS_PER_WEEK,
    prestige_bonus: null,
    selected_task_id: null,
    last_score: null,
    last_rank: null,
    bura_complete: false,
    bura_week: 0,
    achievements: {},
    score_breakdown: {},
    // Transient UI state (not persisted)
    tooltip_target: null,
    tooltip_text: null,
    error_cell: null,
    error_task: null,
  };
}

/**
 * Load game state from localStorage
 * Returns null if no saved state exists or parsing fails
 * @returns {GameState|null}
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.state);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Merge with defaults to handle schema changes
    return { ...createState(), ...parsed };
  } catch (e) {
    console.warn('JT: failed to load state', e);
    return null;
  }
}

/**
 * Save game state to localStorage
 * @param {GameState} state
 */
export function saveState(state) {
  try {
    // Don't persist transient UI state
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
 * Clear saved state from localStorage
 */
export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEYS.state);
  } catch (e) {
    console.warn('JT: failed to clear state', e);
  }
}

/**
 * Load prestige bonus from localStorage
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
 * Save prestige bonus to localStorage
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

/**
 * Load best score
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
 * Save best score if it's a new high
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
 * Increment and save total runs counter
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
 * Load total runs
 * @returns {number}
 */
export function loadTotalRuns() {
  try {
    return parseInt(localStorage.getItem(STORAGE_KEYS.total_runs) || '0', 10);
  } catch (e) {
    return 0;
  }
}

/**
 * Assign a task to a week (mutates state.assignments)
 * Does NOT validate — call validation.js first
 * @param {GameState} state
 * @param {string} taskId
 * @param {number} week
 */
export function assignTask(state, taskId, week) {
  // Remove any existing assignment for this task
  state.assignments = state.assignments.filter((a) => a.task_id !== taskId);
  state.assignments.push({ task_id: taskId, week });
}

/**
 * Unassign a task from any week
 * @param {GameState} state
 * @param {string} taskId
 */
export function unassignTask(state, taskId) {
  state.assignments = state.assignments.filter((a) => a.task_id !== taskId);
}

/**
 * Get the assignment for a task, or null
 * @param {GameState} state
 * @param {string} taskId
 * @returns {Assignment|null}
 */
export function getAssignment(state, taskId) {
  return state.assignments.find((a) => a.task_id === taskId) ?? null;
}

/**
 * Get all assignments for a week
 * @param {GameState} state
 * @param {number} week
 * @returns {Assignment[]}
 */
export function getWeekAssignments(state, week) {
  return state.assignments.filter((a) => a.week === week);
}

/**
 * Calculate how many group points are used in a week
 * Accounts for prestige bonus that reduces micelij cost
 * @param {GameState} state
 * @param {number} week
 * @returns {number}
 */
export function getWeekGroupUsage(state, week) {
  const { TASKS: tasks } = { TASKS };
  const weekAssigns = getWeekAssignments(state, week);
  let total = 0;
  for (const a of weekAssigns) {
    const task = TASKS.find((t) => t.id === a.task_id);
    if (!task) continue;
    let cost = task.group_cost;
    // Prestige: cheap_micelij reduces micelij cost to 1
    if (state.prestige_bonus === 'cheap_micelij' && a.task_id === 'micelij') {
      cost = 1;
    }
    total += cost;
  }
  return total;
}

/**
 * Check if a task has been assigned
 * @param {GameState} state
 * @param {string} taskId
 * @returns {boolean}
 */
export function isTaskAssigned(state, taskId) {
  return state.assignments.some((a) => a.task_id === taskId);
}

/**
 * Check if all tasks are assigned
 * @param {GameState} state
 * @returns {boolean}
 */
export function allTasksAssigned(state) {
  return TASKS.every((t) => isTaskAssigned(state, t.id));
}

/**
 * Reset state for a new run (keeps prestige bonus and run_number)
 * @param {GameState} state
 * @param {string|null} newPrestigeBonus
 */
export function resetForNewRun(state, newPrestigeBonus) {
  const runNumber = state.run_number + 1;
  const achievements = { ...state.achievements };
  Object.assign(state, createState());
  state.run_number = runNumber;
  state.prestige_bonus = newPrestigeBonus;
  state.achievements = achievements;
  if (newPrestigeBonus === 'extra_group') {
    state.groups_per_week = 4;
  }
}
