/**
 * progression.js — Crew XP, Bond tracking, prestige trigger/reset, unlock gating
 * Jova jQuery @ Gari Daily Games 2026-06-06
 */

import {
  XP_PER_OUTCOME,
  XP_UNLOCK_THRESHOLDS,
  BOND_LEVEL_THRESHOLDS,
  PRESTIGE_UNLOCK_XP,
  PRESTIGE_LEGENDARY_NIGHTS_NEEDED
} from '../config.js';

/**
 * Update crew XP based on night outcome
 * @param {Object} state - Game state (mutated)
 * @param {'legendary'|'good'|'survived'|'kaos'} nightOutcome
 * @returns {{xpGained: number, newXP: number, leveledUp: boolean}}
 */
export function updateCrewXP(state, nightOutcome) {
  const xpGained = XP_PER_OUTCOME[nightOutcome] || 0;
  const oldXP = state.crewXP;
  state.crewXP = (state.crewXP || 0) + xpGained;

  // Check if new unlocks triggered
  const newUnlocks = checkUnlocks(state, oldXP);

  return {
    xpGained,
    newXP: state.crewXP,
    newUnlocks
  };
}

/**
 * Update bond levels for all pairs in the current crew
 * Called at end of each completed night
 *
 * @param {Object} state - Game state (mutated)
 * @param {{memberId: string}[]} crew - Current crew
 * @returns {{newBonds: string[], leveledBonds: string[]}}
 */
export function updateBonds(state, crew) {
  const memberIds = crew.map(c => c.memberId || c.id).filter(Boolean);
  const newBonds = [];
  const leveledBonds = [];

  // Generate all pairs
  for (let i = 0; i < memberIds.length; i++) {
    for (let j = i + 1; j < memberIds.length; j++) {
      const pairKey = makePairKey(memberIds[i], memberIds[j]);

      if (!state.bondLevels) state.bondLevels = {};
      if (!state.bondLevels[pairKey]) {
        state.bondLevels[pairKey] = { sharedNights: 0, bondLevel: 0 };
        newBonds.push(pairKey);
      }

      const bond = state.bondLevels[pairKey];
      bond.sharedNights++;

      // Check level up
      const newLevel = calculateBondLevel(bond.sharedNights);
      if (newLevel > bond.bondLevel) {
        bond.bondLevel = newLevel;
        leveledBonds.push(`${memberIds[i]}_${memberIds[j]}_L${newLevel}`);
      }
    }
  }

  return { newBonds, leveledBonds };
}

/**
 * Check for new member unlocks based on current state
 * @param {Object} state - Game state (mutated - adds to unlockedMembers)
 * @param {number} [previousXP] - XP before this update (to detect new thresholds)
 * @returns {string[]} Newly unlocked member IDs
 */
export function checkUnlocks(state, previousXP = -1) {
  const newUnlocks = [];

  if (!state.unlockedMembers) state.unlockedMembers = [];

  // XP-based unlocks
  for (const [memberId, xpThreshold] of Object.entries(XP_UNLOCK_THRESHOLDS)) {
    if (state.crewXP >= xpThreshold &&
        !state.unlockedMembers.includes(memberId)) {
      state.unlockedMembers.push(memberId);
      newUnlocks.push(memberId);
    }
  }

  // Completed nights unlock: stefan at 5 nights
  if (state.completedNights >= 5 && !state.unlockedMembers.includes('stefan')) {
    state.unlockedMembers.push('stefan');
    newUnlocks.push('stefan');
  }

  // Bond-based unlocks
  if (state.bondLevels) {
    // Tanja: bond_bojan_2 — Bojan and Tanja bond level 2
    // Note: Tanja is unlocked when Bojan reaches bond 2 with ANY member
    // (representing Bojan's dance circle growing)
    const bojanBonds = getBondsForMember(state, 'bojan');
    const hasBojanBond2 = bojanBonds.some(b => b.bondLevel >= 2);
    if (hasBojanBond2 && !state.unlockedMembers.includes('tanja')) {
      state.unlockedMembers.push('tanja');
      newUnlocks.push('tanja');
    }

    // Ivana: bond_ana_2 — Ana reaches bond 2 with any member
    const anaBonds = getBondsForMember(state, 'ana');
    const hasAnaBond2 = anaBonds.some(b => b.bondLevel >= 2);
    if (hasAnaBond2 && !state.unlockedMembers.includes('ivana')) {
      state.unlockedMembers.push('ivana');
      newUnlocks.push('ivana');
    }
  }

  // Prestige-based unlock: Guncati at prestige 1
  if (state.prestigeLevel >= 1 && !state.unlockedMembers.includes('guncati')) {
    state.unlockedMembers.push('guncati');
    newUnlocks.push('guncati');
  }

  // Achievement unlock: Tonović DJ at legendary achievement
  if (state.achievements && state.achievements.first_legendary &&
      !state.unlockedMembers.includes('tonovic')) {
    state.unlockedMembers.push('tonovic');
    newUnlocks.push('tonovic');
  }

  return newUnlocks;
}

/**
 * Check if prestige is available
 * @param {Object} state
 * @returns {boolean}
 */
export function checkPrestige(state) {
  if (state.crewXP < PRESTIGE_UNLOCK_XP) return false;
  const needed = PRESTIGE_LEGENDARY_NIGHTS_NEEDED[state.prestigeLevel + 1];
  if (!needed) return false; // Max prestige reached
  return state.totalLegendaryNights >= needed;
}

/**
 * Apply prestige reset (called after player confirms)
 * Resets career progression but increases prestige level
 * @param {Object} state
 * @returns {{newPrestigeLevel: number, bonusUnlocked: string|null}}
 */
export function applyPrestigeReset(state) {
  const newPrestigeLevel = (state.prestigeLevel || 0) + 1;
  state.prestigeLevel = newPrestigeLevel;
  state.crewXP = 0;
  state.completedNights = 0;
  state.bondLevels = {};
  state.achievements = {};
  state.careerTier = 0;
  // Preserve history and legendary count
  state.prestigeNightCount = 0;

  // Prestige 1 unlocks Guncati
  let bonusUnlocked = null;
  if (newPrestigeLevel === 1 && !state.unlockedMembers.includes('guncati')) {
    state.unlockedMembers.push('guncati');
    bonusUnlocked = 'guncati';
  }

  return { newPrestigeLevel, bonusUnlocked };
}

/**
 * Get bond level between two members
 * @param {Object} state
 * @param {string} id1
 * @param {string} id2
 * @returns {number} Bond level (0-3)
 */
export function getBondLevel(state, id1, id2) {
  if (!state.bondLevels) return 0;
  const pairKey = makePairKey(id1, id2);
  return state.bondLevels[pairKey]?.bondLevel || 0;
}

/**
 * Get bond data for a member (all their pairs)
 * @param {Object} state
 * @param {string} memberId
 * @returns {Array<{pairKey: string, otherId: string, bondLevel: number, sharedNights: number}>}
 */
export function getBondsForMember(state, memberId) {
  if (!state.bondLevels) return [];
  const bonds = [];

  for (const [pairKey, bond] of Object.entries(state.bondLevels)) {
    const ids = pairKey.split('_');
    if (ids.includes(memberId)) {
      const otherId = ids.find(id => id !== memberId);
      bonds.push({ pairKey, otherId, bondLevel: bond.bondLevel, sharedNights: bond.sharedNights });
    }
  }

  return bonds;
}

/**
 * Calculate bond level from shared nights count
 * @param {number} sharedNights
 * @returns {number} Bond level 0-3
 */
export function calculateBondLevel(sharedNights) {
  for (let level = BOND_LEVEL_THRESHOLDS.length - 1; level >= 0; level--) {
    if (sharedNights >= BOND_LEVEL_THRESHOLDS[level]) {
      return level;
    }
  }
  return 0;
}

/**
 * Grant an achievement
 * @param {Object} state
 * @param {string} achievementId
 * @returns {boolean} True if newly granted
 */
export function grantAchievement(state, achievementId) {
  if (!state.achievements) state.achievements = {};
  if (state.achievements[achievementId]) return false;
  state.achievements[achievementId] = true;
  return true;
}

/**
 * Check and grant achievements based on current state
 * @param {Object} state
 * @param {string} nightOutcome
 * @param {number} nightScore
 * @returns {string[]} Newly granted achievement IDs
 */
export function checkAndGrantAchievements(state, nightOutcome, nightScore) {
  const granted = [];

  // First night
  if (state.completedNights === 1) {
    if (grantAchievement(state, 'first_night')) granted.push('first_night');
  }

  // First legendary night
  if (nightOutcome === 'legendary') {
    if (grantAchievement(state, 'first_legendary')) granted.push('first_legendary');
  }

  // Perfect score (100)
  if (nightScore >= 100) {
    if (grantAchievement(state, 'perfect_night')) granted.push('perfect_night');
  }

  // Survival (kaos outcome)
  if (nightOutcome === 'kaos') {
    if (grantAchievement(state, 'survived_kaos')) granted.push('survived_kaos');
  }

  return granted;
}

/**
 * Create pair key (alphabetically sorted)
 * @param {string} id1
 * @param {string} id2
 * @returns {string}
 */
function makePairKey(id1, id2) {
  return [id1, id2].sort().join('_');
}

/**
 * Get all unlocked member IDs
 * @param {Object} state
 * @returns {string[]}
 */
export function getUnlockedMemberIds(state) {
  return state.unlockedMembers || ['maja', 'dragan', 'ana', 'bojan', 'lena', 'pedja'];
}

/**
 * Get prestige info
 * @param {Object} state
 * @returns {{level: number, nextNightsNeeded: number|null, canPrestige: boolean}}
 */
export function getPrestigeInfo(state) {
  const level = state.prestigeLevel || 0;
  const nextNeeded = PRESTIGE_LEGENDARY_NIGHTS_NEEDED[level + 1] || null;
  const canPrestige = checkPrestige(state);

  return {
    level,
    nextNightsNeeded: nextNeeded ? nextNeeded - state.totalLegendaryNights : null,
    canPrestige
  };
}
