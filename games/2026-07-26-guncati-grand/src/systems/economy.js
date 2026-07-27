/** @fileoverview Revenue tracking, GC balance, building effects, weekly revenue calc */

import { CONFIG } from '../config.js';
import { getBuildingEffects } from '../entities/building.js';

/**
 * Calculate marketing ticket rate bonus
 * @param {number} marketingSpent - GC spent on marketing this week
 * @param {number} parkingMult - parking marketing multiplier
 * @returns {number} bonus ticket rate in GC
 */
export function calcMarketingBonus(marketingSpent, parkingMult) {
  let bonus = 0;
  const linearPart = Math.min(marketingSpent, CONFIG.MARKETING_LINEAR_CAP);
  bonus += (linearPart / 100) * CONFIG.CATEGORIES.marketing.baseEffect.ticketRate;

  if (marketingSpent > CONFIG.MARKETING_LINEAR_CAP) {
    const over = marketingSpent - CONFIG.MARKETING_LINEAR_CAP;
    bonus += over * CONFIG.MARKETING_RATE_ABOVE_CAP;
  }

  // Apply parking multiplier
  bonus *= parkingMult;

  // Cap at max%
  const maxBonus = CONFIG.MARKETING_TOTAL_CAP_PCT;
  bonus = Math.min(bonus, maxBonus);

  return bonus;
}

/**
 * Calculate effective ticket rate
 * @param {number} baseRate
 * @param {number} marketingBonus
 * @returns {number}
 */
export function calcTicketRate(baseRate, marketingBonus) {
  return baseRate + marketingBonus;
}

/**
 * Calculate weekly revenue (pre-finale weeks)
 * @param {Object} state
 * @returns {number}
 */
export function calcWeeklyRevenue(state) {
  const effects = getBuildingEffects(state.buildings);
  const parkingMult = effects.marketingMult || 1.0;
  const marketingBonus = calcMarketingBonus(state.allocation.marketing || 0, parkingMult);
  const ticketRate = calcTicketRate(state.seasonTicketRate, marketingBonus);
  const barMult = 1 + (effects.revenuePct / 100);
  const revenue = state.crowdSize * ticketRate * barMult * 0.3; // 30% of audience pays each week
  return Math.floor(revenue);
}

/**
 * Calculate Tom Sawyer volunteer cost savings
 * @param {number} wb - wellbeing %
 * @param {number} volunteerCount
 * @returns {{ cost: number, savings: number, isFree: boolean }}
 */
export function calcVolunteerCost(wb, volunteerCount) {
  if (wb >= CONFIG.TOM_SAWYER_THRESHOLD) {
    const overThreshold = wb - CONFIG.TOM_SAWYER_THRESHOLD;
    const savings = overThreshold * CONFIG.TOM_SAWYER_SAVINGS_PER_POINT;
    const normalCost = volunteerCount * CONFIG.VOLUNTEER_COST;
    const actualCost = Math.max(0, normalCost - savings);
    return {
      cost: Math.floor(actualCost),
      savings: Math.floor(savings),
      isFree: actualCost <= 0
    };
  }
  return {
    cost: volunteerCount * CONFIG.VOLUNTEER_COST,
    savings: 0,
    isFree: false
  };
}

/**
 * Calculate total weekly expenses (allocation + volunteer cost)
 * @param {Object} allocation
 * @param {number} volunteerCost
 * @returns {number}
 */
export function calcWeeklyExpenses(allocation, volunteerCost) {
  const alloc = Object.values(allocation).reduce((a, b) => a + b, 0);
  return alloc + volunteerCost;
}

/**
 * Apply weekly allocation effects to state
 * @param {Object} state - mutable game state
 * @param {Object} allocation - { gradnja, hrana, marketing, zajednica }
 */
export function applyAllocationEffects(state, allocation) {
  // Gradnja: increases crowd cap (handled by building upgrades separately)
  // Marketing: tracked for ticket rate
  state.seasonMarketingSpent = (state.seasonMarketingSpent || 0) + (allocation.marketing || 0);

  // Crowd cap from gradnja spending (not buildings)
  const gradnjaBonus = Math.floor((allocation.gradnja || 0) / 10) * CONFIG.CATEGORIES.gradnja.perUnit.crowdCap;
  state.seasonCrowdCap = Math.min(
    state.seasonCrowdCap + gradnjaBonus,
    600 // absolute cap
  );
}

/**
 * Format GC number for display
 * @param {number} gc
 * @returns {string}
 */
export function formatGC(gc) {
  if (gc >= 10000) return (gc / 1000).toFixed(1) + 'k GC';
  return Math.floor(gc) + ' GC';
}

/**
 * Calculate revenue for the entire season (for score)
 * @param {Object} state
 * @returns {number}
 */
export function calcSeasonRevenue(state) {
  return (state.totalRevenue || 0) + (state.finale?.revenue || 0);
}
