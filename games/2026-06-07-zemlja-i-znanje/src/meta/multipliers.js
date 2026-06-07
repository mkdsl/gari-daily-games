/**
 * multipliers.js — Stack svih multiplikatora
 * Prestiž + reputation bonus + staff bonus
 */

import { prestigeMultiplier } from '../utils.js';
import { STAFF_BONUSES } from '../config.js';

/**
 * Vraca finalni earning multiplier
 * @param {number} prestigeLevel
 * @param {Array} hiredStaff
 * @param {Object} toolUpgrades
 * @returns {number}
 */
export function getFinalEarningMultiplier(prestigeLevel = 0, hiredStaff = [], toolUpgrades = {}) {
  let mult = prestigeMultiplier(prestigeLevel);

  // Tool upgrade bonus (+10% earning na 450 rep)
  if (toolUpgrades.time_reduction) {
    mult *= 1.05; // efficiency → marginal earning bonus
  }

  return Math.round(mult * 100) / 100;
}

/**
 * Satisfaction multiplier stacking
 */
export function getSatisfactionMultiplier(hiredStaff = [], weather = 'sunny', planScore = 70) {
  let mult = 1.0;

  // Brana staff bonus
  if (hiredStaff.includes('brana')) mult *= 1.05;

  // Plan quality
  mult *= 1.0 + (planScore - 70) / 300;

  return mult;
}

/**
 * Vraca prikaz svih aktivnih multiplikatora (za UI)
 */
export function getMultiplierBreakdown(prestigeLevel = 0, hiredStaff = [], toolUpgrades = {}) {
  const breakdown = [];

  const prestizVal = prestigeMultiplier(prestigeLevel);
  if (prestizVal > 1.0) {
    breakdown.push({ name: `Prestiž ${prestigeLevel}`, value: prestizVal.toFixed(2) + '×' });
  }

  if (hiredStaff.includes('brana')) {
    breakdown.push({ name: 'Brana bonus', value: '+5% sat.' });
  }
  if (hiredStaff.includes('cana')) {
    breakdown.push({ name: 'Cana bonus', value: '-25% hrana' });
  }
  if (toolUpgrades?.time_reduction) {
    breakdown.push({ name: 'Premium alat', value: '-20% vreme' });
  }

  return breakdown;
}
