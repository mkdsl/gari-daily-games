/** @module systems/coordinator_manager — hiring, loyalty, alumni */

import { CONFIG } from '../config.js';
import { Coordinator } from '../entities/coordinator.js';
import { COORDINATORS } from '../content/coordinators_data.js';

/**
 * Try to hire a coordinator
 * @param {import('../state.js').MacroState} macro
 * @param {import('../state.js').MetaState} meta
 * @param {string} coordId
 * @param {object} upgradeEffects
 * @returns {{ ok:boolean, coordinator?:Coordinator, reason?:string }}
 */
export function hireCoordinator(macro, meta, coordId, upgradeEffects = {}) {
  const data = COORDINATORS[coordId];
  if (!data) return { ok: false, reason: 'Nepoznat koordinator' };

  // Already active?
  if (macro.active_coordinators.find(c => c.id === coordId)) {
    return { ok: false, reason: 'Koordinator već aktivan' };
  }

  // Check unlock condition
  if (data.unlockCondition) {
    if (data.unlockCondition === 'avala_completed' && !meta.guncati_unlocked) {
      return { ok: false, reason: 'Otključaj Guncati prvo' };
    }
    if (data.unlockCondition === 'avala_completed_and_regional' &&
        meta.career_tier === 'rookie') {
      return { ok: false, reason: 'Potreban career tier: regional+' };
    }
  }

  // Check if in alumni — restore loyalty
  const alumni = meta.coordinator_alumni.find(a => a.id === coordId);
  const initialLoyalty = alumni ? alumni.loyalty : 0;
  const coord = new Coordinator(coordId, initialLoyalty);

  // Hiring Network (C2): start one tier up
  const tierBoost = upgradeEffects.start_tier_upgrade || 0;

  const cost = coord.getHireCost();
  if (macro.budget < cost) {
    return { ok: false, reason: `Nedovoljan budžet (${cost} EUR)` };
  }

  macro.budget -= cost;
  macro.active_coordinators.push(coord);
  macro.coordinator_loyalty[coordId] = coord.loyalty;

  return { ok: true, coordinator: coord };
}

/**
 * Process end-of-event loyalty updates and retention rolls
 * @param {import('../state.js').MacroState} macro
 * @param {import('../state.js').MetaState} meta
 * @param {boolean} eventSuccess
 * @param {object} upgradeEffects
 */
export function processEventEnd(macro, meta, eventSuccess, upgradeEffects = {}) {
  const retentionBonus = upgradeEffects.retention_bonus || 0;
  const loyaltyGainBonus = upgradeEffects.loyalty_gain_bonus || 0;
  const maxAlumniSlots = upgradeEffects.alumni_slots || 2;

  const departing = [];
  const staying = [];

  for (const coord of macro.active_coordinators) {
    coord.applyLoyaltyChange(eventSuccess, coord.usedThisCity, loyaltyGainBonus);
    macro.coordinator_loyalty[coord.id] = coord.loyalty;

    // Loyalty floor from veteran insight
    if (meta.veteran_insights.includes('vi_loyalty_floor')) {
      coord.loyalty = Math.max(40, coord.loyalty);
      macro.coordinator_loyalty[coord.id] = coord.loyalty;
    }

    const keeps = coord.retentionRoll(retentionBonus);
    if (keeps) {
      staying.push(coord);
    } else {
      departing.push(coord);
    }
  }

  // Move departing to alumni
  for (const coord of departing) {
    if (meta.coordinator_alumni.length < maxAlumniSlots) {
      // Skill Transfer (C5): one can keep full loyalty without slot
      const hasTransfer = upgradeEffects.loyalty_preservation &&
        !meta.coordinator_alumni.some(a => a._transfer_protected);
      if (hasTransfer) {
        coord._transfer_protected = true;
        meta.coordinator_alumni.push({ id: coord.id, loyalty: coord.loyalty, _transfer_protected: true });
      } else {
        meta.coordinator_alumni.push({ id: coord.id, loyalty: coord.loyalty });
      }
    } else {
      // Drop from alumni if full
      meta.coordinator_alumni.push({ id: coord.id, loyalty: coord.loyalty });
      if (meta.coordinator_alumni.length > maxAlumniSlots) {
        meta.coordinator_alumni.shift();
      }
    }
  }

  macro.active_coordinators = staying;
}

/**
 * Get total follow rate boost from active coordinators
 * @param {import('../state.js').MacroState} macro
 * @param {object} upgradeEffects
 * @returns {number} total boost 0-0.22
 */
export function getCoordFollowRateBoost(macro, upgradeEffects = {}) {
  const base = upgradeEffects.follow_rate_bonus || 0;
  if (macro.active_coordinators.length === 0) return base;
  const best = macro.active_coordinators.reduce((max, c) =>
    c.getFollowRateBoost() > max ? c.getFollowRateBoost() : max, 0);
  return best + base;
}

/**
 * Get promo reach bonus from active coordinators
 * @param {import('../state.js').MacroState} macro
 * @returns {number}
 */
export function getCoordPromoReachBonus(macro) {
  return macro.active_coordinators.reduce((s, c) => s + c.getPromoReachBoost() * 0.1, 0);
}

/**
 * Check if any active coordinator has a specific ability
 * @param {import('../state.js').MacroState} macro
 * @param {string} abilityId
 * @returns {boolean}
 */
export function hasCoordAbility(macro, abilityId) {
  return macro.active_coordinators.some(c => c.activeAbility === abilityId);
}
