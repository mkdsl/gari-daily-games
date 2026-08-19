// state.js — GameState shape, save/load

import { VIBE_START, SLOT_ROLES, SAVE_KEY_PERSISTENT, TUTORIAL_DONE_KEY } from './config.js';
import { createSlot } from './entities/slot.js';

/**
 * @typedef {Object} PersistentData
 * @property {number} completedRuns
 * @property {number[]} hallOfFame   - last 3 scores (newest first)
 */

/**
 * @typedef {Object} GameState
 * @property {import('./entities/card.js').Card[]} hand
 * @property {import('./entities/slot.js').Slot[]} slots
 * @property {import('./entities/card.js').Card[]} graveyard
 * @property {import('./entities/card.js').Card[]} deck
 * @property {number}  vibe_score
 * @property {number}  phase_index
 * @property {number}  completedRuns
 * @property {string}  eventType
 * @property {number}  churnCountThisRound
 * @property {string}  gamePhase  - 'menu'|'draw'|'assign'|'resolve'|'ending'
 * @property {boolean} isFirstRun
 * @property {number[]} hallOfFame
 * @property {boolean} crashed   - vibe reached 0 mid-game
 */

/**
 * Load only persistent cross-run data from localStorage.
 * @returns {PersistentData}
 */
export function loadPersistentState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY_PERSISTENT);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        completedRuns: parsed.completedRuns ?? 0,
        hallOfFame:    Array.isArray(parsed.hallOfFame) ? parsed.hallOfFame : []
      };
    }
  } catch {
    // ignore corrupt data
  }
  return { completedRuns: 0, hallOfFame: [] };
}

/**
 * Persist only the cross-run fields.
 * @param {GameState} state
 */
export function savePersistentState(state) {
  try {
    localStorage.setItem(SAVE_KEY_PERSISTENT, JSON.stringify({
      completedRuns: state.completedRuns,
      hallOfFame:    state.hallOfFame
    }));
  } catch {
    // quota exceeded — silently ignore
  }
}

/**
 * @param {string} eventType
 * @returns {GameState}
 */
export function createInitialState(eventType = 'klub') {
  const persistent = loadPersistentState();
  const tutorialDone = localStorage.getItem(TUTORIAL_DONE_KEY) === 'true';
  return {
    hand:               [],
    slots:              SLOT_ROLES.map(r => createSlot(r)),
    graveyard:          [],
    deck:               [],
    vibe_score:         VIBE_START,
    phase_index:        0,
    completedRuns:      persistent.completedRuns,
    eventType:          eventType,
    churnCountThisRound: 0,
    gamePhase:          'menu',
    isFirstRun:         !tutorialDone,
    hallOfFame:         persistent.hallOfFame,
    crashed:            false
  };
}

/**
 * Reset volatile game fields for a new run (keeps persistent data).
 * @param {GameState} state
 * @param {string} eventType
 */
export function resetForNewRun(state, eventType) {
  state.hand               = [];
  state.slots              = SLOT_ROLES.map(r => createSlot(r));
  state.graveyard          = [];
  state.deck               = [];
  state.vibe_score         = VIBE_START;
  state.phase_index        = 0;
  state.eventType          = eventType;
  state.churnCountThisRound = 0;
  state.gamePhase          = 'draw';
  state.crashed            = false;
}
