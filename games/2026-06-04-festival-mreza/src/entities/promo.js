/** @module entities/promo — PromoRecord entity */

/**
 * @typedef {'social'|'flyer'|'radio'|'influencer'} PromoType
 */

export class PromoRecord {
  /**
   * @param {object} opts
   * @param {PromoType} opts.type
   * @param {number} opts.initialBuzz
   * @param {number} opts.halfLife days until buzz halves
   * @param {string} opts.cityId city where promo was placed
   * @param {number} opts.dayPlaced macro round index
   */
  constructor({ type, initialBuzz, halfLife, cityId, dayPlaced }) {
    this.type = type;
    this.initialBuzz = initialBuzz;
    this.halfLife = halfLife;
    this.cityId = cityId;
    this.dayPlaced = dayPlaced;
    this.id = `promo_${type}_${cityId}_${dayPlaced}_${Date.now()}`;
    this.active = true;
  }

  /**
   * Current buzz value using exponential decay
   * buzz_remaining(t) = initial_buzz × 0.5^(t / half_life)
   * @param {number} currentDay macro round index
   * @returns {number}
   */
  currentBuzz(currentDay) {
    const t = currentDay - this.dayPlaced;
    if (t < 0) return this.initialBuzz;
    const remaining = this.initialBuzz * Math.pow(0.5, t / this.halfLife);
    if (remaining < 0.5) {
      this.active = false;
      return 0;
    }
    return remaining;
  }

  /**
   * Adjust half-life (e.g. from Decay Shield upgrade)
   * @param {number} multiplier
   */
  extendHalfLife(multiplier) {
    this.halfLife = this.halfLife * multiplier;
  }
}

/**
 * Promo type config helper
 * @param {PromoType} type
 * @param {import('../config.js').CONFIG} CONFIG
 * @param {object} [upgrades] active upgrade effects
 * @returns {{ reach:number, cost:number, halfLife:number }}
 */
export function getPromoTypeConfig(type, CONFIG, upgrades = {}) {
  const hallifeMult = upgrades.halflife_multiplier || 1.0;
  const radioDiscount = upgrades.radio_cost_reduction || 0;
  const socialReachBonus = upgrades.social_reach_bonus || 0;
  const flyerReachBonus = upgrades.flyer_reach_bonus || 0;

  switch (type) {
    case 'social':
      return {
        reach: CONFIG.PROMO_SOCIAL_REACH + socialReachBonus,
        cost: CONFIG.PROMO_SOCIAL_COST,
        halfLife: CONFIG.PROMO_SOCIAL_HALFLIFE * hallifeMult,
      };
    case 'flyer':
      return {
        reach: CONFIG.PROMO_FLYER_REACH + flyerReachBonus,
        cost: CONFIG.PROMO_FLYER_COST,
        halfLife: CONFIG.PROMO_FLYER_HALFLIFE * hallifeMult,
      };
    case 'radio':
      return {
        reach: CONFIG.PROMO_RADIO_REACH,
        cost: Math.round(CONFIG.PROMO_RADIO_COST * (1 - radioDiscount)),
        halfLife: CONFIG.PROMO_RADIO_HALFLIFE * hallifeMult,
      };
    case 'influencer':
      return {
        reach: 20,
        cost: 120,
        halfLife: 3 * hallifeMult,
      };
    default:
      throw new Error(`Unknown promo type: ${type}`);
  }
}
