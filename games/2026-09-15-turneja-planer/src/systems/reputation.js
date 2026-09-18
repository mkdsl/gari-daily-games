/** @module systems/reputation — reputation formula, gain/decay */

/**
 * Calculate reputation gain for a city event
 * @param {number} cq - crowd quality 0-10
 * @param {number} crew_mood - 0-10
 * @param {number} city_mult - from City.rep_mult
 * @param {number} [card_bonuses=0] - sum of reputation effects from cards
 * @returns {number} clamped rep gain (-2 to +2)
 */
export function calcRepGain(cq, crew_mood, city_mult, card_bonuses = 0) {
  const base = cq * 0.4;
  let mood_mod = 0;
  if (crew_mood >= 7) mood_mod = 0.3;
  else if (crew_mood >= 4) mood_mod = 0.0;
  else mood_mod = -0.2;

  const raw = (base + mood_mod) * city_mult + card_bonuses;
  return Math.max(-2, Math.min(2, raw));
}

/**
 * Apply reputation gain to current value
 * @param {number} current
 * @param {number} gain
 * @returns {number} clamped to [0, 10]
 */
export function applyRepGain(current, gain) {
  return Math.max(0, Math.min(10, current + gain));
}

/**
 * Check if reputation meets Guncati gate
 * @param {number} rep
 * @param {number} gate - default 6.0
 * @returns {boolean}
 */
export function meetsGuncatiGate(rep, gate = 6.0) {
  return rep >= gate;
}

/**
 * Format reputation for display
 * @param {number} rep
 * @returns {string}
 */
export function formatRep(rep) {
  return rep.toFixed(1);
}
