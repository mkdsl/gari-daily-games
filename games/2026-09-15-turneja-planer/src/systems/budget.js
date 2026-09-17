/** @module systems/budget — budget tracking and split allocator */

import {
  TRANSPORT_ALLOC_TIERS,
  TECH_ALLOC_TIERS,
  PROMO_MULT_CAP,
  PROMO_REACH_BASE,
  PROMO_MULT_BASE,
} from '../config.js';

/**
 * @typedef {Object} BudgetSplit
 * @property {number} transport
 * @property {number} promo
 * @property {number} tech
 */

/**
 * Compute transport alloc effects
 * @param {number} amount
 * @returns {{ mood: number, cq: number }}
 */
export function transportAllocEffects(amount) {
  for (const tier of TRANSPORT_ALLOC_TIERS) {
    if (amount <= tier.max) {
      return { mood: tier.mood, cq: tier.cq };
    }
  }
  return { mood: 1.0, cq: 0 };
}

/**
 * Compute promo multiplier from alloc
 * @param {number} amount
 * @param {number} [fan_promo_bonus=0]
 * @returns {number}
 */
export function promoMult(amount, fan_promo_bonus = 0) {
  if (amount <= 0) return 1.0;
  const raw = 1.0 + Math.log10(amount / PROMO_MULT_BASE) * 0.5 + fan_promo_bonus;
  return Math.min(raw, PROMO_MULT_CAP);
}

/**
 * Compute reach gain from promo alloc
 * @param {number} amount
 * @returns {number}
 */
export function promoReachGain(amount) {
  if (amount <= 0) return 0;
  return Math.max(0, Math.log10(amount / PROMO_REACH_BASE) * 1.5);
}

/**
 * Compute tech alloc CQ bonus
 * @param {number} amount
 * @returns {number}
 */
export function techAllocCQ(amount) {
  for (const tier of TECH_ALLOC_TIERS) {
    if (amount <= tier.max) {
      return tier.cq;
    }
  }
  return 1.5;
}

/**
 * Validate split doesn't exceed available budget
 * @param {BudgetSplit} split
 * @param {number} available
 * @returns {boolean}
 */
export function validateSplit(split, available) {
  const total = (split.transport || 0) + (split.promo || 0) + (split.tech || 0);
  return total <= available;
}

/**
 * Total spend from split
 * @param {BudgetSplit} split
 * @returns {number}
 */
export function splitTotal(split) {
  return (split.transport || 0) + (split.promo || 0) + (split.tech || 0);
}

/**
 * Deduct crew daily rates from budget for one city
 * @param {number} budget
 * @param {import('../entities/crew_member.js').CrewMember[]} crew
 * @returns {number}
 */
export function deductCrewCost(budget, crew) {
  const cost = crew.reduce((sum, m) => sum + m.daily_rate, 0);
  return budget - cost;
}
