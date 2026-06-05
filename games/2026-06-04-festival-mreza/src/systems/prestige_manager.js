/** @module systems/prestige_manager — prestige reset, veteran insights, multiplier */

import { CONFIG } from '../config.js';

export const VETERAN_INSIGHTS = [
  { id: 'vi_buzz_decay',          desc: 'Promo half-life +1 dan' },
  { id: 'vi_routing_speed',       desc: 'Migration speed +0.4/s' },
  { id: 'vi_loyalty_floor',       desc: 'Loyalty nikad < 40' },
  { id: 'vi_energy_reserve',      desc: 'Max energy debt +15' },
  { id: 'vi_satisfaction_memory', desc: 'Buzz bonus 0.30→0.35' },
  { id: 'vi_incident_delay',      desc: 'MEDIUM incidents +15s pre eskalacije' },
];

/**
 * Calculate prestige multiplier
 * @param {number} prestigeCount
 * @returns {number}
 */
export function calculatePrestigeMultiplier(prestigeCount) {
  return Math.pow(CONFIG.PRESTIGE_MULTIPLIER_BASE, prestigeCount);
}

/**
 * Check if prestige is available (tour completed)
 * @param {import('../state.js').MacroState} macro
 * @param {import('../state.js').MetaState} meta
 * @returns {boolean}
 */
export function canPrestige(macro, meta) {
  return macro.tour_complete;
}

/**
 * Select veteran insights (player picks 3 from 6)
 * @param {import('../state.js').MetaState} meta
 * @param {string[]} selectedIds array of 3 insight IDs
 * @returns {{ ok:boolean, reason?:string }}
 */
export function selectVeteranInsights(meta, selectedIds) {
  if (selectedIds.length !== 3) {
    return { ok: false, reason: 'Izaberi tačno 3 veteran insights' };
  }
  const validIds = new Set(VETERAN_INSIGHTS.map(v => v.id));
  for (const id of selectedIds) {
    if (!validIds.has(id)) return { ok: false, reason: `Nepoznat insight: ${id}` };
  }
  meta.veteran_insights = selectedIds;
  return { ok: true };
}

/**
 * Execute prestige reset
 * @param {import('../state.js').MacroState} macro
 * @param {import('../state.js').MetaState} meta
 * @param {string[]} selectedInsights
 * @param {Function} createMacroState fn to create fresh macro state
 * @returns {{ ok:boolean }}
 */
export function executePrestige(macro, meta, selectedInsights, createMacroState) {
  if (!canPrestige(macro, meta)) return { ok: false };

  const result = selectVeteranInsights(meta, selectedInsights);
  if (!result.ok) return { ok: false };

  meta.prestige_count++;
  meta.prestige_multiplier = calculatePrestigeMultiplier(meta.prestige_count);

  // Preserve alumni (already in meta)
  // Reset macro to fresh state
  const fresh = createMacroState(meta.career_tier);
  Object.assign(macro, fresh);

  return { ok: true };
}

/**
 * Apply prestige multiplier to budget
 * @param {number} baseBudget
 * @param {number} prestigeMultiplier
 * @returns {number}
 */
export function applyPrestigeToStartingBudget(baseBudget, prestigeMultiplier) {
  return Math.round(baseBudget * prestigeMultiplier);
}

/**
 * Get veteran insight effects as object
 * @param {string[]} veteranInsights
 * @returns {object}
 */
export function getVeteranInsightEffects(veteranInsights) {
  return {
    halflife_bonus: veteranInsights.includes('vi_buzz_decay') ? 1 : 0,
    routing_speed_bonus: veteranInsights.includes('vi_routing_speed') ? 0.4 : 0,
    loyalty_floor: veteranInsights.includes('vi_loyalty_floor') ? 40 : 0,
    energy_reserve_bonus: veteranInsights.includes('vi_energy_reserve') ? 15 : 0,
    satisfaction_memory: veteranInsights.includes('vi_satisfaction_memory'),
    incident_delay: veteranInsights.includes('vi_incident_delay') ? 15 : 0,
  };
}
