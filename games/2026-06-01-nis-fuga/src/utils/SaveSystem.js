/**
 * SaveSystem.js — localStorage save/load za Niš Fuga
 * Auto-save posle svakog scene transition-a
 * @module SaveSystem
 */

import GameState from './GameState.js';

const SAVE_KEY = 'nis_fuga_save_v1';
const AUTO_SAVE_KEY = 'nis_fuga_autosave_v1';

/**
 * Save current state to localStorage
 * @param {string} [slot='auto']
 * @returns {boolean} success
 */
export function save(slot = 'auto') {
  try {
    const key = slot === 'auto' ? AUTO_SAVE_KEY : `${SAVE_KEY}_${slot}`;
    const data = {
      state: GameState.serialize(),
      savedAt: Date.now(),
      version: 1
    };
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.warn('[SaveSystem] Save failed:', e);
    return false;
  }
}

/**
 * Load state from localStorage
 * @param {string} [slot='auto']
 * @returns {boolean} success
 */
export function load(slot = 'auto') {
  try {
    const key = slot === 'auto' ? AUTO_SAVE_KEY : `${SAVE_KEY}_${slot}`;
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data || !data.state) return false;
    // Version check
    if (data.version !== 1) {
      console.warn('[SaveSystem] Save version mismatch, discarding');
      return false;
    }
    GameState.deserialize(data.state);
    return true;
  } catch (e) {
    console.warn('[SaveSystem] Load failed:', e);
    return false;
  }
}

/**
 * Check if a save exists
 * @param {string} [slot='auto']
 * @returns {boolean}
 */
export function hasSave(slot = 'auto') {
  try {
    const key = slot === 'auto' ? AUTO_SAVE_KEY : `${SAVE_KEY}_${slot}`;
    return !!localStorage.getItem(key);
  } catch {
    return false;
  }
}

/**
 * Get save metadata without loading full state
 * @param {string} [slot='auto']
 * @returns {object|null}
 */
export function getSaveMeta(slot = 'auto') {
  try {
    const key = slot === 'auto' ? AUTO_SAVE_KEY : `${SAVE_KEY}_${slot}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data) return null;
    const state = data.state;
    return {
      savedAt: data.savedAt,
      currentScene: state.currentScene,
      timeLeft: state.resources?.time ?? 0,
      morale: state.resources?.morale ?? 0,
      reputation: state.resources?.reputation ?? 0,
      achievements: state.achievements?.length ?? 0,
      gameComplete: state.gameComplete ?? false,
      ending: state.ending ?? null
    };
  } catch {
    return null;
  }
}

/**
 * Delete save
 * @param {string} [slot='auto']
 */
export function deleteSave(slot = 'auto') {
  try {
    const key = slot === 'auto' ? AUTO_SAVE_KEY : `${SAVE_KEY}_${slot}`;
    localStorage.removeItem(key);
  } catch (e) {
    console.warn('[SaveSystem] Delete failed:', e);
  }
}

/**
 * Auto-save hook — call after each meaningful state change
 */
export function autoSave() {
  save('auto');
}

/**
 * Clear all saves for this game
 */
export function clearAllSaves() {
  try {
    localStorage.removeItem(AUTO_SAVE_KEY);
    for (let i = 0; i < 3; i++) {
      localStorage.removeItem(`${SAVE_KEY}_${i}`);
    }
  } catch (e) {
    console.warn('[SaveSystem] Clear failed:', e);
  }
}

export default { save, load, hasSave, getSaveMeta, deleteSave, autoSave, clearAllSaves };
