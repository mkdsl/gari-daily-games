/**
 * satisfaction-calc.js — Kalkulacija zadovoljstva po formuli
 * Aktivnost + tajming + incident outcome + arhetype reakcija
 */

import { ACTIVITY_TYPES } from '../config.js';
import { ARCHETYPES } from '../content/participant-archetypes.js';
import { clamp } from '../utils.js';

/**
 * Izracunava satisfaction change za slot aktivnost
 * @param {string} activityId
 * @param {string} archetypeId
 * @param {number} slotProgress 0-1 (da li je završen kompletno)
 * @param {Object} context {staffPresent, weatherBonus, planScore}
 */
export function calcActivitySatisfaction(activityId, archetypeId, slotProgress = 1.0, context = {}) {
  const act = ACTIVITY_TYPES[activityId];
  if (!act) return 0;

  const arch = ARCHETYPES[archetypeId];
  const baseSat = act.satisfaction_base;
  const reaction = arch ? (arch.activity_reaction[activityId] || 1.0) : 1.0;

  // Completion bonus — više bodova ako je slot kompletno odrađen
  const completionMod = 0.5 + slotProgress * 0.5;

  // Staff bonus
  const staffMod = context.staffPresent ? 1.1 : 1.0;

  // Weather outdoor bonus (mali efekat)
  const weatherMod = 1.0 + (context.weatherBonus || 0) / 100;

  // Plan quality modifier
  const planMod = 1.0 + ((context.planScore || 70) - 70) / 200;

  let change = baseSat * reaction * completionMod * staffMod * weatherMod * planMod;

  return Math.round(change * 10) / 10;
}

/**
 * Primienjuje satisfaction promenu na pState
 */
export function applySatisfactionChange(pState, delta) {
  if (!pState.isPresent) return pState;

  // Energy modifikator — ako je umoran, zadovoljstvo raste sporije
  const energyMod = pState.energy < 25 ? 0.5 : pState.energy < 50 ? 0.8 : 1.0;
  const adjustedDelta = delta * energyMod;

  pState.satisfaction = clamp(pState.satisfaction + adjustedDelta, 0, 100);
  return pState;
}

/**
 * Primienjuje incident efekat na satisfaction
 */
export function applyIncidentEffect(pState, effect, archetypeId) {
  if (!pState.isPresent) return pState;

  let delta = effect.satisfaction || 0;

  // Archetype-specific bonuses from incident
  if (effect.archetype_bonus && effect.archetype_bonus[archetypeId]) {
    delta += effect.archetype_bonus[archetypeId];
  }
  if (effect.archetype_penalty && effect.archetype_penalty[archetypeId]) {
    delta += effect.archetype_penalty[archetypeId];
  }

  pState.satisfaction = clamp(pState.satisfaction + delta, 0, 100);
  return pState;
}

/**
 * Vraca grupu prosečnog zadovoljstva (0-1)
 */
export function calcGroupSatisfaction(participantStates) {
  const present = participantStates.filter(p => p.isPresent);
  if (!present.length) return 0;
  return present.reduce((s, p) => s + p.satisfaction, 0) / (present.length * 100);
}

/**
 * Satisfaction threshold classifier
 */
export function classifySatisfaction(ratio) {
  if (ratio >= 0.95) return { label: 'Odlično',  color: '#F4C430', grade: 'S' };
  if (ratio >= 0.85) return { label: 'Sjajno',   color: '#5aad5a', grade: 'A' };
  if (ratio >= 0.75) return { label: 'Dobro',    color: '#4A6741', grade: 'B' };
  if (ratio >= 0.65) return { label: 'Solidno',  color: '#C4956A', grade: 'C' };
  if (ratio >= 0.50) return { label: 'Slabo',    color: '#A0522D', grade: 'D' };
  return { label: 'Loše', color: '#cc3333', grade: 'F' };
}
