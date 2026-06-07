/**
 * participant-profiles.js — Profil svakog polaznika tokom sesije
 */

import { ARCHETYPES } from '../content/participant-archetypes.js';
import { clamp } from '../utils.js';

/**
 * Kreira runtime state za polaznika u sesiji
 */
export function createParticipantSessionState(participant) {
  return {
    id: participant.id,
    archetypeId: participant.archetypeId,
    name: participant.name,
    portrait: participant.portrait,
    energy: participant.energy,
    maxEnergy: participant.maxEnergy,
    satisfaction: participant.satisfaction,
    learned: 0,
    mood: 'neutral',
    theoryHoursAccumulated: 0,
    lastIncidentReaction: null,
    isPresent: true
  };
}

/**
 * Update energije polaznika po aktivnosti i arhetipu
 */
export function updateEnergy(pState, activity, weatherEnergyMod = 1.0) {
  const arch = ARCHETYPES[pState.archetypeId];
  const base = activity.energy_cost;
  const decayRate = arch ? arch.energy_decay_rate : 1.0;

  let change = base * decayRate * weatherEnergyMod;

  // Umirovljeni inzenjer: posle slota 5, dupli decay
  if (pState.archetypeId === 'umirovljeni_inzenjer' && pState.afternoonFatigue) {
    change *= 2.0;
  }

  pState.energy = clamp(pState.energy - change, 0, pState.maxEnergy);
  updateMood(pState);
  return pState;
}

/**
 * Update zadovoljstva na osnovu aktivnosti i arhetipa
 */
export function updateSatisfaction(pState, activity, staffPresent = []) {
  const arch = ARCHETYPES[pState.archetypeId];
  const baseSat = activity.satisfaction_base;
  const reaction = arch ? (arch.activity_reaction[activity.id] || 1.0) : 1.0;

  // Energija modifikator
  const energyMod = pState.energy < 30 ? 0.6 : pState.energy < 50 ? 0.8 : 1.0;

  let satChange = baseSat * reaction * energyMod;

  // Iskusni farmer: prakticni_rad bonus
  if (pState.archetypeId === 'iskusni_farmer' && activity.id === 'prakticni_rad') {
    satChange += (arch.special?.hands_on_bonus || 0);
  }

  pState.satisfaction = clamp(pState.satisfaction + satChange, 0, 100);
  return pState;
}

/**
 * Update learned po aktivnosti
 */
export function updateLearned(pState, activity) {
  const arch = ARCHETYPES[pState.archetypeId];
  const base = activity.learned_base;
  const alwaysBonus = arch?.special?.always_learned_bonus || 0;

  pState.learned += base + alwaysBonus;
  return pState;
}

/**
 * Update mood na osnovu energije i zadovoljstva
 */
export function updateMood(pState) {
  const avgScore = (pState.energy / 100 + pState.satisfaction / 100) / 2;
  if (avgScore >= 0.75) pState.mood = 'happy';
  else if (avgScore >= 0.5)  pState.mood = 'neutral';
  else if (avgScore >= 0.3)  pState.mood = 'tired';
  else pState.mood = 'unhappy';
  return pState;
}

/**
 * Vraca prosecno zadovoljstvo grupe (0-1)
 */
export function getGroupAvgSatisfaction(participantStates) {
  if (!participantStates.length) return 0;
  const present = participantStates.filter(p => p.isPresent);
  if (!present.length) return 0;
  const sum = present.reduce((s, p) => s + p.satisfaction, 0);
  return sum / (present.length * 100);
}

/**
 * Vraca prosecnu energiju grupe (0-1)
 */
export function getGroupAvgEnergy(participantStates) {
  if (!participantStates.length) return 0;
  const present = participantStates.filter(p => p.isPresent);
  if (!present.length) return 0;
  const sum = present.reduce((s, p) => s + p.energy, 0);
  return sum / (present.length * 100);
}
