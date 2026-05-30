/**
 * state.js — Akva-Sklop
 * Game state management + localStorage persistence.
 */

import {
  DIFFICULTY,
  LS_KEY_CARDS,
  LS_KEY_RUNS,
  PLAN_TIMER_SEC,
  PH_DEFAULT,
  LAKE_A_ORIGIN,
  LAKE_B_ORIGIN,
  LAKE_C_ORIGIN,
} from './config.js';

const LS_SAVE_KEY = 'akvasklop_save';

/** @type {object} */
let _state = null;

function buildDefaultState(difficultyId, savedCards = [], runCount = 0) {
  const diff = DIFFICULTY[difficultyId] || DIFFICULTY['fazaA'];

  return {
    week: 1,
    phase: 'planning',
    ap: diff.apEarly,
    apTimer: PLAN_TIMER_SEC,
    difficulty: difficultyId,
    grid: [],
    lakes: {
      A: {
        level: 0,
        capacity: 0,
        pH: PH_DEFAULT,
        ducks: 0,
        fish: 0,
        fishHealth: 100,
        duckHealth: 100,
        x: LAKE_A_ORIGIN.col,
        y: LAKE_A_ORIGIN.row,
      },
      B: {
        level: 0,
        capacity: 0,
        pH: PH_DEFAULT,
        ducks: 0,
        fish: 0,
        fishHealth: 100,
        duckHealth: 100,
        x: LAKE_B_ORIGIN.col,
        y: LAKE_B_ORIGIN.row,
      },
      C: {
        level: 0,
        capacity: 0,
        pH: PH_DEFAULT,
        ducks: 0,
        fish: 0,
        fishHealth: 100,
        duckHealth: 100,
        x: LAKE_C_ORIGIN.col,
        y: LAKE_C_ORIGIN.row,
      },
    },
    source: { rate: diff.sourceRate },
    weeklyScores: [],
    events: [],
    activeEvent: null,
    selectedTile: null,
    unlockedCards: savedCards,
    runCount: runCount,
    finalScore: null,
  };
}

/**
 * Initialize state for a new run.
 * @param {string} difficulty
 * @param {number[]} savedCards  — array of card ids already unlocked
 * @returns {object} the new state
 */
export function initState(difficulty = 'fazaA', savedCards = []) {
  const diff = DIFFICULTY[difficulty] || DIFFICULTY['fazaA'];
  _state = buildDefaultState(difficulty, savedCards);

  // Populate starting species according to difficulty
  if (difficulty === 'faza0') {
    _state.lakes.B.ducks = diff.startDucks;
    _state.lakes.B.fish  = diff.startFish;
  } else if (difficulty === 'fazaA') {
    _state.lakes.A.fish  = diff.startFish;
    _state.lakes.B.ducks = Math.floor(diff.startDucks / 2);
    _state.lakes.C.ducks = diff.startDucks - Math.floor(diff.startDucks / 2);
  } else if (difficulty === 'fazaB') {
    _state.lakes.A.fish  = Math.floor(diff.startFish / 2);
    _state.lakes.B.fish  = diff.startFish - Math.floor(diff.startFish / 2);
    const ducksPerLake = Math.floor(diff.startDucks / 3);
    _state.lakes.A.ducks = ducksPerLake;
    _state.lakes.B.ducks = ducksPerLake;
    _state.lakes.C.ducks = diff.startDucks - ducksPerLake * 2;
  }

  return _state;
}

/**
 * Returns the current state object (by reference — mutate carefully).
 * @returns {object}
 */
export function getState() {
  if (!_state) {
    throw new Error('State not initialized. Call initState() first.');
  }
  return _state;
}

/**
 * Shallow-merge updates into state.
 * @param {object} updates
 */
export function setState(updates) {
  if (!_state) {
    throw new Error('State not initialized. Call initState() first.');
  }
  _state = Object.assign(_state, updates);
}

/**
 * Persist current state to localStorage.
 */
export function saveToStorage() {
  if (!_state) return;
  try {
    const payload = {
      runCount:      _state.runCount,
      unlockedCards: _state.unlockedCards,
      week:          _state.week,
      weeklyScores:  _state.weeklyScores,
      difficulty:    _state.difficulty,
    };
    localStorage.setItem(LS_SAVE_KEY, JSON.stringify(payload));
    localStorage.setItem(LS_KEY_RUNS,  String(_state.runCount));
    localStorage.setItem(LS_KEY_CARDS, JSON.stringify(_state.unlockedCards));
  } catch (e) {
    console.warn('[state] saveToStorage failed:', e);
  }
}

/**
 * Load persistent data from localStorage.
 * @returns {{ savedCards: number[], runCount: number }}
 */
export function loadFromStorage() {
  try {
    const raw = localStorage.getItem(LS_SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        savedCards: Array.isArray(parsed.unlockedCards) ? parsed.unlockedCards : [],
        runCount:   typeof parsed.runCount === 'number' ? parsed.runCount : 0,
      };
    }
    // Fallback: try individual keys
    const cardsRaw = localStorage.getItem(LS_KEY_CARDS);
    const runsRaw  = localStorage.getItem(LS_KEY_RUNS);
    return {
      savedCards: cardsRaw ? JSON.parse(cardsRaw) : [],
      runCount:   runsRaw  ? parseInt(runsRaw, 10) : 0,
    };
  } catch (e) {
    console.warn('[state] loadFromStorage failed:', e);
    return { savedCards: [], runCount: 0 };
  }
}

/**
 * Reset state for a fresh run (keeps persistent progress).
 * @param {string} difficulty
 */
export function resetState(difficulty = 'fazaA') {
  const { savedCards, runCount } = loadFromStorage();
  return initState(difficulty, savedCards, runCount);
}
