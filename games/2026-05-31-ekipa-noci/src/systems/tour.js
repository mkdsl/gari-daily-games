/**
 * @file tour.js
 * Tour Score computation:
 *   weighted_sum = Σ(event_scores[i] * TOUR_WEIGHTS[event_number])
 *   loyalty_bonus = LOYALTY_BONUS_PER_MEMBER * count(members who survived 3+ events)
 *   consistency_bonus:
 *     +10 if all events >= 31
 *     +5  if first 4 events all >= 61
 *   tour_score = Math.round(weighted_sum + loyalty_bonus + consistency_bonus)
 */

import {
  TOUR_WEIGHTS,
  LOYALTY_BONUS_PER_MEMBER,
  CONSISTENCY_BONUS_ALL_31,
  CONSISTENCY_BONUS_4_SOLID,
  LOYALTY_THRESHOLD,
  getBracket,
} from '../config.js';
import { getState, finalizeRun } from '../state.js';

/**
 * @typedef {import('../state.js').GameState} GameState
 */

/**
 * @typedef {Object} TourScoreBreakdown
 * @property {number}   weighted_sum
 * @property {number}   loyalty_bonus
 * @property {number}   consistency_bonus
 * @property {number}   tour_score
 * @property {number}   loyal_member_count
 * @property {boolean}  all_events_31_plus
 * @property {boolean}  first4_events_61_plus
 * @property {string[]} event_labels          e.g. ['Zvezda', 'Solid', ...]
 * @property {number[]} event_scores
 * @property {string}   grade                 'S' | 'A' | 'B' | 'C' | 'F'
 */

// ---------------------------------------------------------------------------
// Grade determination
// ---------------------------------------------------------------------------

/**
 * Convert a tour_score into a letter grade.
 * @param {number} tourScore
 * @returns {'S'|'A'|'B'|'C'|'F'}
 */
export function tourGrade(tourScore) {
  if (tourScore >= 420) return 'S';
  if (tourScore >= 340) return 'A';
  if (tourScore >= 260) return 'B';
  if (tourScore >= 180) return 'C';
  return 'F';
}

// ---------------------------------------------------------------------------
// Weighted sum
// ---------------------------------------------------------------------------

/**
 * Compute the weighted sum of event scores.
 * @param {number[]} eventScores  Array of 5 event scores
 * @returns {number}
 */
export function calcWeightedSum(eventScores) {
  return eventScores.reduce((sum, score, idx) => {
    const eventNumber = idx + 1; // 1-indexed
    const weight = TOUR_WEIGHTS[eventNumber] ?? 1.0;
    return sum + score * weight;
  }, 0);
}

// ---------------------------------------------------------------------------
// Loyalty bonus
// ---------------------------------------------------------------------------

/**
 * Count how many crew members survived 3+ events.
 * @param {GameState} state
 * @returns {number}
 */
export function countLoyalMembers(state) {
  return Object.entries(state.crew.loyalty_counts)
    .filter(([_id, count]) => count >= LOYALTY_THRESHOLD)
    .length;
}

/**
 * Compute the loyalty bonus.
 * @param {GameState} state
 * @returns {number}
 */
export function calcLoyaltyBonus(state) {
  return countLoyalMembers(state) * LOYALTY_BONUS_PER_MEMBER;
}

// ---------------------------------------------------------------------------
// Consistency bonus
// ---------------------------------------------------------------------------

/**
 * Compute the consistency bonus from event scores.
 * @param {number[]} eventScores
 * @returns {{ bonus: number, all_events_31_plus: boolean, first4_events_61_plus: boolean }}
 */
export function calcConsistencyBonus(eventScores) {
  const all_events_31_plus = eventScores.every(s => s >= 31);
  const first4_events_61_plus = eventScores.length >= 4 &&
    eventScores.slice(0, 4).every(s => s >= 61);

  let bonus = 0;
  if (all_events_31_plus) bonus += CONSISTENCY_BONUS_ALL_31;
  if (first4_events_61_plus) bonus += CONSISTENCY_BONUS_4_SOLID;

  return { bonus, all_events_31_plus, first4_events_61_plus };
}

// ---------------------------------------------------------------------------
// Main tour score function
// ---------------------------------------------------------------------------

/**
 * Compute the complete Tour Score from current state.
 * Should be called after all 5 events have been resolved.
 *
 * @param {GameState} [state]  Defaults to getState()
 * @returns {TourScoreBreakdown}
 */
export function calcTourScore(state) {
  const s = state ?? getState();
  const eventScores = s.event_scores;

  if (eventScores.length === 0) {
    return {
      weighted_sum: 0,
      loyalty_bonus: 0,
      consistency_bonus: 0,
      tour_score: 0,
      loyal_member_count: 0,
      all_events_31_plus: false,
      first4_events_61_plus: false,
      event_labels: [],
      event_scores: [],
      grade: 'F',
    };
  }

  const weighted_sum = calcWeightedSum(eventScores);
  const loyalty_bonus = calcLoyaltyBonus(s);
  const { bonus: consistency_bonus, all_events_31_plus, first4_events_61_plus } =
    calcConsistencyBonus(eventScores);

  const tour_score = Math.round(weighted_sum + loyalty_bonus + consistency_bonus);
  const loyal_member_count = countLoyalMembers(s);
  const event_labels = eventScores.map(score => getBracket(score).label);
  const grade = tourGrade(tour_score);

  return {
    weighted_sum,
    loyalty_bonus,
    consistency_bonus,
    tour_score,
    loyal_member_count,
    all_events_31_plus,
    first4_events_61_plus,
    event_labels,
    event_scores: [...eventScores],
    grade,
  };
}

/**
 * Finalize the tour: compute score, update meta, trigger state cleanup.
 * Called by main.js when entering 'tour_end' phase.
 *
 * @returns {TourScoreBreakdown}
 */
export function finalizeTour() {
  const breakdown = calcTourScore();
  finalizeRun(breakdown.tour_score);
  return breakdown;
}

/**
 * Compute a partial tour score mid-run (first N events completed).
 * Useful for a running leaderboard or UI estimate.
 *
 * @param {GameState} [state]
 * @returns {TourScoreBreakdown}
 */
export function calcPartialTourScore(state) {
  return calcTourScore(state ?? getState());
}

/**
 * Return the best tour score from meta.
 * @returns {number}
 */
export function getBestTourScore() {
  return getState().best_tour_score ?? 0;
}
