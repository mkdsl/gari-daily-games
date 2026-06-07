/**
 * reputation.js — rep_gain = participants × avg_satisfaction × season_multiplier formula
 */

import { SEASON_MULTIPLIERS, SATISFACTION_REP_MODIFIERS, MAX_REPUTATION } from '../config.js';

/**
 * Izracunava rep gain za sezonu
 * @param {number} participants — broj prisutnih
 * @param {number} avgSatisfaction — 0-1
 * @param {number} seasonNumber — 1-5 u prestiz ciklusu
 * @param {number} journalistBonus — 0 ili 10
 * @returns {number} rep gained
 */
export function calcRepGain(participants, avgSatisfaction, seasonNumber = 1, journalistBonus = 0) {
  const seasonMult = SEASON_MULTIPLIERS[Math.min(seasonNumber - 1, SEASON_MULTIPLIERS.length - 1)] || 1.0;
  const satMod = getSatisfactionMod(avgSatisfaction);

  const base = Math.round(participants * avgSatisfaction * 100 * satMod * seasonMult);
  return base + journalistBonus;
}

function getSatisfactionMod(sat) {
  let mod = 0;
  for (const entry of SATISFACTION_REP_MODIFIERS) {
    if (sat >= entry.threshold) mod = entry.multiplier;
  }
  return mod;
}

/**
 * Vraca label za reputation range
 */
export function getRepLabel(rep) {
  if (rep >= 900) return 'Legenda';
  if (rep >= 700) return 'Majstor';
  if (rep >= 500) return 'Ekspert';
  if (rep >= 300) return 'Napredni';
  if (rep >= 150) return 'Iskusni';
  if (rep >= 75)  return 'Etabliran';
  if (rep >= 25)  return 'Poćetnik';
  return 'Novi';
}

/**
 * Progress do sledeceg threshold-a
 */
export function getRepProgress(rep) {
  const thresholds = [0, 25, 50, 75, 100, 125, 150, 175, 200, 250, 300, 350, 400, 450, 500, 550, 600, 700, 800, 900, 950, 1000];
  for (let i = 0; i < thresholds.length - 1; i++) {
    if (rep < thresholds[i + 1]) {
      const range = thresholds[i + 1] - thresholds[i];
      const progress = rep - thresholds[i];
      return {
        current: rep,
        next: thresholds[i + 1],
        progress: progress / range,
        remaining: thresholds[i + 1] - rep
      };
    }
  }
  return { current: rep, next: 1000, progress: 1, remaining: 0 };
}
