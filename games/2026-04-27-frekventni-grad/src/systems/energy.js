/**
 * @file energy.js
 * @description Energy bar sistem — primenjuje deltase i proverava game over uslov.
 *
 * Energy se menja posle svakog udara (PERFECT/GOOD/MISS).
 * Deltasi su definisani u CONFIG.ENERGY_DELTA_*.
 * Ako energy padne na 0 ili ispod → game over.
 *
 * @module systems/energy
 */

import { CONFIG } from '../config.js';

/**
 * Primenjuje energy deltu odgovarajuću datom rezultatu udara.
 * Clampa energy na [0, CONFIG.ENERGY_MAX].
 * Menja state.energy in-place.
 *
 * @param {import('../state.js').GameState} state
 * @param {'PERFECT'|'GOOD'|'MISS'} result
 * @returns {void}
 */
export function applyEnergyDelta(state, result) {
  const delta = result === 'PERFECT' ? CONFIG.ENERGY_DELTA_PERFECT
              : result === 'GOOD'    ? CONFIG.ENERGY_DELTA_GOOD
              :                        CONFIG.ENERGY_DELTA_MISS;
  state.energy = Math.max(0, Math.min(CONFIG.ENERGY_MAX, state.energy + delta));
}

/**
 * Proverava da li je game over uslov ispunjen (energy <= 0).
 * Ako jeste, setuje state.gamePhase = 'game_over'.
 *
 * @param {import('../state.js').GameState} state
 * @returns {boolean} true ako je game over upravo nastao
 */
export function checkGameOver(state) {
  if (state.energy <= 0 && state.gamePhase === 'playing') {
    state.gamePhase = 'game_over';
    return true;
  }
  return false;
}

/**
 * Resetuje energy na CONFIG.ENERGY_START za početak nove noći/pesme.
 *
 * @param {import('../state.js').GameState} state
 * @returns {void}
 */
export function resetEnergy(state) {
  state.energy = CONFIG.ENERGY_START;
}
