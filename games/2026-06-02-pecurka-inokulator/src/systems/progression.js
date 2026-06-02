// systems/progression.js — score kalkulacija, nivo logika
import { CONFIG } from '../config.js';

/**
 * Kalkuliše score za pogodak uzimajući u obzir:
 * - Bazni score nivoa
 * - Golden window multiplikator
 * - Streak multiplikator
 *
 * @param {Object} levelConfig - CONFIG.LEVELS[n]
 * @param {'green'|'golden'} windowType
 * @param {number} streak - tekući streak POSLE ovog pogotka
 * @returns {number}
 */
export function calcHitScore(levelConfig, windowType, streak) {
  const base       = levelConfig.scorePerHit;
  const windowMult = windowType === 'golden' ? CONFIG.GOLDEN_SCORE_MULT : 1.0;

  let streakMult = 1.0;
  if (streak >= CONFIG.STREAK_MULTIPLIER.threshold2) {
    streakMult = CONFIG.STREAK_MULTIPLIER.mult2;
  } else if (streak >= CONFIG.STREAK_MULTIPLIER.threshold1) {
    streakMult = CONFIG.STREAK_MULTIPLIER.mult1;
  }

  return Math.round(base * windowMult * streakMult);
}

/**
 * Kalkuliše perfect bonus (bez grešaka na cijelom nivou).
 * @param {Object} levelConfig
 * @returns {number}
 */
export function calcPerfectBonus(levelConfig) {
  return Math.round(levelConfig.scorePerHit * CONFIG.PERFECT_BONUS_MULT);
}

/**
 * Da li je nivo završen (sve vreće inokulisane).
 * @param {Object} state
 * @returns {boolean}
 */
export function isLevelComplete(state) {
  if (!state.bags || state.bags.length === 0) return false;
  // Nivo je gotov kad activeBagIndex pređe zadnju vreću
  return state.activeBagIndex >= state.bags.length;
}

/**
 * Prelaz na sledeći nivo — mutira state in-place.
 * @param {Object} state
 */
export function advanceLevel(state) {
  state.level      = Math.min(state.level + 1, CONFIG.LEVELS.length);
  state.levelScore = 0;
  // Streak se čuva između nivoa
}

/**
 * Da li je igra pobjeda (nivo 10 završen).
 * @param {Object} state
 * @returns {boolean}
 */
export function isGameWon(state) {
  return state.level >= CONFIG.LEVELS.length && isLevelComplete(state);
}

/**
 * Da li je ovaj nivo bio savršen (nema grešaka).
 * Koristi state.missCount koji se inkrementira u main.js pri svakom missu.
 * @param {Object} state
 * @returns {boolean}
 */
export function isPerfectLevel(state) {
  return state.missCount === 0;
}
