// src/systems/workers.js — Radnice: auto-collect tick, rate formula, damage od bure

/**
 * @typedef {{
 *   count: number,
 *   capacity: number,
 *   collectTimer: number,
 *   collectInterval: number
 * }} WorkerState
 */

/**
 * Kreira inicijalni worker state.
 * @returns {WorkerState}
 */
export function createWorkerState() {}

/**
 * Tick radnica — prikuplja resurse automatski na osnovu broja radnica i soba.
 * Poziva se svaki frame iz updateSystems.
 * @param {import('../state.js').GameState} state
 * @param {number} dt - delta time u sekundama
 * @returns {void}
 */
export function tickWorkers(state, dt) {}

/**
 * Izračunava trenutni auto-collect rate (hrana/sec) na osnovu radnica i soba.
 * @param {import('../state.js').GameState} state
 * @returns {number}
 */
export function getCollectRate(state) {}

/**
 * Primenjuje damage na radnice od peskane bure.
 * @param {import('../state.js').GameState} state
 * @param {number} damagePercent - 0.0–1.0, procenat radnica koje ginu
 * @returns {{ killed: number }}
 */
export function applyStormDamage(state, damagePercent) {}

/**
 * Dodaje nove radnice (kupovina ili prestige bonus).
 * @param {import('../state.js').GameState} state
 * @param {number} count
 * @returns {void}
 */
export function addWorkers(state, count) {}

/**
 * Vraća trošak sledeće radnice u hrani.
 * @param {import('../state.js').GameState} state
 * @returns {number}
 */
export function getNextWorkerCost(state) {}
