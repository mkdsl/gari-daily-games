/**
 * main.js — Entry point za Zimovnicu. Wires game loop, screen management, action dispatch.
 */

import { createInitialState, createPersistentState, loadGame, saveGame, resetRun } from './state.js';
import { setupInput } from './input.js';
import { render } from './render.js';
import { initAudio } from './audio.js';
import { advanceDay } from './systems/time_system.js';

/** @type {object|null} */
let state = null;

/** @type {object|null} */
let persistent = null;

/** @type {'menu'|'game'|'event'|'ending'|'prestige'} */
let screen = 'menu';

/**
 * Getter za trenutni game state.
 * @returns {object|null}
 */
export function getState() { return state; }

/**
 * Getter za persistent state.
 * @returns {object|null}
 */
export function getPersistent() { return persistent; }

/**
 * Getter za trenutni screen.
 * @returns {string}
 */
export function getScreen() { return screen; }

/**
 * Postavlja screen i triggeruje re-render.
 * @param {'menu'|'game'|'event'|'ending'|'prestige'} s
 */
export function setScreen(s) {
  screen = s;
  renderFrame();
}

/** Triggeruje jedan render frejm. */
function renderFrame() {
  render(state, persistent, screen);
}

/**
 * Dispatcha akciju igrača. Procesira je kroz time_system.processAction.
 * @param {string} actionType - Tip akcije
 * @param {object} [params={}] - Parametri akcije
 */
export function handleAction(actionType, params = {}) {
  if (!state || state.game_over) return;

  import('./systems/time_system.js').then(({ processAction }) => {
    const result = processAction(state, persistent, actionType, params);
    if (result) {
      state = result.state;
      if (result.persistent) persistent = result.persistent;
      saveGame(state, persistent);
      if (actionType === 'event_choice' && (!state.today_events || state.today_events.length === 0)) {
        setScreen('game');
      } else {
        renderFrame();
      }
    }
  });
}

/**
 * Prelazi na sledeći dan. Procesira svo ticking (decay, fermentacija, događaji).
 */
export function nextDay() {
  if (!state || state.game_over) return;
  const result = advanceDay(state, persistent);
  state = result.state;
  if (result.persistent) persistent = result.persistent;
  saveGame(state, persistent);
  if (state.today_events && state.today_events.length > 0) {
    setScreen('event');
  } else {
    renderFrame();
  }
}

/**
 * Pokreće novi run. Poziva se sa prestige ekrana ili pri novoj igri.
 * @param {boolean} [withPrestige=false] - Da li se carry-over primenjuje
 */
export function startNewRun(withPrestige = false) {
  if (withPrestige && persistent) {
    const { state: newState, persistent: newPersistent } = resetRun(persistent);
    state = newState;
    persistent = newPersistent;
  } else {
    persistent = createPersistentState();
    state = createInitialState(persistent);
  }
  saveGame(state, persistent);
  screen = 'game';
  renderFrame();
}

/**
 * Inicijalizacija igre. Učitava save ili kreira novu igru.
 */
async function init() {
  // Pokušaj učitati sačuvanu igru
  const saved = loadGame();
  if (saved) {
    state = saved.state;
    persistent = saved.persistent;
    // Ako je igra završena, idi na ending screen
    screen = state.game_over ? 'ending' : 'game';
  } else {
    persistent = createPersistentState();
    state = createInitialState(persistent);
    screen = 'menu';
  }

  // Inicijalizuj subsisteme
  initAudio();
  setupInput();

  // Inicijalni render
  renderFrame();
}

// Entry point
document.addEventListener('DOMContentLoaded', init);
