/** @module systems/random_events — border incident rolls, viral moments */

import {
  BORDER_INCIDENT_PROB,
  BORDER_INCIDENTS,
  BORDER_EXTRA_COST,
  BORDER_EXTRA_MOOD,
} from '../config.js';

/**
 * Roll for border incident at Sarajevo
 * @returns {{ incident: Object|null, extra_cost: number, extra_mood: number }}
 */
export function rollBorderIncident() {
  const base = { extra_cost: BORDER_EXTRA_COST, extra_mood: BORDER_EXTRA_MOOD };

  if (Math.random() >= BORDER_INCIDENT_PROB) {
    return { ...base, incident: null };
  }

  // Weighted random pick
  const roll = Math.random();
  let cumulative = 0;
  for (const inc of BORDER_INCIDENTS) {
    cumulative += inc.weight;
    if (roll <= cumulative) {
      return { ...base, incident: inc };
    }
  }
  return { ...base, incident: BORDER_INCIDENTS[0] };
}

/**
 * Check for viral moment (random event during a city with high reach)
 * @param {number} reach
 * @param {number} crowd_quality
 * @returns {{ viral: boolean, reach_bonus: number }}
 */
export function checkViralMoment(reach, crowd_quality) {
  // Probability increases with reach and CQ
  const prob = Math.min(0.25, (reach / 100) + (crowd_quality / 50));
  const viral = Math.random() < prob;
  return {
    viral,
    reach_bonus: viral ? (Math.random() * 3 + 1) : 0,
  };
}

/**
 * Roll for equipment failure risk based on city risk level
 * @param {number} city_risk - 1-3
 * @param {number} tech_alloc
 * @returns {{ failure: boolean, cq_penalty: number }}
 */
export function rollEquipmentRisk(city_risk, tech_alloc) {
  const base_prob = [0, 0.05, 0.12, 0.22][city_risk] ?? 0.05;
  const tech_reduction = Math.min(0.15, tech_alloc / 5000);
  const final_prob = Math.max(0, base_prob - tech_reduction);

  if (Math.random() < final_prob) {
    return { failure: true, cq_penalty: -(1.0 + Math.random() * 1.0) };
  }
  return { failure: false, cq_penalty: 0 };
}

/**
 * Random crowd surge (good weather, word-of-mouth)
 * @param {number} city_risk
 * @returns {number} attendance multiplier (1.0 = no change)
 */
export function rollCrowdSurge(city_risk) {
  if (city_risk <= 1 && Math.random() < 0.15) {
    return 1.0 + Math.random() * 0.25; // up to +25%
  }
  return 1.0;
}
