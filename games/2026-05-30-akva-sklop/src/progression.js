/**
 * progression.js - Akva-Sklop
 * Week and phase management: AP allocation, timer, win/lose checks.
 */

import {
  AP_EARLY,
  AP_MID,
  AP_LATE,
  PHASE_EARLY_END,
  PHASE_MID_END,
  TOTAL_WEEKS,
  PLAN_TIMER_SEC,
  DIFFICULTY,
} from './config.js';

import { calcFinalScore } from './scoring.js';

// ---------------------------------------------------------------------------
// AP per week
// ---------------------------------------------------------------------------

/**
 * Returns the number of action points for a given week.
 * @param {number} week  1-12
 * @returns {number}
 */
export function getAPForWeek(week) {
  if (week <= PHASE_EARLY_END) return AP_EARLY;
  if (week <= PHASE_MID_END)   return AP_MID;
  return AP_LATE;
}

// ---------------------------------------------------------------------------
// Phase transitions
// ---------------------------------------------------------------------------

/**
 * Transition state into the planning phase for the current week.
 * @param {object} state  mutable game state
 * @returns {object}
 */
export function startPlanningPhase(state) {
  state.phase   = 'planning';
  state.ap      = getAPForWeek(state.week);
  state.apTimer = PLAN_TIMER_SEC;
  return state;
}

/**
 * Transition state into the simulation phase.
 * @param {object} state
 * @returns {object}
 */
export function startSimulationPhase(state) {
  state.phase = 'simulating';
  return state;
}

// ---------------------------------------------------------------------------
// Week advancement + win/lose
// ---------------------------------------------------------------------------

/**
 * Check whether the player won or lost.
 * Sets state.phase to 'victory' or 'gameover'.
 * @param {object} state
 * @param {object} difficultyObj  DIFFICULTY[id]
 * @returns {'victory'|'gameover'}
 */
export function checkVictoryCondition(state, difficultyObj) {
  const result = calcFinalScore(state.weeklyScores, difficultyObj);
  if (result.score >= (difficultyObj.winThreshold || 80)) {
    return 'victory';
  }
  return 'gameover';
}

/**
 * Advance to the next week or end the game.
 * Mutates state.week and state.phase.
 * @param {object} state
 * @returns {object}
 */
export function advanceWeek(state) {
  state.week++;

  if (state.week > TOTAL_WEEKS) {
    const diff = DIFFICULTY[state.difficulty] || DIFFICULTY['fazaA'];
    state.phase = checkVictoryCondition(state, diff);
    return state;
  }

  // If game-over was already triggered (e.g. fish died), don't overwrite
  if (state.phase === 'gameover') {
    return state;
  }

  startPlanningPhase(state);
  return state;
}

// ---------------------------------------------------------------------------
// Timer
// ---------------------------------------------------------------------------

/**
 * Decrement the planning timer.
 * @param {object} state
 * @param {number} deltaSeconds
 * @returns {boolean} true if timer expired
 */
export function tickPlanningTimer(state, deltaSeconds) {
  if (state.phase !== 'planning') return false;
  state.apTimer -= deltaSeconds;
  if (state.apTimer <= 0) {
    state.apTimer = 0;
    return true;
  }
  return false;
}
