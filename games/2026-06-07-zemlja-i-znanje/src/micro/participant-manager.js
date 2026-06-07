/**
 * participant-manager.js — Update energije i zadovoljstva po tipu aktivnosti
 */

import { ACTIVITY_TYPES, STAFF_BONUSES } from '../config.js';
import { calcEnergyChange, applyEnergyChange, applyPausaEffect } from './energy-system.js';
import { calcActivitySatisfaction, applySatisfactionChange, calcGroupSatisfaction } from './satisfaction-calc.js';
import { ARCHETYPES } from '../content/participant-archetypes.js';
import { updateMood, updateLearned } from '../macro/participant-profiles.js';

/**
 * Update svih polaznika za jedan tick sesije
 * @param {Array} participantStates
 * @param {string} activityId
 * @param {number} deltaMinutes — game minutes elapsed this tick
 * @param {Object} context
 */
export function updateParticipants(participantStates, activityId, deltaMinutes, context = {}) {
  const { staff = [], weather = 'sunny', planScore = 70, hasCana = false, weatherEnergyMod = 1.0, weatherOutdoorBonus = 0 } = context;

  for (const pState of participantStates) {
    if (!pState.isPresent) continue;

    // Energy
    const energyChange = calcEnergyChange(activityId, pState.archetypeId, weatherEnergyMod, 0, hasCana);
    applyEnergyChange(pState, energyChange, deltaMinutes);

    // Pauza special
    if (activityId === 'pauza') {
      applyPausaEffect(pState, hasCana);
    }

    // Satisfaction
    const staffPresent = staff.length > 0;
    const satChange = calcActivitySatisfaction(activityId, pState.archetypeId, 1.0, {
      staffPresent,
      weatherBonus: weatherOutdoorBonus,
      planScore
    }) * (deltaMinutes / 60);

    applySatisfactionChange(pState, satChange);

    // Learned (only once per slot completion, not per tick)
    const act = ACTIVITY_TYPES[activityId];
    if (act && act.learned_base > 0) {
      const arch = ARCHETYPES[pState.archetypeId];
      const learnedRate = (act.learned_base / 60) * deltaMinutes;
      const bonus = arch?.special?.always_learned_bonus || 0;
      pState.learned += learnedRate + (bonus * deltaMinutes / 60);
    }

    // Afternoon fatigue (umirovljeni inzenjer)
    if (pState.archetypeId === 'umirovljeni_inzenjer') {
      const sessionHour = context.sessionHour || 0;
      pState.afternoonFatigue = sessionHour >= 5;
    }

    // Update mood
    updateMood(pState);
  }
}

/**
 * Vraca presentCount
 */
export function getPresentCount(participantStates) {
  return participantStates.filter(p => p.isPresent).length;
}

/**
 * Uklanja polaznika (INC_11 "Pusti ga")
 */
export function removeParticipant(participantStates, participantId) {
  const p = participantStates.find(p => p.id === participantId);
  if (p) p.isPresent = false;
}

/**
 * Journalist bonus check
 */
export function checkJournalistBonus(participantStates) {
  const journalist = participantStates.find(p => p.archetypeId === 'lokalni_novinar' && p.isPresent);
  if (!journalist) return 0;
  return journalist.satisfaction >= 80 ? 10 : 0; // +10 rep bonus
}
