/**
 * achievements.js — Provera i unlock achievementa
 */

import { ACHIEVEMENTS_DEF } from '../config.js';
import { computeCS } from '../state.js';
import { allTomaChoicesA } from './narrative_state.js';
import { loadAchievements, saveAchievements } from '../state.js';

/**
 * Proveri sve achievements posle završene igre
 * @param {GameState} state
 * @param {string} endingId
 * @returns {Array<string>} novo unlockovani achievement ID-ovi
 */
export function checkEndgameAchievements(state, endingId) {
  const newlyUnlocked = [];
  const existing = loadAchievements();

  function tryUnlock(id) {
    if (!existing.includes(id)) {
      existing.push(id);
      newlyUnlocked.push(id);
    }
  }

  // A1: Zajednica nastaje
  if (endingId === 'zajednica') tryUnlock('A1');

  // A2: Sve Toma opcije A
  if (allTomaChoicesA(state)) tryUnlock('A2');

  // A4: Nered ≤ 2 na kraju
  if (state.resources.nered <= 2) tryUnlock('A4');

  // A6: Energija ≥ 7, bez V+2 "help" opcija
  if (state.resources.energija >= 7 && !state.achievements.usedV2Help) tryUnlock('A6');

  // A7: Prestige unlock + završen 2. run
  if (state.isPrestige) tryUnlock('A7');

  // A8 i A5 i A3 se unlockovani tokom igre (checkMidgameAchievement)
  // Dodajemo ih ovde ako su u earned listi
  for (const id of (state.achievements.earned || [])) {
    if (!existing.includes(id)) {
      existing.push(id);
      newlyUnlocked.push(id);
    }
  }

  saveAchievements(existing);
  return newlyUnlocked;
}

/**
 * Unlock achievement tokom igre (na opciju izbora)
 * @param {GameState} state
 * @param {string} achievementId
 */
export function unlockMidgameAchievement(state, achievementId) {
  if (!state.achievements.earned) state.achievements.earned = [];
  if (!state.achievements.earned.includes(achievementId)) {
    state.achievements.earned.push(achievementId);
  }
}

/**
 * Svi unlocked achievements (globalni, persistent)
 * @returns {Array<AchievementDef>}
 */
export function getAllUnlockedAchievements() {
  const earned = loadAchievements();
  return earned.map(id => ACHIEVEMENTS_DEF[id]).filter(Boolean);
}

/**
 * Detalj achievementa za UI prikaz
 * @param {string} id
 * @returns {AchievementDef|null}
 */
export function getAchievementDef(id) {
  return ACHIEVEMENTS_DEF[id] || null;
}
