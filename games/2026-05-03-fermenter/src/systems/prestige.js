/**
 * @file systems/prestige.js
 * Fermenter — Varenički Bunt
 * Prestiže sistem: provjera uslova, reset i primjena mutacije.
 */

import { CONFIG } from '../config.js';
import { computeDerivedStats } from '../state.js';
import { applyMutation } from './mutations.js';

/**
 * Provjeri da li su ispunjeni uslovi za prestiže (pressure >= 100).
 * @param {GameState} state
 * @returns {boolean}
 */
export function canPrestige(state) {
  return state.pressure >= CONFIG.MAX_PRESSURE;
}

/**
 * Izvrši prestiže:
 * 1. Primijeni odabranu mutaciju (trajno, preživljava reset)
 * 2. Inkrementiraj prestigeCount
 * 3. Resetuj run-specifičan state (SJ, FJ, upgrades, pressure)
 * 4. Primijeni M4 head start ako je aktivan
 * 5. Rekalkuliši izvedene statistike
 *
 * @param {GameState} state — mutira se in-place
 * @param {string} mutationId — ID mutacije koju igrač bira
 */
export function doPrestige(state, mutationId) {
  // 1. Primijeni mutaciju PRIJE reseta da bi computeDerivedStats
  //    u applyMutation vidio tačno stanje mutacija
  applyMutation(state, mutationId);

  // 2. Inkrementiraj prestiže brojač
  state.prestigeCount++;

  // 3. Resetuj run-specifičan state
  state.sj = 0;
  state.fj = 0;
  state.upgrades = {};
  state.pressure = 0;
  state.degradationFactor = 1.0;
  state.isDegraded = false;
  state.lastActivityTime = Date.now();

  // 4. M4 Micelarna Mreža — head start narednih N sekundi
  if (state.activeMutations.includes('M4')) {
    state.mutationState.headStartRemaining = CONFIG.HEAD_START_DURATION;
  }

  // 5. Rekalkuliši izvedene statistike na osnovu novih mutacija
  computeDerivedStats(state);
}

/**
 * Provjeri da li je igrač dostigao win state (3 prestiže).
 * @param {GameState} state
 * @returns {boolean}
 */
export function checkWinState(state) {
  return state.prestigeCount >= CONFIG.MAX_PRESTIGES;
}
