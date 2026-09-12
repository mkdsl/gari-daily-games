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

// ─── Variant tracking (localStorage, per-device) ───────────────────────────

const _VARIANTS_KEY = 'pdg_completed_variants';
const _ALL_ROUTES = ['brze', 'slikovitije', 'sigurnije'];

function _loadVariants() {
  try { return new Set(JSON.parse(localStorage.getItem(_VARIANTS_KEY) || '[]')); }
  catch { return new Set(); }
}
function _saveVariants(s) {
  try { localStorage.setItem(_VARIANTS_KEY, JSON.stringify([...s])); } catch {}
}

/** Mark the just-completed (route, isNight) pair as seen. */
export function trackCompletedRoute(route, isNight) {
  const s = _loadVariants();
  s.add(`${route}-${isNight ? 'night' : 'day'}`);
  _saveVariants(s);
}

/**
 * Returns human-readable list of unseen variant categories.
 * e.g. ['2 rute', 'noćna vožnja']
 * @returns {string[]}
 */
export function getVariantsRemaining() {
  const done = _loadVariants();
  const prestigeUnlocked = isPrestigeUnlocked();
  const parts = [];

  const unseenDay = _ALL_ROUTES.filter(r => !done.has(`${r}-day`));
  if (unseenDay.length > 0) {
    parts.push(`${unseenDay.length} rut${unseenDay.length === 1 ? 'a' : 'e'}`);
  }

  if (!prestigeUnlocked) {
    parts.push('noćna vožnja');
  } else {
    const unseenNight = _ALL_ROUTES.filter(r => !done.has(`${r}-night`));
    if (unseenNight.length > 0) {
      parts.push(`${unseenNight.length} noćn${unseenNight.length === 1 ? 'a' : 'e'}`);
    }
  }

  return parts;
}
