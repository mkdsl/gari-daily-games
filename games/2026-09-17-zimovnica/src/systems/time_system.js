/**
 * time_system.js — Day advancement, action slot deduction, passive timer tick.
 * Centralna tačka za sve promene state-a.
 */

import { SLOTS_PER_DAY, GAME_DAYS, BARREL_WINDOW_DAYS } from '../config.js';
import { applyDecay } from '../entities/ingredient.js';
import { partitionJobs, createBatchJob } from '../entities/batchjob.js';
import { createJar } from '../entities/jar.js';
import { addLog, resolvePassiveJobs } from '../state.js';
import { generateWeather } from './weather.js';
import { drawDailyEvents } from './event_engine.js';
import { tickBacva } from './barrel_init.js';
import { checkProgressionUnlocks } from './progression.js';
import { checkEnding } from './prestige.js';

/**
 * Prelazi na sledeći dan. Tikuje sve sisteme.
 * @param {object} state
 * @param {object} persistent
 * @returns {{ state: object, persistent: object }}
 */
export function advanceDay(state, persistent) {
  if (state.game_over || state.day >= GAME_DAYS) {
    return endGame(state, persistent);
  }

  let s = { ...state };

  // 1. Tikuj bačvu
  s = tickBacva(s);

  // 2. Passive jobs — završeni poslovi daju tegle
  s = resolvePassiveJobs(s);

  // 3. Decay sirovine
  const { sirovine: decayed_sirovine, decayed } = applyDecay(s.sirovine, s.today_weather);
  s = { ...s, sirovine: decayed_sirovine };

  // Log decay
  for (const [id, loss] of Object.entries(decayed)) {
    if (loss >= 1) {
      s = addLog(s, `⚠️ ${id}: -${loss.toFixed(1)} kg propalo`, 'warn');
    }
  }

  // 4. Pređi na sledeći dan
  s = { ...s, day: s.day + 1, slots: SLOTS_PER_DAY, harvest_done_today: false };

  // 5. Vreme za novi dan
  const { today, tomorrow } = generateWeather(s.tomorrow_weather);
  s = { ...s, today_weather: today, tomorrow_weather: tomorrow };

  // 6. Unlock check
  s = checkProgressionUnlocks(s);

  // 7. Generiši dnevne događaje
  const events = drawDailyEvents(s);
  s = { ...s, today_events: events };

  // 8. Bačva critical window check
  if (s.day <= BARREL_WINDOW_DAYS && s.bačva_status === 'unsalted') {
    s = { ...s, bačva_status: 'critical_window' };
    s = addLog(s, '🪣 Prozor za bačvu još otvoren!', 'warn');
  } else if (s.day > BARREL_WINDOW_DAYS + 1 && s.bačva_status === 'unsalted') {
    s = { ...s, bačva_status: 'failed' };
    s = addLog(s, '💀 Bačva — inicijacioni prozor propušten!', 'error');
  }

  // 9. Zadnji dan?
  if (s.day > GAME_DAYS) {
    return endGame(s, persistent);
  }

  return { state: s, persistent };
}

/**
 * Procesira jednu akciju igrača (kuvanje, berba, prodaja...).
 * @param {object} state
 * @param {object} persistent
 * @param {string} actionType
 * @param {object} params
 * @returns {{ state: object, persistent?: object } | null}
 */
export function processAction(state, persistent, actionType, params) {
  if (state.slots <= 0) return null;

  switch (actionType) {
    case 'berba':     return actionBerba(state, persistent, params);
    case 'kuvanje':   return actionKuvanje(state, persistent, params);
    case 'bacva_init': return actionBacvaInit(state, persistent, params);
    case 'prodaja':   return actionProdaja(state, persistent, params);
    case 'kupovina':  return actionKupovina(state, persistent, params);
    case 'shelf_upgrade': return actionShelfUpgrade(state, persistent, params);
    default:          return null;
  }
}

/** @param {object} state @param {object} persistent @param {object} params */
function actionBerba(state, persistent, params) { return { state, persistent }; }

/** @param {object} state @param {object} persistent @param {object} params */
function actionKuvanje(state, persistent, params) { return { state, persistent }; }

/** @param {object} state @param {object} persistent @param {object} params */
function actionBacvaInit(state, persistent, params) { return { state, persistent }; }

/** @param {object} state @param {object} persistent @param {object} params */
function actionProdaja(state, persistent, params) { return { state, persistent }; }

/** @param {object} state @param {object} persistent @param {object} params */
function actionKupovina(state, persistent, params) { return { state, persistent }; }

/** @param {object} state @param {object} persistent @param {object} params */
function actionShelfUpgrade(state, persistent, params) { return { state, persistent }; }

/**
 * Završava igru i određuje ending.
 * @param {object} state
 * @param {object} persistent
 * @returns {{ state: object, persistent: object }}
 */
function endGame(state, persistent) {
  const ending = checkEnding(state, persistent);
  const s = { ...state, game_over: true, ending };
  return { state: s, persistent };
}
