/**
 * FlagManager.js — Boolean flag tracker za narativne izbore
 * Wrapper oko GameState flags sa validacijom i historijom
 * @module FlagManager
 */

import GameState from './GameState.js';

const KNOWN_FLAGS = new Set([
  'setlista_printovana',
  'tonika_potvrdjeno',
  'bojan_happy'
]);

const flagHistory = [];

/**
 * Set a named flag
 * @param {string} name - Flag name
 * @param {boolean} [value=true]
 * @returns {boolean} Success
 */
export function setFlag(name, value = true) {
  if (!KNOWN_FLAGS.has(name)) {
    console.warn(`[FlagManager] Unknown flag: "${name}"`);
    return false;
  }
  const prev = GameState.getFlag(name);
  if (prev === value) return true; // already set
  flagHistory.push({ name, prev, value, ts: Date.now() });
  GameState.setFlag(name, value);
  return true;
}

/**
 * Get flag value
 * @param {string} name
 * @returns {boolean}
 */
export function getFlag(name) {
  return GameState.getFlag(name);
}

/**
 * Check multiple flags — all must be true
 * @param {string[]} names
 * @returns {boolean}
 */
export function allFlags(names) {
  return names.every(n => GameState.getFlag(n));
}

/**
 * Check multiple flags — any must be true
 * @param {string[]} names
 * @returns {boolean}
 */
export function anyFlag(names) {
  return names.some(n => GameState.getFlag(n));
}

/**
 * Get snapshot of all flags
 * @returns {object}
 */
export function getAllFlags() {
  return {
    setlista_printovana: GameState.getFlag('setlista_printovana'),
    tonika_potvrdjeno: GameState.getFlag('tonika_potvrdjeno'),
    bojan_happy: GameState.getFlag('bojan_happy')
  };
}

/**
 * Get flag change history
 * @returns {Array}
 */
export function getFlagHistory() {
  return [...flagHistory];
}

/**
 * Validate required flag from choice requirements
 * @param {object|null} requires - { flag: 'name' } or null
 * @returns {{ ok: boolean, reason: string|null }}
 */
export function checkFlagRequirement(requires) {
  if (!requires || !requires.flag) return { ok: true, reason: null };
  const flag = requires.flag;
  const val = getFlag(flag);
  if (!val) {
    const labels = {
      setlista_printovana: 'setlista printovana',
      tonika_potvrdjeno: 'Tonika potvrđeno',
      bojan_happy: 'Bojan u kombiju'
    };
    return {
      ok: false,
      reason: `Potrebno: ${labels[flag] ?? flag}`
    };
  }
  return { ok: true, reason: null };
}

export default { setFlag, getFlag, allFlags, anyFlag, getAllFlags, getFlagHistory, checkFlagRequirement };
