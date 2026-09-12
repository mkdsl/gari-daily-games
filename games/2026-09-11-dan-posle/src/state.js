/**
 * state.js — Game state shape, save/load iz localStorage
 */

import { RESOURCES, STORAGE_KEYS, HOURS } from './config.js';

/** @returns {GameState} Inicijalni state */
export function createInitialState(isPrestige = false) {
  return {
    // Resursi
    resources: {
      energija: RESOURCES.energija.start,
      veze:     RESOURCES.veze.start,
      secanja:  RESOURCES.secanja.start,
      nered:    RESOURCES.nered.start
    },
    // Sat koji se trenutno igra (index u HOURS nizu)
    currentHourIndex: 0,
    // Koji nodovi su videni (ID noda)
    seenNodes: [],
    // Koje opcije su izabrane (option ID → true)
    chosenOptions: {},
    // Toma tracking: koje N[x]A opcije su izabrane
    tomaChoicesA: [],
    // Achievement tracking: privremene vrednosti
    achievements: {
      earned: [],
      // za A6: prati da li je ko uzeo V+2 helpOptions
      usedV2Help: false,
      // za A2: sve toma A-ce
      allTomaA: false
    },
    // Da li je igra završena
    gameOver: false,
    endingId: null,
    // Prestige run
    isPrestige: isPrestige,
    prestigeCount: 0,
    // Timestamp
    startedAt: Date.now(),
    // Aktivni nod (trenutno prikazan)
    activeNodeId: null,
    // Efekti animacije (delta prikaz)
    pendingDeltas: null,
    // Da li je audio inicijalizovan
    audioStarted: false
  };
}

/**
 * Izračunaj Community Score
 * CS = Veze + Sećanja − (Nered / 2)
 * @param {GameState} state
 * @returns {number}
 */
export function computeCS(state) {
  const { veze, secanja, nered } = state.resources;
  return veze + secanja - (nered / 2);
}

/** Sačuvaj state u localStorage */
export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(state));
  } catch (e) {
    // silent fail — private browsing ili pun storage
  }
}

/** Učitaj state iz localStorage, ili null */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Validacija osnovnih polja
    if (!parsed.resources || parsed.currentHourIndex === undefined) return null;
    return parsed;
  } catch (e) {
    return null;
  }
}

/** Briši state iz localStorage */
export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
  } catch (e) {}
}

/** Sačuvaj prestige info */
export function savePrestige(data) {
  try {
    localStorage.setItem(STORAGE_KEYS.PRESTIGE, JSON.stringify(data));
  } catch (e) {}
}

/** Učitaj prestige info */
export function loadPrestige() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRESTIGE);
    if (!raw) return { unlocked: false, count: 0 };
    return JSON.parse(raw);
  } catch (e) {
    return { unlocked: false, count: 0 };
  }
}

/** Sačuvaj achievements */
export function saveAchievements(earned) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(earned));
  } catch (e) {}
}

/** Učitaj achievements */
export function loadAchievements() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

/** Broj sati do kraja */
export function hoursLeft(state) {
  return HOURS.length - state.currentHourIndex;
}

/** Trenutni sat kao broj */
export function currentHour(state) {
  return HOURS[state.currentHourIndex] || 19;
}
