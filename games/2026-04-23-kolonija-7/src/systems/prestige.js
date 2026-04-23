// src/systems/prestige.js — Prestige trigger, reset, bonus selekcija, meta win check

import { CONFIG } from '../config.js';
import { generateGrid } from './grid.js';
import { createWorkerState } from './workers.js';
import { createStormState } from './storm.js';

/**
 * @typedef {'BRZE_RADNICE'|'JACI_ZID'|'VISE_RESURSA'|'BRZE_KOPANJE'} PrestigeBonus
 */

/**
 * @typedef {{
 *   count: number,
 *   bonuses: PrestigeBonus[],
 *   metaWin: boolean
 * }} PrestigeState
 */

const ALL_BONUSES = ['BRZE_RADNICE', 'JACI_ZID', 'VISE_RESURSA', 'BRZE_KOPANJE'];

/**
 * Kreira inicijalni prestige state.
 * @returns {PrestigeState}
 */
export function createPrestigeState() {
  return { count: 0, bonuses: [], metaWin: false };
}

/**
 * Proverava da li su ispunjeni uslovi za prestige (kristal pronađen — trigger iz grida).
 * @param {import('../state.js').GameState} state
 * @returns {boolean}
 */
export function canPrestige(state) {
  return state.showPrestigeScreen === true;
}

/**
 * Izvršava prestige reset — čuva bonuse, resetuje grid/resurse/radnice/buru.
 * @param {import('../state.js').GameState} state
 * @param {PrestigeBonus} chosenBonus
 * @returns {void}
 */
export function doPrestige(state, chosenBonus) {
  // 1. Dodaj bonus i inkrementiraj brojač
  state.prestige.bonuses.push(chosenBonus);
  state.prestige.count++;

  // 2. Reset grid/resources/workers/rooms/storm/particles
  state.grid = generateGrid(CONFIG.GRID_COLS, CONFIG.GRID_ROWS);
  state.resources = { food: 30, minerals: 10 };
  state.workers = createWorkerState();
  state.rooms = [];
  state.resourceCap = CONFIG.RESOURCE_CAP_BASE;
  state.storm = createStormState();
  state.particles = [];

  // 3. Primeni start bonuse
  if (state.prestige.bonuses.includes('VISE_RESURSA')) {
    state.resources.food = 80;
    state.resources.minerals = 30;
  }
  // BRZE_RADNICE se primenjuje u tickWorkers kroz getPrestigeBonuses()

  // 4. Zatvori overlay
  state.showPrestigeScreen = false;
  state._pendingRoom = null;

  // 5. Proveri meta win
  if (state.prestige.count >= CONFIG.PRESTIGE_META_WIN_COUNT) {
    state.metaWin = true;
    state.prestige.metaWin = true;
  }
}

/**
 * Vraća do 3 random bonus opcije koje igrač još nije uzeo.
 * @param {import('../state.js').GameState} state
 * @returns {PrestigeBonus[]}
 */
export function getPrestigeOptions(state) {
  const notTaken = ALL_BONUSES.filter(b => !state.prestige.bonuses.includes(b));
  // Fisher-Yates shuffle pa slice
  for (let i = notTaken.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [notTaken[i], notTaken[j]] = [notTaken[j], notTaken[i]];
  }
  return notTaken.slice(0, 3);
}

/**
 * Proverava da li je igrač ispunio uslov za meta win.
 * @param {import('../state.js').GameState} state
 * @returns {boolean}
 */
export function checkMetaWin(state) {
  return state.prestige.count >= CONFIG.PRESTIGE_META_WIN_COUNT;
}

/**
 * Vraća aktivne prestige multiplikatore na osnovu skupljenih bonusa.
 * @param {import('../state.js').GameState} state
 * @returns {{ workerSpeedMult: number, wallBonus: number, resourceMult: number, digSpeedMult: number }}
 */
export function getPrestigeBonuses(state) {
  return {
    workerSpeedMult: state.prestige.bonuses.includes('BRZE_RADNICE') ? 1.5 : 1.0,
    wallBonus:       state.prestige.bonuses.includes('JACI_ZID')     ? 0.3 : 0.0,
    resourceMult:    state.prestige.bonuses.includes('VISE_RESURSA') ? 1.2 : 1.0,
    digSpeedMult:    state.prestige.bonuses.includes('BRZE_KOPANJE') ? 1.5 : 1.0
  };
}
