/** @module entities/event — evening event state, card outcomes tracker */

/**
 * @typedef {Object} CardOutcome
 * @property {string} card_id
 * @property {string} chosen_option - 'A'|'B'|'C'
 * @property {Object} resolved_effects - final effects after random resolution
 */

/**
 * @typedef {Object} EventState
 * @property {string} city_id
 * @property {string[]} drawn_card_ids - IDs of 4 drawn cards
 * @property {CardOutcome[]} outcomes - resolved outcomes so far
 * @property {number} crowd_attendance - rolled value
 * @property {number} crowd_quality - 0-10, accumulated during event
 * @property {boolean} complete
 */

/**
 * Create a fresh event state for a city
 * @param {string} city_id
 * @param {string[]} drawn_card_ids
 * @param {number} crowd_attendance
 * @returns {EventState}
 */
export function createEventState(city_id, drawn_card_ids, crowd_attendance) {
  return {
    city_id,
    drawn_card_ids: [...drawn_card_ids],
    outcomes: [],
    crowd_attendance,
    crowd_quality: 5.0,
    complete: false,
  };
}

/**
 * @param {EventState} event
 * @param {CardOutcome} outcome
 * @returns {EventState}
 */
export function addOutcome(event, outcome) {
  return {
    ...event,
    outcomes: [...event.outcomes, outcome],
  };
}

/**
 * @param {EventState} event
 * @returns {boolean}
 */
export function allCardsResolved(event) {
  return event.outcomes.length >= event.drawn_card_ids.length;
}
