/**
 * state.js — GameState management za Zimovnicu.
 * createInitialState, createPersistentState, saveGame, loadGame, resetRun.
 */

import { START_KASA } from './config.js';

const SAVE_KEY = 'zimovnica_v1';
const PERSISTENT_KEY = 'zimovnica_persistent_v1';

/**
 * Kreira fresh run state.
 * @param {object} persistent - Prestige carry-over podaci
 * @returns {object} Pun game state za novi run
 */
export function createInitialState(persistent = null) {
  const bonuses = persistent ? persistent.carry_bonuses : {};
  return {
    day: 1,
    slots: 4,
    sirovine: {
      paprike: 0,
      paradajz: 0,
      jabuke: 0,
      sljive: 0,
      krastavci: 0,
      bostanusa: 0,
      kupus: 0
    },
    tegle: [],           // [{type, qty, day_created, shelf_idx}]
    bačva_status: 'unsalted', // 'unsalted'|'critical_window'|'fermenting'|'ready'|'failed'
    bačva_days_remaining: 0,
    bačva_init_day: null,
    kasa: START_KASA + (bonuses.kasa_bonus || 0),
    passive_jobs: [],    // [{type, end_day, input_qty, recipe}]
    rakija_reserve_L: 0,
    today_events: [],
    tomorrow_weather: 'sunny',
    today_weather: 'sunny',
    prestige_active: !!(persistent && persistent.run_number > 1),
    prestige_bonuses: {
      recipe_efficiency: bonuses.recipe_efficiency || 1.0,
      market_unlocked: bonuses.market_unlocked || false,
      commander_bačva: bonuses.commander_bačva || false,
      extra_shelf: bonuses.extra_shelf || false,
    },
    run_number: persistent ? persistent.run_number : 1,
    shelf_level: bonuses.extra_shelf ? 1 : 0, // index into SHELF_UPGRADES
    harvest_done_today: false,
    game_over: false,
    ending: null,
    log: [],             // [{day, text, type}] type: 'info'|'warn'|'success'|'event'
    unlocks: {
      rakija: false,
      pijaca: bonuses.market_unlocked || false,
      medenjaci: false,
      sušene_šljive: false,
    }
  };
}

/**
 * Kreira persistent state koji preživljava reset između runova.
 * @returns {object} Persistent carry-over state
 */
export function createPersistentState() {
  return {
    run_number: 1,
    total_runs: 0,
    best_kasa: 0,
    best_jars: 0,
    endings_seen: [],     // array ending id-ova
    carry_bonuses: {
      kasa_bonus: 0,
      recipe_efficiency: 1.0,
      market_unlocked: false,
      commander_bačva: false,
      extra_shelf: false,
    },
    lifetime_stats: {
      total_jars_made: 0,
      total_kasa_earned: 0,
      bačva_successes: 0,
      bačva_failures: 0,
      rakija_L_total: 0,
    }
  };
}

/**
 * Snima trenutni state u localStorage.
 * @param {object} state - Game state
 * @param {object} persistent - Persistent state
 */
export function saveGame(state, persistent) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    localStorage.setItem(PERSISTENT_KEY, JSON.stringify(persistent));
  } catch (e) {
    // localStorage nije dostupan (private mode, quota)
    console.warn('Zimovnica: save failed', e);
  }
}

/**
 * Učitava state iz localStorage.
 * @returns {{ state: object, persistent: object } | null}
 */
export function loadGame() {
  try {
    const stateRaw = localStorage.getItem(SAVE_KEY);
    const persistentRaw = localStorage.getItem(PERSISTENT_KEY);
    if (!stateRaw || !persistentRaw) return null;
    const state = JSON.parse(stateRaw);
    const persistent = JSON.parse(persistentRaw);
    // Sanity check
    if (typeof state.day !== 'number') return null;
    return { state, persistent };
  } catch (e) {
    console.warn('Zimovnica: load failed', e);
    return null;
  }
}

/**
 * Briše save i kreira novi run uz prestige carry-over.
 * @param {object} persistent - Persistent state za novi run
 * @returns {object} Novi game state
 */
export function resetRun(persistent) {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) { /* ok */ }
  const updated = {
    ...persistent,
    run_number: (persistent.run_number || 1) + 1,
    total_runs: (persistent.total_runs || 0) + 1,
  };
  return { state: createInitialState(updated), persistent: updated };
}

/**
 * Briše sve save podatke (full reset bez prestige).
 */
export function clearAllSaves() {
  try {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(PERSISTENT_KEY);
  } catch (e) { /* ok */ }
}

/**
 * Dodaje log poruku u state.
 * @param {object} state
 * @param {string} text
 * @param {'info'|'warn'|'success'|'event'} type
 * @returns {object} Ažurirani state
 */
export function addLog(state, text, type = 'info') {
  const entry = { day: state.day, text, type };
  return {
    ...state,
    log: [...state.log.slice(-50), entry] // čuva poslednjih 50 poruka
  };
}

/**
 * Primenjuje završene passive jobs (fermentacija, sušenje).
 * Poziva se pri svakom advanceDay.
 * @param {object} state
 * @returns {object} Ažurirani state sa novim teglarama
 */
export function resolvePassiveJobs(state) {
  const done = state.passive_jobs.filter(j => j.end_day <= state.day);
  const active = state.passive_jobs.filter(j => j.end_day > state.day);

  let newTegle = [...state.tegle];
  let newLog = [...state.log];
  let newKasa = state.kasa;

  for (const job of done) {
    newTegle.push({
      type: job.recipe,
      qty: job.output_qty,
      day_created: state.day,
      shelf_idx: 0
    });
    newLog.push({
      day: state.day,
      text: `✅ ${job.recipe} gotov! +${job.output_qty.toFixed(1)} kg`,
      type: 'success'
    });
  }

  return {
    ...state,
    tegle: newTegle,
    passive_jobs: active,
    log: newLog.slice(-50),
    kasa: newKasa
  };
}
