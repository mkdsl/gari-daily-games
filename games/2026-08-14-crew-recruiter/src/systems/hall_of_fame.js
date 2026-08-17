// systems/hall_of_fame.js — Hall of Fame read helpers

/**
 * Return the HOF entries from state.
 * @param {import('../state.js').GameState} state
 * @returns {number[]}
 */
export function getHallOfFame(state) {
  return state.hallOfFame ?? [];
}

/**
 * HOF is shown only after 3 or more completed runs.
 * @param {import('../state.js').GameState} state
 * @returns {boolean}
 */
export function isHOFUnlocked(state) {
  return (state.completedRuns ?? 0) >= 3;
}

/**
 * Add a score to HOF (newest first, keep 3).
 * Mutates state.hallOfFame.
 * @param {import('../state.js').GameState} state
 * @param {number} score
 */
export function addToHOF(state, score) {
  state.hallOfFame = [score, ...(state.hallOfFame ?? [])].slice(0, 3);
}
