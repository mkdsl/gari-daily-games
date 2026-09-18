/** @module systems/progression — city ordering, difficulty scaling, evening flow phases */

import { GUNCATI_REP_GATE } from '../config.js';
import { CITY_MAP, getFinalCity } from '../entities/city.js';
import { meetsGuncatiGate } from './reputation.js';

/**
 * @typedef {'setup'|'routing'|'crew_select'|'city_budget'|'cards'|'results'|'transit'|'ending'} GamePhase
 */

/**
 * @typedef {Object} ProgressionState
 * @property {string[]} route - ordered city IDs including guncati at end
 * @property {number} current_city_index - 0-based
 * @property {GamePhase} phase
 * @property {number} city_day - 1-based
 */

/**
 * Create initial progression state from selected route
 * @param {string[]} route - city IDs in order (guncati last)
 * @returns {ProgressionState}
 */
export function createProgression(route) {
  return {
    route,
    current_city_index: 0,
    phase: 'city_budget',
    city_day: 1,
  };
}

/**
 * @param {ProgressionState} prog
 * @returns {string} current city ID
 */
export function currentCityId(prog) {
  return prog.route[prog.current_city_index];
}

/**
 * @param {ProgressionState} prog
 * @returns {boolean}
 */
export function isLastCity(prog) {
  return prog.current_city_index >= prog.route.length - 1;
}

/**
 * @param {ProgressionState} prog
 * @returns {boolean}
 */
export function isFinalCity(prog) {
  const city = CITY_MAP.get(currentCityId(prog));
  return city?.is_final === true;
}

/**
 * Advance to next city
 * @param {ProgressionState} prog
 * @returns {ProgressionState}
 */
export function advanceCity(prog) {
  return {
    ...prog,
    current_city_index: prog.current_city_index + 1,
    phase: 'city_budget',
    city_day: prog.city_day + 1,
  };
}

/**
 * Advance phase within a city
 * @param {ProgressionState} prog
 * @param {GamePhase} next_phase
 * @returns {ProgressionState}
 */
export function setPhase(prog, next_phase) {
  return { ...prog, phase: next_phase };
}

/**
 * Check if Guncati is reachable
 * @param {number} reputation
 * @returns {{ ok: boolean, message: string }}
 */
export function checkGuncatiGate(reputation) {
  const ok = meetsGuncatiGate(reputation, GUNCATI_REP_GATE);
  return {
    ok,
    message: ok
      ? `Guncati otvoren! Rep: ${reputation.toFixed(1)} ✓`
      : `Guncati zatvoren — treba ${GUNCATI_REP_GATE.toFixed(1)} reputacije. Imaš ${reputation.toFixed(1)}.`,
  };
}

/**
 * Difficulty scaling — harder cards at later cities
 * @param {number} city_index
 * @returns {number} 0-1 difficulty
 */
export function cityDifficulty(city_index) {
  return Math.min(city_index / 4, 1.0);
}

/**
 * Days remaining
 * @param {ProgressionState} prog
 * @returns {number}
 */
export function daysRemaining(prog) {
  return prog.route.length - prog.current_city_index;
}
