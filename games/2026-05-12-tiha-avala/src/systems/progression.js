// progression.js — level unlock management

import { getUnlockedLevels } from './score.js';
import { state } from '../state.js';

export function refreshUnlockedLevels() {
  const unlocked = getUnlockedLevels();
  state.unlocked_levels = unlocked;
}

export function isLevelUnlocked(level_id) {
  return state.unlocked_levels.has(level_id);
}

export function unlockLevel(level_id) {
  state.unlocked_levels.add(level_id);
}
