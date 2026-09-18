/** @module systems/reach — reach accumulator, promo calculation */

import { MAX_REACH, PROMO_MULT_CAP } from '../config.js';
import { promoMult, promoReachGain } from './budget.js';

/**
 * Accumulate reach gain, clamped to MAX_REACH
 * @param {number} current
 * @param {number} delta
 * @returns {number}
 */
export function addReach(current, delta) {
  return Math.max(0, Math.min(MAX_REACH, current + delta));
}

/**
 * Calculate reach gain from crew social skills
 * @param {import('../entities/crew_member.js').CrewMember[]} crew
 * @returns {number}
 */
export function crewReachGain(crew) {
  return crew.reduce((sum, m) => sum + (m.skills.social || 0) * 1.5, 0);
}

/**
 * Calculate reach gain from crew visual skills
 * @param {import('../entities/crew_member.js').CrewMember[]} crew
 * @returns {number}
 */
export function crewVisualReach(crew) {
  return crew.reduce((sum, m) => sum + (m.skills.visual || 0) * 0.5, 0);
}

/**
 * Total reach gain for a city event from all sources
 * @param {number} promo_alloc
 * @param {import('../entities/crew_member.js').CrewMember[]} crew
 * @param {number} card_reach_bonus
 * @param {number} fan_promo_bonus
 * @returns {number}
 */
export function totalCityReachGain(promo_alloc, crew, card_reach_bonus, fan_promo_bonus = 0) {
  const promo_reach = promoReachGain(promo_alloc) * promoMult(promo_alloc, fan_promo_bonus);
  const crew_reach = crewReachGain(crew) + crewVisualReach(crew);
  return promo_reach + crew_reach + card_reach_bonus;
}

/**
 * Format reach for display
 * @param {number} reach
 * @returns {string}
 */
export function formatReach(reach) {
  return `${reach.toFixed(1)}k`;
}

/**
 * Reach tier label
 * @param {number} reach
 * @returns {string}
 */
export function reachTier(reach) {
  if (reach >= 40) return 'Viralan 🌍';
  if (reach >= 25) return 'Regionalan 🌐';
  if (reach >= 15) return 'Poznat 📻';
  if (reach >= 5) return 'Lokalan 📍';
  return 'Nepoznat 🌱';
}
