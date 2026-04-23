// src/systems/storm.js — Peskana bura: timer, telegraph sekvenca, damage, Zid interakcija

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
export function createStormState() {}

/**
 * Tick bure — ažurira fazu, timer, pokreće telegraph i damage.
 * Poziva se svaki frame iz updateSystems.
 * @param {import('../state.js').GameState} state
 * @param {number} dt - delta time u sekundama
 * @returns {void}
 */
export function tickStorm(state, dt) {}

/**
 * Izračunava damage intenzitet bure na osnovu broja preživljenih bura (eskalacija).
 * @param {number} stormCount - koliko je bura prošlo dosad
 * @returns {number} - damagePercent 0.0–1.0
 */
export function calcStormDamage(stormCount) {}

/**
 * Proverava da li ZID soba smanjuje damage bure i koliko.
 * @param {import('../state.js').GameState} state
 * @returns {number} - redukcija 0.0–1.0 (1.0 = potpuna zaštita)
 */
export function getWallProtection(state) {}

/**
 * Vraća preostalo vreme do sledeće bure u sekundama (za HUD).
 * @param {import('../state.js').GameState} state
 * @returns {number}
 */
export function getTimeUntilStorm(state) {}

/**
 * Vraća true ako je bura trenutno u telegraph ili aktivnoj fazi (za vizualni warning).
 * @param {import('../state.js').GameState} state
 * @returns {boolean}
 */
export function isStormWarning(state) {}
