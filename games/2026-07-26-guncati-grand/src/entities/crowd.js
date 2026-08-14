/** @fileoverview Crowd entity: capacity, mood formula, Crowd_Mood calculation */

import { CONFIG } from '../config.js';

/**
 * @typedef {Object} CrowdState
 * @property {number} crowdCurrent - actual attendees
 * @property {number} crowdCap - maximum capacity
 * @property {number} crowdMood - 0-100
 */

/**
 * Calculate effective crowd cap for a given week
 * @param {Object} state
 * @returns {number}
 */
export function calcCrowdCap(state) {
  const { buildings, seasonMarketingSpent, currentWB } = state;

  let cap = CONFIG.CROWD_BASE;

  // Building contributions
  for (const [id, level] of Object.entries(buildings)) {
    if (level === 0) continue;
    const bConfig = CONFIG.BUILDINGS[id];
    if (!bConfig) continue;
    for (let l = 0; l < level; l++) {
      const def = bConfig.levels[l];
      if (def && def.crowdCap) cap += def.crowdCap;
    }
  }

  // WC missing penalty: if WC = 0, -20 capacity
  if (buildings.wc === 0) {
    cap -= 20;
  }

  // Marketing crowd contribution
  const marketingCrowdBonus = Math.min(
    (seasonMarketingSpent / 100) * CONFIG.CROWD_MARKETING_100_PER_WEEK,
    CONFIG.CROWD_MARKETING_100_PER_WEEK * 2
  );
  cap += marketingCrowdBonus;

  return Math.max(50, Math.floor(cap));
}

/**
 * Calculate actual crowd size for a week result
 * @param {Object} state
 * @returns {number}
 */
export function calcCrowdSize(state) {
  const cap = calcCrowdCap(state);

  // Word of mouth grows crowd each week
  const wom = state.week * CONFIG.CROWD_WORD_OF_MOUTH_PER_WEEK;
  const raw = CONFIG.CROWD_BASE + wom;

  return Math.min(raw, cap);
}

/**
 * Calculate initial finale crowd size
 * @param {Object} state - full game state
 * @returns {number}
 */
export function calcFinaleInitialCrowd(state) {
  const cap = state.seasonCrowdCap;
  const seasonBuilt = Object.values(state.buildings).some(l => l > 0);
  const base = seasonBuilt ? Math.min(state.crowdSize * 1.5, cap) : state.crowdSize;
  return Math.floor(Math.min(base, cap));
}

/**
 * Calculate crowd mood based on current finale state
 * @param {Object} finaleState
 * @param {number} wellbeing - current WB %
 * @returns {number} mood 0-100
 */
export function calcCrowdMood(finaleState, wellbeing) {
  const { djHype, crowdMood } = finaleState;

  // Hype contributes to mood
  const hypeFactor = djHype * CONFIG.FINALE_MOOD_HYPE_WEIGHT;
  // WB contributes
  const wbFactor = wellbeing * CONFIG.FINALE_MOOD_WB_WEIGHT;
  // Natural drift toward current hype level
  const drift = (djHype - crowdMood) * 0.05;

  const newMood = crowdMood + drift + (hypeFactor + wbFactor - crowdMood * 0.1) * 0.02;
  return Math.max(10, Math.min(100, newMood));
}

/**
 * Crowd mood color for UI display
 * @param {number} mood 0-100
 * @returns {string} CSS color
 */
export function moodToColor(mood) {
  if (mood >= 80) return '#4caf50';
  if (mood >= 60) return '#8bc34a';
  if (mood >= 40) return '#ff9800';
  if (mood >= 20) return '#f44336';
  return '#9c27b0';
}

/**
 * Crowd mood label
 * @param {number} mood
 * @returns {string}
 */
export function moodToLabel(mood) {
  if (mood >= 85) return '🔥 Euforija!';
  if (mood >= 70) return '😄 Fenomenalno';
  if (mood >= 55) return '😊 Dobro raspoloženi';
  if (mood >= 40) return '😐 Solidno';
  if (mood >= 25) return '😟 Nezadovoljni';
  return '😡 Bijesni';
}

/**
 * Calculate crowd revenue contribution per second during finale
 * @param {number} crowdCurrent
 * @param {number} ticketRate
 * @param {number} revenuePct - from buildings
 * @param {number} finaleElapsed - seconds
 * @param {number} totalDuration - seconds
 * @returns {number}
 */
export function calcFinaleRevenueTick(crowdCurrent, ticketRate, revenuePct, finaleElapsed, totalDuration) {
  // Revenue trickles in over time; final burst at end
  const progressFactor = Math.min(finaleElapsed / totalDuration, 1.0);
  const barMult = 1 + (revenuePct / 100);
  const perSecond = (crowdCurrent * ticketRate * barMult) / totalDuration;
  return perSecond;
}
