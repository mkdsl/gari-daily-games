/** @module systems/promo_engine — promo decay, buzz accumulation */

import { CONFIG } from '../config.js';
import { PromoRecord, getPromoTypeConfig } from '../entities/promo.js';

/**
 * Buy a promo investment
 * @param {import('../state.js').MacroState} macro
 * @param {string} type promo type
 * @param {string} cityId
 * @param {object} upgradeEffects
 * @returns {{ ok:boolean, reason?:string }}
 */
export function buyPromo(macro, type, cityId, upgradeEffects = {}) {
  const cfg = getPromoTypeConfig(type, CONFIG, upgradeEffects);

  // Radio: check usage limit
  if (type === 'radio') {
    const maxUses = upgradeEffects.radio_max_uses || 1;
    const usedThisCity = macro.promo_investments.filter(
      p => p.type === 'radio' && p.cityId === cityId
    ).length;
    if (usedThisCity >= maxUses) {
      return { ok: false, reason: `Radio već iskorišten ${maxUses}× za ovaj grad` };
    }
  }

  // Flyer: check cross-city usage with P2
  if (type === 'flyer' && upgradeEffects.flyer_multi_city) {
    // allowed in 2 cities for same cost — no additional check
  }

  if (macro.budget < cfg.cost) {
    return { ok: false, reason: 'Nedovoljan budžet' };
  }

  macro.budget -= cfg.cost;

  const reach = cfg.reach + (upgradeEffects.coord_reach_bonus || 0);
  const record = new PromoRecord({
    type,
    initialBuzz: reach,
    halfLife: cfg.halfLife,
    cityId,
    dayPlaced: macro.current_city_index,
  });
  macro.promo_investments.push(record);
  return { ok: true };
}

/**
 * Get current buzz for a city from all active promos
 * @param {import('../state.js').MacroState} macro
 * @param {string} cityId
 * @returns {number} total buzz (0-100 range)
 */
export function getCityBuzz(macro, cityId) {
  const now = macro.current_city_index;
  let total = 0;
  for (const p of macro.promo_investments) {
    if (p.cityId === cityId && p.active) {
      total += p.currentBuzz(now);
    }
  }
  // Cross-city seeding bonus (P6)
  const crossBonus = (macro.upgrades_purchased.includes('P6'))
    ? macro.event_results.length * 3
    : 0;
  return Math.min(100, total + crossBonus);
}

/**
 * Decay all promos (called each turn advance)
 * Removes expired promos
 * @param {import('../state.js').MacroState} macro
 */
export function decayPromos(macro) {
  const now = macro.current_city_index;
  macro.promo_investments = macro.promo_investments.filter(p => {
    p.currentBuzz(now);  // updates p.active
    return p.active;
  });
}

/**
 * Apply influencer promo (P4 unlock required)
 * @param {import('../state.js').MacroState} macro
 * @param {string} cityId
 * @param {object} upgradeEffects
 * @returns {{ ok:boolean, reason?:string }}
 */
export function buyInfluencerPromo(macro, cityId, upgradeEffects) {
  if (!macro.upgrades_purchased.includes('P4')) {
    return { ok: false, reason: 'Micro-Influencer Pack nije kupljen' };
  }
  return buyPromo(macro, 'influencer', cityId, upgradeEffects);
}
