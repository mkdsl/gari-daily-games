// src/state.js — Game state shape, save/load localStorage, prestige counter

import { CONFIG } from './config.js';

/**
 * @typedef {{
 *   version: number,
 *   started: number,
 *   gameOver: boolean,
 *   paused: boolean,
 *   metaWin: boolean,
 *   showPrestigeScreen: boolean,
 *   showRoomMenu: { col: number, row: number }|null,
 *   grid: import('./systems/grid.js').Cell[][],
 *   resources: { food: number, minerals: number },
 *   workers: import('./systems/workers.js').WorkerState,
 *   rooms: import('./systems/rooms.js').Room[],
 *   storm: import('./systems/storm.js').StormState,
 *   prestige: import('./systems/prestige.js').PrestigeState,
 *   particles: import('./systems/particles.js').Particle[],
 *   screenShake: { timer: number, intensity: number },
 *   camera: { x: number, y: number }
 * }} GameState
 */

/**
 * Kreira svež početni state (bez save-a).
 * Grid, workers, storm i prestige inicijalizuju se u main.js
 * pozivom factory funkcija iz sistema, jer state.js ne importuje sisteme
 * (da bi izbegao cirkularni import).
 * @returns {GameState}
 */
export function createState() {
  return {
    version: 1,
    started: Date.now(),
    gameOver: false,
    paused: false,
    metaWin: false,
    showPrestigeScreen: false,
    showRoomMenu: null,

    grid: [],                          // popunjava grid.generateGrid() u main.js
    resources: { food: 30, minerals: 10 },

    workers: {                         // popunjava workers.createWorkerState()
      count: CONFIG.WORKER_START,
      capacity: CONFIG.WORKER_CAP_BASE,
      collectTimer: 0,
      collectInterval: 1.0
    },

    rooms: [],                         // Room[] — popunjava rooms sistem

    storm: {                           // popunjava storm.createStormState()
      phase: 'MIRNO',
      timer: 0,
      nextStormIn: CONFIG.STORM_INTERVAL_SEC,
      telegraphProgress: 0,
      intensity: 0,
      stormCount: 0
    },

    prestige: {                        // popunjava prestige.createPrestigeState()
      count: 0,
      bonuses: [],
      metaWin: false
    },

    particles: [],                     // Particle[]

    screenShake: { timer: 0, intensity: 0 },
    camera: { x: 0, y: 0 }
  };
}

/**
 * Učitava state iz localStorage. Vraća null ako nema save-a ili je verzija pogrešna.
 * @returns {GameState|null}
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(CONFIG.SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Snima state u localStorage (poziva se periodično iz main.js).
 * Particles se ne snimaju — regenerišu se na sledeći frame.
 * @param {GameState} state
 */
export function saveState(state) {
  try {
    const toSave = { ...state, particles: [] };
    localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(toSave));
  } catch {
    // quota ili private mode — ignorišemo
  }
}

/**
 * Briše save iz localStorage (koristi se kod hard reset-a).
 */
export function resetState() {
  localStorage.removeItem(CONFIG.SAVE_KEY);
}
