/** @module systems/macro_engine — macro round turn logic, decision processing */

import { CONFIG } from '../config.js';
import { CITIES, CITY_ORDER, getVenueCapacity } from '../content/cities_data.js';
import { getCityBuzz, decayPromos } from './promo_engine.js';
import { processEventEnd, getCoordFollowRateBoost } from './coordinator_manager.js';
import { computeUpgradeEffects } from './upgrade_manager.js';
import { applyReputationAfterEvent, calculateCarryOverBuzz, calculateAvalaReputation } from './carry_over.js';
import { AudioAPI } from '../audio.js';

/**
 * Get current city data
 * @param {import('../state.js').MacroState} macro
 * @returns {{ cityId:string, city:object, rep:number, buzz:number, venueCapacity:number }}
 */
export function getCurrentCityInfo(macro) {
  const cityId = CITY_ORDER[macro.current_city_index] || 'avala';
  const city = CITIES[cityId];
  const rep = macro.reputation[cityId] || 0;
  const upgradeEffects = computeUpgradeEffects(macro.upgrades_purchased);
  const buzz = getCityBuzz(macro, cityId);
  const venueCapacity = getVenueCapacity(rep);

  return { cityId, city, rep, buzz, venueCapacity, upgradeEffects };
}

/**
 * Advance to next city after event result
 * @param {import('../state.js').MacroState} macro
 * @param {import('../state.js').MetaState} meta
 * @param {number} satisfactionScore
 */
export function advanceToNextCity(macro, meta, satisfactionScore) {
  const { cityId, upgradeEffects } = getCurrentCityInfo(macro);

  // Record result
  macro.event_results.push({
    cityId,
    satisfactionScore,
    timestamp: Date.now(),
  });

  // Apply reputation change
  applyReputationAfterEvent(macro, cityId, satisfactionScore);

  // Income calculation
  const income = satisfactionScore >= CONFIG.SATISFACTION_WIN_THRESHOLD
    ? CONFIG.EVENT_SUCCESS_INCOME_BASE + Math.floor(satisfactionScore * CONFIG.EVENT_SUCCESS_INCOME_PER_PCT)
    : CONFIG.EVENT_SUCCESS_INCOME_BASE * 0.3;

  // Insurance payout on fail
  if (satisfactionScore < CONFIG.SATISFACTION_WIN_THRESHOLD && macro.insurance_active) {
    macro.budget += CONFIG.INSURANCE_PAYOUT;
    macro.insurance_active = false;
  }

  macro.budget += Math.round(income);

  // Coordinator end-of-event processing
  processEventEnd(macro, meta, satisfactionScore >= CONFIG.SATISFACTION_WIN_THRESHOLD, upgradeEffects);

  // Guncati connections bonus (Brana tier4)
  if (cityId === 'guncati' && macro.active_coordinators.some(c => c.activeAbility === 'mkdslend_mreza')) {
    macro.connections += Math.floor(satisfactionScore * 0.2);
  }

  // Decay promos
  macro.current_city_index++;
  decayPromos(macro);

  // Check Guncati unlock
  if (macro.current_city_index >= 4 && !meta.guncati_unlocked) {
    meta.guncati_unlocked = true;
  }

  // Check tour complete
  if (macro.current_city_index >= CITY_ORDER.length) {
    macro.tour_complete = true;
  }

  // Lifetime tracking
  meta.lifetime_events++;
  meta.lifetime_satisfaction += satisfactionScore;
}

/**
 * Buy insurance for current city event
 * @param {import('../state.js').MacroState} macro
 * @returns {{ ok:boolean, reason?:string }}
 */
export function buyInsurance(macro) {
  if (macro.insurance_active) return { ok: false, reason: 'Osiguranje već aktivno' };
  if (macro.budget < CONFIG.INSURANCE_COST) return { ok: false, reason: 'Nedovoljan budžet' };
  macro.budget -= CONFIG.INSURANCE_COST;
  macro.insurance_active = true;
  return { ok: true };
}

/**
 * Process start of new city (called when entering macro screen for city)
 * @param {import('../state.js').MacroState} macro
 * @param {import('../state.js').MetaState} meta
 * @param {import('../state.js').MicroState} micro
 */
export function initCityMacro(macro, meta, micro) {
  const { cityId, upgradeEffects } = getCurrentCityInfo(macro);
  AudioAPI.onMenuOpen();

  // Avala: calculate special reputation
  if (cityId === 'avala') {
    const avalaRep = calculateAvalaReputation(macro);
    macro.reputation.avala = Math.max(macro.reputation.avala || 0, avalaRep);
  }

  // Deki dialog
  if (cityId === 'avala') {
    // Trigger Deki dialog if hired
    const hasDeki = macro.active_coordinators.find(c => c.id === 'deki');
    if (hasDeki) {
      // UI will show this dialog
      macro._pendingDialog = { coordId: 'deki', trigger: 'avala_macro' };
    }
  }
}

/**
 * Check if tour is won
 * @param {import('../state.js').MacroState} macro
 * @returns {{ won:boolean, avalaScore:number, isGrandFinale:boolean }}
 */
export function checkTourVictory(macro) {
  if (!macro.tour_complete) return { won: false, avalaScore: 0, isGrandFinale: false };
  const avalaResult = macro.event_results.find(r => r.cityId === 'avala');
  const avalaScore = avalaResult ? avalaResult.satisfactionScore : 0;
  const isGrandFinale = avalaScore >= CONFIG.AVALA_GRAND_WIN_THRESHOLD;
  return { won: true, avalaScore, isGrandFinale };
}
