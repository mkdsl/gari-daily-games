/** @module systems/prestige — prestige reset, fan DB formula */

import { PRESTIGE_RESET, FAN_DB_MULTIPLIERS } from '../config.js';
import { computeFanValue, addFanEntry, computePromoEffBonus } from '../entities/fan.js';

/**
 * @typedef {Object} PrestigeState
 * @property {number} level
 * @property {import('../entities/fan.js').FanDB} fan_db
 * @property {number[]} past_scores - final rep scores from past runs
 * @property {string[]} past_endings
 */

/**
 * Create initial prestige state
 * @returns {PrestigeState}
 */
export function createPrestigeState() {
  return {
    level: 0,
    fan_db: { total: 0, entries: [], promo_eff_bonus: 0 },
    past_scores: [],
    past_endings: [],
  };
}

/**
 * Check if ending qualifies for prestige
 * @param {string} ending_id
 * @returns {boolean}
 */
export function canPrestige(ending_id) {
  return ending_id !== 'GUNCATI_ZATVOREN';
}

/**
 * Accumulate fan_db from a completed run
 * @param {PrestigeState} prestige
 * @param {Array<{city_id:string, attendance:number, crowd_quality:number}>} city_results
 * @param {string} ending_id
 * @returns {PrestigeState}
 */
export function accumulateFanDB(prestige, city_results, ending_id) {
  const mult = FAN_DB_MULTIPLIERS[ending_id] ?? 0;
  let fan_db = { ...prestige.fan_db };

  for (const r of city_results) {
    const value = computeFanValue(r.attendance, r.crowd_quality, mult);
    fan_db = addFanEntry(fan_db, {
      city_id: r.city_id,
      attendance: r.attendance,
      crowd_quality: r.crowd_quality,
      value,
    });
  }

  return { ...prestige, fan_db };
}

/**
 * Perform prestige reset — returns new game state values
 * @param {PrestigeState} prestige
 * @param {Object} current_state - current game resources
 * @param {string} ending_id
 * @returns {{ new_resources: Object, new_prestige: PrestigeState }}
 */
export function performPrestige(prestige, current_state, ending_id) {
  const new_prestige = {
    ...prestige,
    level: prestige.level + 1,
    past_scores: [...prestige.past_scores, current_state.reputation],
    past_endings: [...prestige.past_endings, ending_id],
  };

  const new_resources = {
    budget: PRESTIGE_RESET.budget,
    reputation: PRESTIGE_RESET.reputation,
    crew_mood: PRESTIGE_RESET.crew_mood,
    reach: PRESTIGE_RESET.reach,
  };

  return { new_resources, new_prestige };
}

/**
 * Get prestige bonus label
 * @param {PrestigeState} prestige
 * @returns {string}
 */
export function prestigeLabel(prestige) {
  if (prestige.level === 0) return 'Sezona 1';
  const bonus = (prestige.fan_db.promo_eff_bonus * 100).toFixed(0);
  return `Sezona ${prestige.level + 1} | Fan DB: ${prestige.fan_db.total.toLocaleString()} | Promo +${bonus}%`;
}
