import { CONFIG } from './config.js';
import { revealAll } from './grid.js';
import { sfxPowerup } from './audio.js';
import { initLevel } from './signal.js';

/**
 * @typedef {import('./state.js').GameState} GameState
 * @typedef {import('./state.js').ActivePowerup} ActivePowerup
 */

/** All power-up ids available in the pool */
const ALL_POWERUP_IDS = Object.keys(CONFIG.POWERUPS);

/**
 * Generate a random offer of 3 distinct power-up ids for the player to choose from.
 * Weights can be added here later (all equal for now).
 * Stores the offer in state.powerupOffer so ui.js can render the choice screen.
 * @param {GameState} state
 */
export function generatePowerupOffer(state) {
  const shuffled = _shuffle(ALL_POWERUP_IDS.slice());
  state.powerupOffer = shuffled.slice(0, 3);
}

/**
 * Player picks a power-up from the offer screen.
 * Adds it to state.heldPowerups, clears the offer, advances to the next level.
 * @param {GameState} state
 * @param {string} powerupId - one of CONFIG.POWERUPS keys
 */
export function pickPowerup(state, powerupId) {
  if (!CONFIG.POWERUPS[powerupId]) return;

  // Add to held power-ups; enforce max 3 (drop oldest if over)
  if (state.heldPowerups.length >= 3) {
    state.heldPowerups.shift(); // drop oldest
  }
  state.heldPowerups.push(powerupId);

  sfxPowerup(powerupId);

  state.powerupOffer = [];
  state.screen = 'game';

  // Init the next level (level was already incremented by _levelClear in signal.js)
  initLevel(state);
}

/**
 * Activate a held power-up.
 * Moves it from heldPowerups to activePowerups with full duration set.
 * Handles ECHO doubling the next activated power-up's duration.
 * @param {GameState} state
 * @param {string} powerupId
 */
export function activatePowerup(state, powerupId) {
  const idx = state.heldPowerups.indexOf(powerupId);
  if (idx === -1) return;

  state.heldPowerups.splice(idx, 1);

  const def = CONFIG.POWERUPS[powerupId];
  if (!def) return;

  let durationMultiplier = 1;

  // Check for active ECHO power-up
  const echoIdx = state.activePowerups.findIndex(ap => ap.id === 'ECHO');
  if (echoIdx !== -1 && powerupId !== 'ECHO') {
    durationMultiplier = 2;
    state.activePowerups.splice(echoIdx, 1); // consume ECHO
  }

  /** @type {ActivePowerup} */
  const active = { id: powerupId, remainingSec: -1, remainingNodes: -1 };

  if (def.durationSec !== undefined) {
    active.remainingSec = def.durationSec * durationMultiplier;
  }
  if (def.durationNodes !== undefined) {
    active.remainingNodes = def.durationNodes * durationMultiplier;
  }
  if (def.bonusMs !== undefined) {
    // SLOW_SIGNAL is node-based
    active.remainingNodes = def.durationNodes * durationMultiplier;
  }

  state.activePowerups.push(active);
  sfxPowerup(powerupId);

  // REVEAL triggers immediately (not tick-based)
  if (powerupId === 'REVEAL') {
    _applyReveal(state, def.durationSec * durationMultiplier);
  }
}

/**
 * Tick all active power-ups each frame.
 * Decrements time/node counters and removes expired ones.
 * Called from main.js game loop.
 * @param {GameState} state
 * @param {number} dt - seconds since last frame
 */
export function applyPowerupTick(state, dt) {
  if (!state.activePowerups || state.activePowerups.length === 0) return;

  state.activePowerups = state.activePowerups.filter(ap => {
    if (ap.remainingSec > 0) {
      ap.remainingSec -= dt;
      return ap.remainingSec > 0;
    }
    // node-based power-ups (remainingNodes) are decremented by signal.js on each step
    if (ap.remainingNodes > 0) return true;
    if (ap.remainingNodes === -1 && ap.remainingSec === -1) {
      // Instant / one-shot (ECHO): stays until consumed by activatePowerup
      return true;
    }
    return false;
  });
}

/**
 * Notify the power-up system that the signal has stepped to a new node.
 * Decrements node-based power-up counters (SLOW_SIGNAL, ECHO).
 * @param {GameState} state
 */
export function onSignalStep(state) {
  for (const ap of state.activePowerups) {
    if (ap.remainingNodes > 0) {
      ap.remainingNodes -= 1;
    }
  }
}

/**
 * Check if a specific power-up is currently active.
 * @param {GameState} state
 * @param {string} powerupId
 * @returns {boolean}
 */
export function isPowerupActive(state, powerupId) {
  return state.activePowerups.some(ap => {
    if (ap.id !== powerupId) return false;
    if (ap.remainingSec > 0) return true;
    if (ap.remainingNodes > 0) return true;
    return false;
  });
}

/**
 * Reset all power-up state (called on death/restart).
 * @param {GameState} state
 */
export function resetPowerups(state) {
  state.activePowerups = [];
  state.heldPowerups   = [];
  state.powerupOffer   = [];
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Apply the REVEAL power-up: temporarily show all hidden nodes.
 * Schedules re-hiding after durationSec using a timeout.
 * @param {GameState} state
 * @param {number} durationSec
 */
function _applyReveal(state, durationSec) {
  // Call revealAll which returns the cleanup function
  const cleanup = revealAll(state.grid, state.level);
  // Schedule the re-hide after the duration
  setTimeout(cleanup, durationSec * 1000);
}

/**
 * In-place Fisher-Yates shuffle.
 * @template T
 * @param {T[]} arr
 * @returns {T[]}
 */
function _shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
