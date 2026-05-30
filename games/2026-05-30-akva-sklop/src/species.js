/**
 * species.js — Akva-Sklop
 * Species health calculations (fish and ducks).
 */

import {
  FISH_PH_MIN,
  FISH_PH_MAX,
  FISH_HEALTH_RECOVERY,
  FISH_HEALTH_DAMAGE,
  DUCK_MIN_LEVEL,
  DUCK_HEALTH_RECOVERY,
  DUCK_HEALTH_DAMAGE,
  DUCK_WASTE_PH,
} from './config.js';

/**
 * Calculate new fish health after one simulation week.
 * @param {number} currentHealth  0–100
 * @param {number} pH
 * @returns {number} new health, clamped 0–100
 */
export function calcFishHealth(currentHealth, pH) {
  const inRange = pH >= FISH_PH_MIN && pH <= FISH_PH_MAX;
  const delta = inRange ? FISH_HEALTH_RECOVERY : -FISH_HEALTH_DAMAGE;
  return Math.min(100, Math.max(0, currentHealth + delta));
}

/**
 * Calculate new duck health after one simulation week.
 * @param {number} currentHealth  0–100
 * @param {number} waterLevel     current lake level in L
 * @returns {number} new health, clamped 0–100
 */
export function calcDuckHealth(currentHealth, waterLevel) {
  const ok = waterLevel >= DUCK_MIN_LEVEL;
  const delta = ok ? DUCK_HEALTH_RECOVERY : -DUCK_HEALTH_DAMAGE;
  return Math.min(100, Math.max(0, currentHealth + delta));
}

/**
 * pH reduction caused by ducks per week.
 * @param {number} ducks  number of ducks in the lake
 * @returns {number} negative pH delta (e.g. -0.03 for 3 ducks)
 */
export function calcDuckWaste(ducks) {
  return -(ducks * Math.abs(DUCK_WASTE_PH));
}

/**
 * Species health status string.
 * @param {number} health  0–100
 * @returns {'healthy'|'warning'|'critical'}
 */
export function getSpeciesStatus(health) {
  if (health > 70) return 'healthy';
  if (health >= 30) return 'warning';
  return 'critical';
}

/**
 * Sum ducks across all lakes.
 * @param {object} lakes  state.lakes
 * @returns {number}
 */
export function countTotalDucks(lakes) {
  return (lakes.A.ducks || 0) + (lakes.B.ducks || 0) + (lakes.C.ducks || 0);
}

/**
 * Sum fish across all lakes.
 * @param {object} lakes  state.lakes
 * @returns {number}
 */
export function countTotalFish(lakes) {
  return (lakes.A.fish || 0) + (lakes.B.fish || 0) + (lakes.C.fish || 0);
}
