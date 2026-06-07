/**
 * prestige.js — Prestiž reset logika
 * Cuva: start_rep(+25%), jedan stručnjak, jedan alat, +10% zarada
 */

import { bus, EVT } from '../events.js';
import {
  PRESTIGE_SEASONS_REQUIRED,
  PRESTIGE_REP_BONUS,
  PRESTIGE_EARNING_BONUS,
  MAX_REPUTATION
} from '../config.js';
import { prestigeMultiplier } from '../utils.js';
import { getAforizem } from '../content/aforizmi.js';

/**
 * Check da li je prestige reset dostupan
 * @param {number} reputation
 * @param {number} totalSeasonsCompleted
 */
export function isPrestigeAvailable(reputation, totalSeasonsCompleted) {
  return reputation >= MAX_REPUTATION || totalSeasonsCompleted >= PRESTIGE_SEASONS_REQUIRED;
}

/**
 * Executes prestige reset
 * @param {Object} metaState
 * @param {Object} macroState
 * @param {string} keptStaffId
 * @param {string} keptToolId
 * @returns {Object} updated metaState
 */
export function executePrestige(metaState, macroState, keptStaffId = null, keptToolId = null) {
  const prevLevel = metaState.prestigeLevel || 0;
  const newLevel = prevLevel + 1;

  // Save kept staff/tool
  metaState.prestigeKeptStaff = keptStaffId;
  metaState.prestigeKeptTool = keptToolId;

  // New starting rep = 25% of previous max
  const startRep = Math.round(metaState.reputation * PRESTIGE_REP_BONUS);

  // Update meta
  metaState.prestigeLevel = newLevel;
  metaState.prestigeCycles = (metaState.prestigeCycles || 0) + 1;
  metaState.reputation = startRep;

  // Reset some unlocks (keep: staff, tema that was used, premium tools)
  const keepStaff = keptStaffId ? ['alatko', keptStaffId] : ['alatko'];
  metaState.unlockedStaff = keepStaff;
  metaState.maxParticipants = 4 + (newLevel * 1); // small bonus per prestige
  metaState.maxSessionDays = 1;

  // Themes reset to base + keep one
  metaState.unlockedThemes = ['suvozid'];

  bus.emit(EVT.PRESTIGE_CONFIRM, {
    prevLevel,
    newLevel,
    startRep,
    multiplier: prestigeMultiplier(newLevel)
  });

  bus.emit(EVT.AUDIO_PLAY, { sound: 'prestige' });
  bus.emit(EVT.PARTICLE_GOLD, { x: 400, y: 250, count: 120 });
  bus.emit(EVT.TOAST, {
    msg: `Prestiž ${newLevel}! Multiplier: ${prestigeMultiplier(newLevel).toFixed(2)}×`,
    type: 'success',
    duration: 5000
  });

  return metaState;
}

/**
 * Vraca prestige prompt choices (koji stručnjak/alat zadržati)
 */
export function getPrestigeChoices(metaState, macroState) {
  return {
    availableStaff: metaState.unlockedStaff.filter(s => s !== 'alatko'),
    multiplier: prestigeMultiplier((metaState.prestigeLevel || 0) + 1),
    earningBonus: PRESTIGE_EARNING_BONUS * ((metaState.prestigeLevel || 0) + 1),
    startRep: Math.round((metaState.reputation || 0) * PRESTIGE_REP_BONUS)
  };
}
