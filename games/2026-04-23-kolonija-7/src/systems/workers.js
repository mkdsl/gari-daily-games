// src/systems/workers.js — Radnice: auto-collect tick, rate formula, damage od bure

import { CONFIG } from '../config.js';

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
export function createWorkerState() {
  return {
    count: CONFIG.WORKER_START,
    capacity: CONFIG.WORKER_CAP_BASE,
    collectTimer: 0,
    collectInterval: 1.0
  };
}

/**
 * Tick radnica — prikuplja resurse automatski na osnovu broja radnica i soba.
 * Poziva se svaki frame iz updateSystems.
 * @param {import('../state.js').GameState} state
 * @param {number} dt - delta time u sekundama
 * @returns {void}
 */
export function tickWorkers(state, dt) {
  const bonuses = getPrestigeBonuses(state);
  const speedMult = bonuses.workerSpeedMult;
  const resourceMult = bonuses.resourceMult;

  // Lab sobe daju +10% resurse po ukupnom nivou
  const labBonus = getLabBonus(state);

  const foodGain = getCollectRate(state) * speedMult * resourceMult * labBonus * dt;
  const mineralGain = getMineralRate(state) * speedMult * resourceMult * labBonus * dt;

  const cap = state.resourceCap ?? CONFIG.RESOURCE_CAP_BASE;

  state.resources.food = Math.min(cap, state.resources.food + foodGain);
  state.resources.minerals = Math.min(cap, state.resources.minerals + mineralGain);
}

/**
 * Izračunava trenutni auto-collect rate (hrana/sec) na osnovu radnica i soba.
 * @param {import('../state.js').GameState} state
 * @returns {number}
 */
export function getCollectRate(state) {
  return state.workers.count * CONFIG.FOOD_BASE_RATE;
}

/**
 * Izračunava trenutni rate sakupljanja minerala (minerali/sec).
 * @param {import('../state.js').GameState} state
 * @returns {number}
 */
function getMineralRate(state) {
  return state.workers.count * CONFIG.MINERAL_BASE_RATE;
}

/**
 * Čita prestige bonuse iz state-a — vraća default ako prestige sistem nije inicijalizovan.
 * Direktno čita iz state.prestige.count da bi izbegao cirkularni import sa prestige.js.
 * @param {import('../state.js').GameState} state
 * @returns {{ workerSpeedMult: number, resourceMult: number }}
 */
function getPrestigeBonuses(state) {
  const bonuses = state.prestige?.bonuses ?? [];
  return {
    workerSpeedMult: bonuses.includes('BRZE_RADNICE') ? 1.5 : 1.0,
    resourceMult:    bonuses.includes('VISE_RESURSA') ? 1.2 : 1.0
  };
}

/**
 * Bonus od Lab soba — +10% resursi po ukupnom nivou Lab soba.
 * @param {import('../state.js').GameState} state
 * @returns {number}
 */
function getLabBonus(state) {
  if (!state.rooms || state.rooms.length === 0) return 1.0;
  const labLevels = state.rooms
    .filter(r => r.type === 'LAB')
    .reduce((sum, r) => sum + r.level, 0);
  return 1.0 + labLevels * 0.1;
}

/**
 * Primenjuje damage na radnice od peskane bure.
 * @param {import('../state.js').GameState} state
 * @param {number} damagePercent - 0.0–1.0, procenat radnica koje ginu
 * @returns {{ killed: number }}
 */
export function applyStormDamage(state, damagePercent) {
  const killed = Math.ceil(state.workers.count * damagePercent);
  state.workers.count = Math.max(0, state.workers.count - killed);
  if (state.workers.count <= 0) state.gameOver = true;
  return { killed };
}

/**
 * Dodaje nove radnice (kupovina ili prestige bonus).
 * @param {import('../state.js').GameState} state
 * @param {number} count
 * @returns {void}
 */
export function addWorkers(state, count) {
  state.workers.count = Math.min(state.workers.capacity, state.workers.count + count);
}

/**
 * Vraća trošak sledeće radnice u hrani (eksponencijalni rast).
 * @param {import('../state.js').GameState} state
 * @returns {number}
 */
export function getNextWorkerCost(state) {
  return Math.floor(CONFIG.WORKER_COST_BASE * Math.pow(CONFIG.WORKER_COST_GROWTH, state.workers.count));
}
