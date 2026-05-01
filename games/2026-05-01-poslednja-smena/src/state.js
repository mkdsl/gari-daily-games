import { CONFIG } from './config.js';

/**
 * @returns {number} val clamped between min and max
 */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * @returns {Object} fresh game state with all stats at STAT_START
 */
export function createState() {
  return {
    version: 1,
    stats: {
      ponos:       CONFIG.STAT_START,
      gorčina:     CONFIG.STAT_START,
      umor:        CONFIG.STAT_START,
      solidarnost: CONFIG.STAT_START,
    },
    currentSceneIndex: 0,
    history: [],   // Array of { sceneId, choiceIndex } — audit trail
    ending: null,  // null | 'A' | 'B' | 'C' | 'D' | 'E'
    gamePhase: 'playing', // 'playing' | 'epilog'
  };
}

/**
 * @param {Object} state
 */
export function saveState(state) {
  try {
    localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded or private mode — silently ignore
  }
}

/**
 * @returns {Object|null} saved state, or null if absent / incompatible version
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(CONFIG.SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Wipe saved progress.
 */
export function resetState() {
  localStorage.removeItem(CONFIG.SAVE_KEY);
}
