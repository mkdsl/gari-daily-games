/**
 * @file crew.js
 * Crew retention logic:
 *  - Who stays after an event (retention check)
 *  - Who departs permanently (burnout + score threshold OR conflict count)
 *  - Loyalty tracking and burnout check
 *  - Returns a structured CrewUpdateResult for use by progression.js and UI
 */

import {
  RETENTION_SCORE_FLOOR,
  DEPARTURE_CONFLICT_THRESHOLD,
  LOYALTY_THRESHOLD,
} from '../config.js';
import {
  getState,
  updateCrew,
  incrementLoyalty,
  recordBurnout,
  departCard,
  retainCard,
} from '../state.js';

/**
 * @typedef {import('../entities/card.js').Card} Card
 * @typedef {import('../state.js').GameState} GameState
 * @typedef {import('../systems/synergy.js').SynergyReport} SynergyReport
 */

/**
 * @typedef {Object} RetentionResult
 * @property {string}   card_id
 * @property {string}   card_name
 * @property {string}   role
 * @property {'retained'|'departed'|'burnout_departed'|'conflict_departed'} status
 * @property {string}   reason
 * @property {boolean}  is_loyal    True if loyalty_count >= LOYALTY_THRESHOLD
 */

/**
 * @typedef {Object} CrewUpdateResult
 * @property {RetentionResult[]} results         Per-card retention outcomes
 * @property {string[]}          retained_ids    Card IDs that stay
 * @property {string[]}          departed_ids    Card IDs leaving this event
 * @property {number}            loyal_count     How many cards now have loyal status
 * @property {string[]}          flavor_lines    Human-readable outcome lines
 */

// ---------------------------------------------------------------------------
// Retention decision per card
// ---------------------------------------------------------------------------

/**
 * Determine whether a single card is retained after an event.
 *
 * Rules:
 *   DEPART if: has 'burnout' tag AND event_score < RETENTION_SCORE_FLOOR
 *   DEPART if: appears in 2+ conflict entries in the synergy report
 *   RETAIN otherwise
 *
 * @param {Card}         card
 * @param {number}       eventScore
 * @param {SynergyReport} synergyReport
 * @returns {{ retained: boolean, reason: string, departure_type: string|null }}
 */
function checkRetention(card, eventScore, synergyReport) {
  const hasBurnout = card.tags.includes('burnout');

  // Count how many active conflict effects involve this card's tags
  // A conflict effect is considered related if the card's tags appear in the synergy condition
  const conflictEntries = (synergyReport?.active_effects ?? []).filter(e => e.score_delta < 0);
  const conflictCount = conflictEntries.filter(effect => {
    // Check if any of this card's tags / traits appear in the effect description
    return card.tags.some(tag => effect.description.toLowerCase().includes(tag.toLowerCase())) ||
           card.traits.some(trait => effect.description.toLowerCase().includes(trait.toLowerCase()));
  }).length;

  // Rule 1: burnout + bad event
  if (hasBurnout && eventScore < RETENTION_SCORE_FLOOR) {
    return {
      retained: false,
      reason: `${card.name} sagorela — event score ${eventScore} < ${RETENTION_SCORE_FLOOR} + burnout tag`,
      departure_type: 'burnout_departed',
    };
  }

  // Rule 2: too many conflicts
  if (conflictCount >= DEPARTURE_CONFLICT_THRESHOLD) {
    return {
      retained: false,
      reason: `${card.name} otišla zbog ${conflictCount} conflict entries`,
      departure_type: 'conflict_departed',
    };
  }

  return { retained: true, reason: `${card.name} ostaje`, departure_type: null };
}

// ---------------------------------------------------------------------------
// Main crew update
// ---------------------------------------------------------------------------

/**
 * Process crew retention for all 5 selected cards after an event resolves.
 * Mutates state (loyalty, burnout, departed, retained).
 *
 * @param {{ [role: string]: Card }} selected   draft.selected from state
 * @param {number}                  eventScore
 * @param {SynergyReport}           synergyReport
 * @returns {CrewUpdateResult}
 */
export function processCrewUpdate(selected, eventScore, synergyReport) {
  const state = getState();
  const results = [];
  const retained_ids = [];
  const departed_ids = [];

  const selectedCards = Object.values(selected).filter(Boolean);

  for (const card of selectedCards) {
    const { retained, reason, departure_type } = checkRetention(card, eventScore, synergyReport);

    const current_loyalty = state.crew.loyalty_counts[card.id] ?? 0;
    const is_loyal_after = retained ? (current_loyalty + 1) >= LOYALTY_THRESHOLD : current_loyalty >= LOYALTY_THRESHOLD;

    if (retained) {
      // Increment loyalty count
      incrementLoyalty(card.id);
      retainCard(card.id);
      retained_ids.push(card.id);

      results.push({
        card_id: card.id,
        card_name: card.name,
        role: card.role,
        status: 'retained',
        reason,
        is_loyal: is_loyal_after,
      });
    } else {
      // Record burnout if applicable
      if (card.tags.includes('burnout')) {
        recordBurnout(card.id);
      }
      departCard(card.id);
      departed_ids.push(card.id);

      results.push({
        card_id: card.id,
        card_name: card.name,
        role: card.role,
        status: departure_type ?? 'departed',
        reason,
        is_loyal: false,
      });
    }
  }

  // Count loyal members in current retained pool after update
  const updatedState = getState();
  const loyal_count = Object.entries(updatedState.crew.loyalty_counts)
    .filter(([id, count]) => count >= LOYALTY_THRESHOLD && updatedState.crew.retained.includes(id))
    .length;

  const flavor_lines = results.map(r => r.reason);

  return {
    results,
    retained_ids,
    departed_ids,
    loyal_count,
    flavor_lines,
  };
}

// ---------------------------------------------------------------------------
// Burnout check utility
// ---------------------------------------------------------------------------

/**
 * Check if any card in a team has the burnout tag.
 * @param {Card[]} team
 * @returns {Card[]}
 */
export function getBurnoutCards(team) {
  return team.filter(c => c.tags.includes('burnout'));
}

/**
 * Check if a burnout card would survive at the given score.
 * @param {Card}   card
 * @param {number} eventScore
 * @returns {boolean}
 */
export function wouldBurnoutCardSurvive(card, eventScore) {
  return eventScore >= RETENTION_SCORE_FLOOR;
}

/**
 * Get a card's current loyalty count from state.
 * @param {string} cardId
 * @returns {number}
 */
export function getLoyaltyCount(cardId) {
  return getState().crew.loyalty_counts[cardId] ?? 0;
}

/**
 * Return true if a card has achieved loyal status.
 * @param {string} cardId
 * @returns {boolean}
 */
export function isLoyal(cardId) {
  return getLoyaltyCount(cardId) >= LOYALTY_THRESHOLD;
}

/**
 * Return all retained card IDs that have loyal status.
 * @returns {string[]}
 */
export function getLoyalCardIds() {
  const state = getState();
  return state.crew.retained.filter(id => isLoyal(id));
}

/**
 * Return a risk assessment for a card: probability-like flag for UI.
 * @param {Card}   card
 * @param {number} projectedScore  Expected event score
 * @returns {'safe'|'at_risk'|'will_depart'}
 */
export function assessRetentionRisk(card, projectedScore) {
  if (!card.tags.includes('burnout')) return 'safe';
  if (projectedScore >= RETENTION_SCORE_FLOOR) return 'at_risk';
  return 'will_depart';
}
