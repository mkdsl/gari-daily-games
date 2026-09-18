/** @module state — game state shape, save/load localStorage */

import { SAVE_KEY, STARTING_BUDGET, STARTING_CREW_MOOD, STARTING_REPUTATION, STARTING_REACH } from './config.js';
import { createPrestigeState } from './systems/prestige.js';
import { createFanDB } from './entities/fan.js';

/**
 * @typedef {Object} ResourceState
 * @property {number} budget
 * @property {number} crew_mood
 * @property {number} reputation
 * @property {number} reach
 */

/**
 * @typedef {Object} CityResult
 * @property {string} city_id
 * @property {number} attendance
 * @property {number} crowd_quality
 * @property {number} rep_gain
 * @property {number} budget_delta
 * @property {string[]} card_outcomes_labels
 */

/**
 * @typedef {Object} GameState
 * @property {'menu'|'routing'|'crew_select'|'city_budget'|'cards'|'results'|'transit'|'ending'|'prestige'} screen
 * @property {ResourceState} resources
 * @property {string[]} route - ordered city IDs
 * @property {number} city_index - current city (0-based)
 * @property {string[]} selected_crew_ids
 * @property {Object} budget_split - { transport, promo, tech }
 * @property {string[]} drawn_card_ids - cards drawn this city
 * @property {Array} card_outcomes - resolved card effects this city
 * @property {number} current_card_index - which card we're on (0-3)
 * @property {CityResult[]} city_results - completed cities history
 * @property {import('./systems/prestige.js').PrestigeState} prestige
 * @property {string|null} ending_id
 * @property {number} next_city_mood_penalty - from CR06 etc
 * @property {boolean} game_over
 * @property {Object|null} border_incident - Sarajevo incident if happened
 * @property {import('./entities/event.js').EventState|null} event_state
 */

/**
 * @returns {GameState}
 */
export function createInitialState() {
  return {
    screen: 'menu',
    resources: {
      budget: STARTING_BUDGET,
      crew_mood: STARTING_CREW_MOOD,
      reputation: STARTING_REPUTATION,
      reach: STARTING_REACH,
    },
    route: [],
    city_index: 0,
    selected_crew_ids: [],
    budget_split: { transport: 0, promo: 0, tech: 0 },
    drawn_card_ids: [],
    card_outcomes: [],
    current_card_index: 0,
    city_results: [],
    prestige: createPrestigeState(),
    ending_id: null,
    next_city_mood_penalty: 0,
    game_over: false,
    border_incident: null,
    event_state: null,
  };
}

/**
 * Save game state to localStorage
 * @param {GameState} state
 */
export function saveState(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Save failed:', e);
  }
}

/**
 * Load game state from localStorage
 * @returns {GameState|null}
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Basic validation
    if (!parsed.resources || !parsed.route) return null;
    return parsed;
  } catch (e) {
    console.warn('Load failed:', e);
    return null;
  }
}

/**
 * Clear saved state
 */
export function clearState() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {
    // ignore
  }
}

/**
 * Apply resource delta to state
 * @param {GameState} state
 * @param {Partial<ResourceState>} delta
 * @returns {GameState}
 */
export function applyResourceDelta(state, delta) {
  return {
    ...state,
    resources: {
      budget: (state.resources.budget + (delta.budget || 0)),
      crew_mood: Math.max(0, Math.min(10, state.resources.crew_mood + (delta.crew_mood || 0))),
      reputation: Math.max(0, Math.min(10, state.resources.reputation + (delta.reputation || 0))),
      reach: Math.max(0, Math.min(50, state.resources.reach + (delta.reach || 0))),
    },
  };
}

/**
 * Check lose condition (budget < 0)
 * @param {GameState} state
 * @returns {boolean}
 */
export function isGameOver(state) {
  return state.resources.budget < -500; // give a little breathing room
}

/**
 * Reset to a prestige-ready state (keep prestige, clear run data)
 * @param {GameState} state
 * @param {ResourceState} new_resources
 * @returns {GameState}
 */
export function resetForPrestige(state, new_resources) {
  return {
    ...createInitialState(),
    resources: new_resources,
    prestige: state.prestige,
    screen: 'routing',
  };
}
