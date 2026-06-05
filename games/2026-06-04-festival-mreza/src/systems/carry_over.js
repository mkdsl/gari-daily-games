/** @module systems/carry_over — buzz carry-over, reputation calculation */

import { CONFIG } from '../config.js';
import { getVenueCapacity } from '../content/cities_data.js';

/**
 * Calculate carry-over buzz from previous city satisfaction
 * @param {number} prevSatisfaction 0-100
 * @param {object} upgradeEffects
 * @param {boolean} hasBranaKoren guncati_koren ability active
 * @returns {number} carry-over buzz capped at BUZZ_CARRYOVER_CAP
 */
export function calculateCarryOverBuzz(prevSatisfaction, upgradeEffects = {}, hasBranaKoren = false) {
  const factor = CONFIG.BUZZ_CARRYOVER_FACTOR + (upgradeEffects.carryover_factor_bonus || 0);
  const branaBonus = hasBranaKoren ? 10 : 0;
  const raw = prevSatisfaction * factor + branaBonus;
  return Math.min(CONFIG.BUZZ_CARRYOVER_CAP, raw);
}

/**
 * Calculate starting satisfaction bonus from buzz
 * @param {number} buzzLevel 0-70
 * @param {object} upgradeEffects
 * @param {string[]} veteranInsights
 * @returns {number} bonus 0-21+
 */
export function getBuzzSatisfactionBonus(buzzLevel, upgradeEffects = {}, veteranInsights = []) {
  const bonusFactor = veteranInsights.includes('vi_satisfaction_memory')
    ? 0.35
    : CONFIG.SATISFACTION_BONUS_FROM_BUZZ;
  return buzzLevel * bonusFactor;
}

/**
 * Calculate reputation gain/loss after event
 * @param {number} satisfaction 0-100
 * @returns {number} reputation delta (can be negative)
 */
export function calculateReputationDelta(satisfaction) {
  if (satisfaction > 50) {
    return Math.min(10, (satisfaction - 50) * 0.4);
  } else {
    return -Math.min(15, (50 - satisfaction) * 0.3);
  }
}

/**
 * Apply carry-over effects to next city's micro state
 * Creates carry-over crowd groups and returns starting bonus
 * @param {number} buzzLevel
 * @param {number} venueCapacity
 * @param {import('../state.js').MicroState} micro
 * @returns {number} count of carry-over guests
 */
export function injectCarryOverGuests(buzzLevel, venueCapacity, micro) {
  if (buzzLevel <= 0) {
    micro.guest_from_prev_city = null;
    return 0;
  }
  // Carry-over guests = buzz% of wave1 size
  const guestCount = Math.floor(venueCapacity * 0.05 * (buzzLevel / CONFIG.BUZZ_CARRYOVER_CAP));
  if (guestCount <= 0) return 0;

  micro.guest_from_prev_city = {
    size: guestCount,
    mood: 'warm',   // carry-over guests arrive warm
    isCarryOver: true,
  };
  return guestCount;
}

/**
 * Update reputation for a city after event
 * @param {import('../state.js').MacroState} macro
 * @param {string} cityId
 * @param {number} satisfaction
 */
export function applyReputationAfterEvent(macro, cityId, satisfaction) {
  const delta = calculateReputationDelta(satisfaction);
  macro.reputation[cityId] = Math.max(0, Math.min(100,
    (macro.reputation[cityId] || 0) + delta
  ));
}

/**
 * Calculate Avala special reputation from all previous results
 * @param {import('../state.js').MacroState} macro
 * @returns {number} avala reputation bonus (0-100)
 */
export function calculateAvalaReputation(macro) {
  const prevResults = macro.event_results.filter(r => r.cityId !== 'avala');
  if (prevResults.length === 0) return 0;
  const sum = prevResults.reduce((s, r) => s + r.satisfactionScore * 0.2, 0);
  return Math.min(100, sum);
}
