/** @module systems/progression — career tier, achievements, unlock conditions */

import { CONFIG } from '../config.js';

/**
 * @typedef {'rookie'|'regional'|'balkanski_fenomen'|'legenda'} CareerTier
 */

export const ACHIEVEMENTS = [
  { id: 'first_event',      desc: 'Završio prvi event',              condition: meta => meta.lifetime_events >= 1 },
  { id: 'nis_master',       desc: 'Niš ≥ 80% satisfaction',          condition: (meta, macro) => macro.event_results.some(r => r.cityId === 'nis' && r.satisfactionScore >= 80) },
  { id: 'carry_king',       desc: 'Carry-over gosti 3+ eventi',       condition: (meta, macro) => macro.event_results.length >= 3 },
  { id: 'zero_incidents',   desc: 'Event bez ijednog incidenta',      condition: (meta, macro, micro) => micro && micro.incident_queue.length === 0 },
  { id: 'avala_grand',      desc: 'Avala ≥ 90% — Grand Finale',       condition: (meta, macro) => macro.event_results.some(r => r.cityId === 'avala' && r.satisfactionScore >= 90) },
  { id: 'prestige_1',       desc: 'Prva prestige sesija',             condition: meta => meta.prestige_count >= 1 },
  { id: 'full_loyalty',     desc: 'Koordinator na Tier 5',            condition: (meta, macro) => macro.active_coordinators.some(c => c.loyaltyTier >= 5) },
  { id: 'budget_master',    desc: 'Završi turu sa 500+ EUR ostatka',  condition: (meta, macro) => macro.tour_complete && macro.budget >= 500 },
];

/**
 * Check and unlock achievements
 * @param {import('../state.js').MetaState} meta
 * @param {import('../state.js').MacroState} macro
 * @param {import('../state.js').MicroState} [micro]
 * @returns {string[]} newly unlocked achievement IDs
 */
export function checkAchievements(meta, macro, micro = null) {
  const newlyUnlocked = [];
  for (const ach of ACHIEVEMENTS) {
    if (meta.achievements.includes(ach.id)) continue;
    try {
      if (ach.condition(meta, macro, micro)) {
        meta.achievements.push(ach.id);
        newlyUnlocked.push(ach.id);
      }
    } catch (_) {
      // ignore errors in condition checks
    }
  }
  return newlyUnlocked;
}

/**
 * Check career tier upgrade conditions
 * @param {import('../state.js').MacroState} macro
 * @param {import('../state.js').MetaState} meta
 * @returns {{ upgraded:boolean, newTier?:CareerTier }}
 */
export function checkCareerTierUpgrade(macro, meta) {
  const results = macro.event_results;
  const currentTier = meta.career_tier;

  // regional: 1 tour (5 events) with ≥ 3 satisfactions ≥ 70%
  if (currentTier === 'rookie') {
    const goodEvents = results.filter(r => r.satisfactionScore >= 70).length;
    if (results.length >= 5 && goodEvents >= 3) {
      meta.career_tier = 'regional';
      return { upgraded: true, newTier: 'regional' };
    }
  }

  // balkanski_fenomen: all 4 pre-Avala ≥ 70% + Avala ≥ 80%
  if (currentTier === 'regional') {
    const preAvala = results.filter(r => r.cityId !== 'avala');
    const avalaResult = results.find(r => r.cityId === 'avala');
    const allPreGood = preAvala.length >= 4 && preAvala.every(r => r.satisfactionScore >= 70);
    const avalaGood = avalaResult && avalaResult.satisfactionScore >= 80;
    if (allPreGood && avalaGood) {
      meta.career_tier = 'balkanski_fenomen';
      return { upgraded: true, newTier: 'balkanski_fenomen' };
    }
  }

  // legenda: Avala ≥ 90% + 0 CRITICAL in tour OR Deki T5 ability
  if (currentTier === 'balkanski_fenomen') {
    const avalaResult = results.find(r => r.cityId === 'avala');
    const hasAvala90 = avalaResult && avalaResult.satisfactionScore >= 90;
    const hasDekiLegenda = macro.active_coordinators.some(c => c.activeAbility === 'legenda_turneje_trigger');
    if (hasAvala90 || hasDekiLegenda) {
      meta.career_tier = 'legenda';
      return { upgraded: true, newTier: 'legenda' };
    }
  }

  return { upgraded: false };
}

/**
 * Check challenge/guncati unlock conditions
 * @param {import('../state.js').MacroState} macro
 * @param {import('../state.js').MetaState} meta
 */
export function checkUnlockConditions(macro, meta) {
  if (!meta.guncati_unlocked && macro.event_results.some(r => r.cityId === 'avala')) {
    meta.guncati_unlocked = true;
  }
  if (!meta.challenge_modes_unlocked && meta.prestige_count >= 2) {
    meta.challenge_modes_unlocked = true;
  }
}

/**
 * Get career tier display info
 * @param {CareerTier} tier
 * @returns {{ label:string, color:string, description:string }}
 */
export function getCareerTierInfo(tier) {
  const TIERS = {
    rookie:             { label: 'Rookie Promoter',      color: '#6a6a9a', description: 'Tek počinješ. Niš te čeka.' },
    regional:           { label: 'Regionalni Promoter',   color: '#4df5ff', description: 'Publika te prepoznaje. Vreme za veće salone.' },
    balkanski_fenomen:  { label: 'Balkanski Fenomen',     color: '#ffb830', description: 'Tvoje ime znaju kroz ceo region.' },
    legenda:            { label: 'Legenda Turneje',       color: '#c44dff', description: 'Avala. Grandioso. Nema više šta da dokažeš — samo da potvrdiš.' },
  };
  return TIERS[tier] || TIERS.rookie;
}
