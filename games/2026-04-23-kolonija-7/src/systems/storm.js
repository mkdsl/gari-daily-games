// src/systems/storm.js — Peskana bura: timer, telegraph sekvenca, damage, Zid interakcija

import { CONFIG } from '../config.js';
import { applyStormDamage } from './workers.js';

/**
 * @typedef {'MIRNO'|'TELEGRAPH'|'AKTIVNA'|'SMIRUJE_SE'} StormPhase
 */

/**
 * @typedef {{
 *   phase: StormPhase,
 *   timer: number,
 *   nextStormIn: number,
 *   telegraphProgress: number,
 *   intensity: number,
 *   stormCount: number
 * }} StormState
 */

/**
 * Kreira inicijalni storm state.
 * @returns {StormState}
 */
export function createStormState() {
  return {
    phase: 'MIRNO',
    timer: 0,
    nextStormIn: CONFIG.STORM_INTERVAL_SEC,
    telegraphProgress: 0,
    intensity: 0,
    stormCount: 0
  };
}

/**
 * Tick bure — ažurira fazu, timer, pokreće telegraph i damage.
 * Poziva se svaki frame iz updateSystems.
 * @param {import('../state.js').GameState} state
 * @param {number} dt - delta time u sekundama
 * @returns {void}
 */
export function tickStorm(state, dt) {
  const storm = state.storm;

  switch (storm.phase) {
    case 'MIRNO':
      storm.nextStormIn -= dt;
      if (storm.nextStormIn <= CONFIG.STORM_TELEGRAPH_SEC) {
        storm.phase = 'TELEGRAPH';
        storm.timer = CONFIG.STORM_TELEGRAPH_SEC;
        storm.telegraphProgress = 0;
      }
      break;

    case 'TELEGRAPH':
      storm.timer -= dt;
      // intensity raste od 0 ka 1 tokom telegraph-a
      storm.intensity = 1 - (storm.timer / CONFIG.STORM_TELEGRAPH_SEC);
      storm.telegraphProgress = storm.intensity;

      if (storm.timer <= 0) {
        storm.phase = 'AKTIVNA';
        storm.timer = CONFIG.STORM_ACTIVE_SEC;
        storm.intensity = 1.0;
        storm.telegraphProgress = 1.0;

        // Apliciraj damage pri prelasku u aktivnu fazu
        const damagePercent = calcStormDamage(storm.stormCount);
        const protection = getWallProtection(state);
        const finalDamage = damagePercent * (1 - protection);
        applyStormDamage(state, finalDamage);

        storm.stormCount++;

        // Screen shake
        state.screenShake = { timer: 0.5, intensity: 8 };
      }
      break;

    case 'AKTIVNA':
      storm.timer -= dt;
      storm.intensity = 1.0;
      if (storm.timer <= 0) {
        storm.phase = 'SMIRUJE_SE';
        storm.timer = CONFIG.STORM_CALM_SEC;
      }
      break;

    case 'SMIRUJE_SE':
      storm.timer -= dt;
      // intensity opada od 1 ka 0 tokom smirivanja
      storm.intensity = Math.max(0, storm.timer / CONFIG.STORM_CALM_SEC);
      storm.telegraphProgress = storm.intensity;

      if (storm.timer <= 0) {
        storm.phase = 'MIRNO';
        storm.nextStormIn = CONFIG.STORM_INTERVAL_SEC;
        storm.intensity = 0;
        storm.telegraphProgress = 0;
      }
      break;
  }
}

/**
 * Izračunava damage intenzitet bure na osnovu broja preživljenih bura (eskalacija).
 * @param {number} stormCount - koliko je bura prošlo dosad
 * @returns {number} - damagePercent 0.0–0.9
 */
export function calcStormDamage(stormCount) {
  return Math.min(0.9, CONFIG.STORM_DAMAGE_BASE + stormCount * CONFIG.STORM_DAMAGE_SCALE);
}

/**
 * Proverava da li ZID soba smanjuje damage bure i koliko.
 * @param {import('../state.js').GameState} state
 * @returns {number} - redukcija 0.0–1.0 (1.0 = potpuna zaštita)
 */
export function getWallProtection(state) {
  if (!state.rooms || state.rooms.length === 0) return 0;
  const walls = state.rooms.filter(r => r.type === 'ZID');
  if (walls.length === 0) return 0;
  const maxLevel = Math.max(...walls.map(r => r.level));
  return maxLevel >= 2 ? 1.0 : 0.6; // nivo 2 = potpuna zaštita, nivo 1 = 60% redukcija
}

/**
 * Vraća preostalo vreme do sledeće bure u sekundama (za HUD).
 * @param {import('../state.js').GameState} state
 * @returns {number}
 */
export function getTimeUntilStorm(state) {
  return Math.max(0, state.storm.nextStormIn);
}

/**
 * Vraća true ako je bura trenutno u telegraph ili aktivnoj fazi (za vizualni warning).
 * @param {import('../state.js').GameState} state
 * @returns {boolean}
 */
export function isStormWarning(state) {
  return state.storm.phase === 'TELEGRAPH' || state.storm.phase === 'AKTIVNA';
}
