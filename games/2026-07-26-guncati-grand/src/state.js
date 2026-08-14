/** @fileoverview Game state shape, save/load via localStorage, state migration */

import { CONFIG } from './config.js';

/**
 * @typedef {Object} GameState
 * @property {string} screen
 * @property {number} week
 * @property {number} gcBalance
 * @property {number} totalRevenue
 * @property {Object} buildings
 * @property {number} buildingUpgradesThisWeek
 * @property {Object} allocation
 * @property {Array} volunteers
 * @property {number[]} weeklyWB
 * @property {number} currentWB
 * @property {number} seasonMarketingSpent
 * @property {number} seasonCrowdCap
 * @property {number} seasonTicketRate
 * @property {Object} finale
 * @property {boolean} isPrestige
 * @property {number} reputation
 * @property {number} prestigeRuns
 * @property {number|null} finalScore
 * @property {string[]} achievements
 */

/** @returns {GameState} */
export function createInitialState() {
  return {
    screen: 'MENU',
    week: 1,
    gcBalance: CONFIG.WEEKLY_BUDGET,
    totalRevenue: 0,

    buildings: { pozornica: 0, wc: 0, satre: 0, bar: 0, parking: 0 },
    buildingUpgradesThisWeek: 0,

    allocation: { gradnja: 0, hrana: 0, marketing: 0, zajednica: 0 },
    allocationLocked: false,

    // Volunteer roster
    volunteers: [],
    volunteerAssignments: {}, // { volunteerId: taskId }

    // WB tracking
    weeklyWB: [],
    currentWB: 50,
    seasonMarketingSpent: 0,
    seasonCrowdCap: CONFIG.CROWD_BASE,
    seasonTicketRate: CONFIG.TICKET_RATE_BASE,
    crowdSize: CONFIG.CROWD_BASE,

    // Weekly results log
    weeklyResults: [],

    // Finale state
    finale: {
      active: false,
      elapsed: 0,
      crowdMood: CONFIG.FINALE_BASE_MOOD,
      crowdCurrent: CONFIG.CROWD_BASE,
      crowdCap: CONFIG.CROWD_BASE,
      djHype: 50,
      currentSlot: 0,
      totalSlots: 1,
      revenue: 0,
      triggeredEvents: [],
      pendingEvent: null,
      pendingTransition: false,
      transitionWindowStart: null,
      lastTickTime: null
    },

    // Onboarding
    onboardingStep: 0,
    onboardingComplete: false,

    // Prestige
    isPrestige: false,
    reputation: 0,
    prestigeRuns: 0,

    // Score
    finalScore: null,
    scoreBreakdown: null,
    achievements: [],

    // Season tracking (for community vibe calc: WB nedelje 7-10)
    communityVibeAvg: 0
  };
}

/** @type {GameState} */
let _state = createInitialState();

/** @returns {GameState} */
export function getState() {
  return _state;
}

/**
 * @param {Partial<GameState>} patch
 */
export function setState(patch) {
  _state = deepMerge(_state, patch);
}

/**
 * @param {string} path - dot-separated key path e.g. 'finale.elapsed'
 * @param {*} value
 */
export function setField(path, value) {
  const keys = path.split('.');
  let obj = _state;
  for (let i = 0; i < keys.length - 1; i++) {
    if (obj[keys[i]] === undefined || obj[keys[i]] === null) {
      obj[keys[i]] = {};
    }
    obj = obj[keys[i]];
  }
  obj[keys[keys.length - 1]] = value;
}

/**
 * Deep merge helper
 * @param {Object} target
 * @param {Object} source
 * @returns {Object}
 */
function deepMerge(target, source) {
  const result = Object.assign({}, target);
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] !== null &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

/** Save state to localStorage */
export function saveState() {
  try {
    const toSave = JSON.parse(JSON.stringify(_state));
    // Don't save active finale loop state
    toSave.finale.active = false;
    toSave.finale.lastTickTime = null;
    localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify({
      version: 1,
      timestamp: Date.now(),
      state: toSave
    }));
  } catch (e) {
    console.warn('Save failed:', e);
  }
}

/** Load state from localStorage. Returns true if loaded successfully. */
export function loadState() {
  try {
    const raw = localStorage.getItem(CONFIG.SAVE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.state) return false;
    // Migrate if needed
    const loaded = migrateState(parsed.state, parsed.version || 1);
    _state = deepMerge(createInitialState(), loaded);
    // Force safe screen on load
    if (_state.screen === 'FINALE' || _state.screen === 'MACRO' || _state.screen === 'MICRO') {
      // Keep screen, user can navigate
    }
    return true;
  } catch (e) {
    console.warn('Load failed:', e);
    return false;
  }
}

/** Clear saved state */
export function clearSave() {
  localStorage.removeItem(CONFIG.SAVE_KEY);
  _state = createInitialState();
}

/**
 * @param {Object} state
 * @param {number} version
 * @returns {Object}
 */
function migrateState(state, version) {
  // Future migrations go here
  return state;
}

/** Reset state for prestige (Stara Šaraga mode) */
export function prestigeReset() {
  const prev = _state;
  const newState = createInitialState();
  newState.screen = 'MENU';
  newState.isPrestige = true;
  newState.reputation = prev.reputation;
  newState.prestigeRuns = prev.prestigeRuns + 1;
  // Keep one volunteer with memory
  if (prev.volunteers.length > 0) {
    const keeper = { ...prev.volunteers[0], hasMemory: true, memoryWeeks: 2 };
    newState.volunteers = [keeper];
  }
  // Prestige bonuses
  if (prev.reputation >= 70) {
    newState.gcBalance = 550;
  }
  _state = newState;
}
