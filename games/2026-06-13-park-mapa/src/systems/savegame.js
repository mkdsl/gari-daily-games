/**
 * savegame.js — localStorage serijalizacija, export/import JSON, version migration
 * Park Mapa | Jova jQuery
 */

import { CONFIG } from '../config.js';
import { createInitialState } from '../state.js';

const CURRENT_VERSION = 3;

/**
 * Serialize state to JSON and store in localStorage.
 * Includes a save timestamp.
 * @param {Object} state
 */
export function saveGame(state) {
  try {
    const toSave = {
      ...state,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(toSave));
  } catch (e) {
    // Quota exceeded or private mode — silently ignore
    console.warn('[savegame] save failed:', e);
  }
}

/**
 * Load state from localStorage.
 * Calls migrateState if version mismatch.
 * @returns {Object|null} Parsed and migrated state, or null if not found.
 */
export function loadGame() {
  try {
    const raw = localStorage.getItem(CONFIG.SAVE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    // Migrate if version is missing or older
    if (!parsed.version || parsed.version < CURRENT_VERSION) {
      return migrateState(parsed);
    }

    return parsed;
  } catch (e) {
    console.warn('[savegame] load failed:', e);
    return null;
  }
}

/**
 * Remove save from localStorage and return a fresh state.
 * @returns {Object} Fresh initial state
 */
export function resetGame() {
  localStorage.removeItem(CONFIG.SAVE_KEY);
  return createInitialState();
}

/**
 * Handle migration from older save versions to v3.
 * v1→v2: add logbook array if missing
 * v2→v3: add npcMissions, season fields if missing
 * Always merges with createInitialState() to fill missing fields.
 * @param {Object} savedState
 * @returns {Object} Migrated state at version 3
 */
export function migrateState(savedState) {
  const fresh = createInitialState();
  let state = { ...fresh, ...savedState };

  // v1 → v2: add logbook array
  if (!state.version || state.version < 2) {
    if (!Array.isArray(state.logbook)) {
      state.logbook = [];
    }
    state.version = 2;
  }

  // v2 → v3: add npcMissions and season fields
  if (state.version < 3) {
    if (!state.npcMissions) {
      state.npcMissions = fresh.npcMissions || {};
    }
    if (state.season === undefined) {
      state.season = fresh.season || 'proljece';
    }
    if (state.seasonDay === undefined) {
      state.seasonDay = fresh.seasonDay || 0;
    }
    if (state.renovationCount === undefined) {
      state.renovationCount = fresh.renovationCount || 0;
    }
    state.version = 3;
  }

  // Final pass: fill any fields still missing from fresh state
  for (const key of Object.keys(fresh)) {
    if (state[key] === undefined) {
      state[key] = fresh[key];
    }
  }

  state.version = CURRENT_VERSION;
  return state;
}

/**
 * Return JSON string of current state for download/share.
 * @param {Object} state
 * @returns {string} JSON string
 */
export function exportGameJSON(state) {
  return JSON.stringify({
    ...state,
    exportedAt: new Date().toISOString(),
    version: CURRENT_VERSION
  }, null, 2);
}

/**
 * Parse JSON string, validate, and migrate if needed.
 * @param {string} jsonStr
 * @returns {Object} Migrated state
 * @throws {Error} If JSON is invalid or not a game save
 */
export function importGameJSON(jsonStr) {
  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error('Invalid JSON: ' + e.message);
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Import failed: not a valid save object.');
  }

  // Must have at least pt or totalPtEarned to look like a game save
  if (parsed.pt === undefined && parsed.totalPtEarned === undefined) {
    throw new Error('Import failed: does not look like a Park Mapa save file.');
  }

  // Migrate to current version
  if (!parsed.version || parsed.version < CURRENT_VERSION) {
    return migrateState(parsed);
  }

  // Still merge with fresh to fill any newly added fields
  const fresh = createInitialState();
  const merged = { ...fresh, ...parsed, version: CURRENT_VERSION };
  return merged;
}
