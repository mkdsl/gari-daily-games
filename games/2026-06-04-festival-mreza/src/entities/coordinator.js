/** @module entities/coordinator — Coordinator entity */

import { CONFIG } from '../config.js';
import { COORDINATORS, getLoyaltyTier, getCoordinatorCost } from '../content/coordinators_data.js';

export class Coordinator {
  /**
   * @param {string} id — key into COORDINATORS
   * @param {number} initialLoyalty
   */
  constructor(id, initialLoyalty = 0) {
    const data = COORDINATORS[id];
    if (!data) throw new Error(`Unknown coordinator: ${id}`);
    this.id = id;
    this.data = data;
    this.loyalty = initialLoyalty;
    this.usedThisCity = false;
    this.isAlumni = false;
  }

  /** @returns {number} 1-5 */
  get loyaltyTier() {
    return getLoyaltyTier(this.loyalty);
  }

  /** @returns {string|null} active ability id */
  get activeAbility() {
    const t = this.loyaltyTier;
    if (t >= 5 && this.data.tier5Ability) return this.data.tier5Ability;
    if (t >= 4 && this.data.tier4Ability) return this.data.tier4Ability;
    if (t >= 3 && this.data.tier3Ability) return this.data.tier3Ability;
    if (t >= 2 && this.data.tier2Ability) return this.data.tier2Ability;
    return this.data.tier1Ability || null;
  }

  /**
   * Apply loyalty change after event
   * @param {boolean} eventSuccess
   * @param {boolean} wasUsed
   * @param {number} loyaltyGainBonus extra from C7 upgrade
   */
  applyLoyaltyChange(eventSuccess, wasUsed, loyaltyGainBonus = 0) {
    if (wasUsed) {
      const base = eventSuccess
        ? CONFIG.LOYALTY_GAIN_SUCCESS
        : CONFIG.LOYALTY_GAIN_FAIL;
      this.loyalty += base + loyaltyGainBonus;
    } else {
      this.loyalty = Math.max(0, this.loyalty + CONFIG.LOYALTY_DECAY_UNUSED);
    }
    this.usedThisCity = false;
  }

  /**
   * Retention roll — does this coordinator stay?
   * @param {number} retentionBonus extra from C1 upgrade (0-0.3)
   * @returns {boolean}
   */
  retentionRoll(retentionBonus = 0) {
    const rate = CONFIG.COORDINATOR_RETENTION_BASE + retentionBonus;
    return Math.random() < rate;
  }

  /**
   * Get hire cost at current loyalty tier
   * @returns {number}
   */
  getHireCost() {
    return getCoordinatorCost(this.data, this.loyaltyTier);
  }

  /**
   * Get boost to follow rate from this coordinator
   * @returns {number} 0-0.22
   */
  getFollowRateBoost() {
    const t = this.loyaltyTier;
    if (t >= 4) return 0.22;
    if (t >= 3) return 0.15;
    if (t >= 2) return 0.07;
    return 0;
  }

  /**
   * Get boost to promo reach from this coordinator
   * @returns {number}
   */
  getPromoReachBoost() {
    return this.data.baseReach;
  }

  /**
   * Mark coordinator as used this city (for ability activations)
   */
  markUsed() {
    this.usedThisCity = true;
  }
}
