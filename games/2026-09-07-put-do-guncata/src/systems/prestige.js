/**
 * @module prestige — noćna vožnja unlock
 */
import { state, saveState } from '../state.js';
import { PRESTIGE } from '../config.js';

/**
 * Unlock prestige if conditions met.
 * @returns {boolean} true if newly unlocked
 */
export function checkPrestige() {
  if (!state.prestigeUnlocked && state.completedRuns >= PRESTIGE.RUNS_REQUIRED) {
    state.prestigeUnlocked = true;
    saveState();
    return true;
  }
  return false;
}

/** @returns {boolean} */
export function isPrestigeUnlocked() {
  return state.prestigeUnlocked;
}

/**
 * Apply night-mode modifiers to a route config clone.
 * Night: obstacle speedMult +20%, fuel decay ×1.3
 * @param {Object} cfg
 * @returns {Object}
 */
export function applyNightModifiers(cfg) {
  if (!state.isNightMode) return cfg;
  return { ...cfg, speedMult: (cfg.speedMult || 1) * 1.2, fuelDecayMult: 1.3 };
}

/** @returns {{unlocked:boolean, completedRuns:number, runsRequired:number, isNightMode:boolean}} */
export function getPrestigeStatus() {
  return {
    unlocked:      state.prestigeUnlocked,
    completedRuns: state.completedRuns,
    runsRequired:  PRESTIGE.RUNS_REQUIRED,
    isNightMode:   state.isNightMode
  };
}
