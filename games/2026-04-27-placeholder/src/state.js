/**
 * @file state.js
 * @description Game state shape, factory, save/load za Frekventni Grad.
 *              Koristi localStorage key iz CONFIG.SAVE_KEY.
 *
 * gamePhase vrednosti: 'menu' | 'playing' | 'paused' | 'night_summary' | 'game_over'
 */

import { CONFIG } from './config.js';

/**
 * @typedef {Object} BeatCircle
 * @property {number} id           - Jedinstveni ID (monotono raste)
 * @property {number} lane         - 0 | 1 | 2
 * @property {number} scheduledTime - AudioContext.currentTime kada beat stigne na timing liniju
 * @property {'active'|'hit'|'missed'} state
 * @property {'PERFECT'|'GOOD'|'MISS'|null} hitResult
 * @property {number} visualProgress - 0 (spawn vrh) → 1 (timing linija)
 * @property {number} hitRingAge   - sekunde od hita (za sonar ring animaciju), -1 = ne animira
 */

/**
 * @typedef {Object} GameState
 * @property {number} version
 * @property {'menu'|'playing'|'paused'|'night_summary'|'game_over'} gamePhase
 * @property {number} currentClub   - 0–3 (Podrum / Krov / Metro / Orbita)
 * @property {number} currentNight  - 0–4 (unutar kluba)
 * @property {number} currentSong   - 0–2 (unutar noći)
 * @property {number} score
 * @property {number} combo         - uzastopni PERFECT+GOOD bez MISS-a
 * @property {number} multiplier    - 1–4
 * @property {number} energy        - 0–100 (%)
 * @property {BeatCircle[]} activeBeats
 * @property {number} schedulerHead - AudioContext.currentTime do kojeg je scheduler već schedlovao
 * @property {number} songStartTime - AudioContext.currentTime kada je pesma počela
 * @property {number} nextBeatId    - monotoni counter
 * @property {number} totalNightsPlayed - za prestige check
 * @property {number} prestigeLevel - 0 = base; +1 za svaki prestige
 * @property {string|null} lastHitResult - 'PERFECT'|'GOOD'|'MISS'|null (za HUD flash)
 * @property {number} lastHitTime   - performance.now() poslednjeg hita (za fade)
 * @property {Object} nightSummary  - statistike za night_summary ekran
 */

const STATE_VERSION = 1;

/**
 * Kreira prazan, validan game state.
 * @returns {GameState}
 */
export function createState() {
  return {
    version: STATE_VERSION,
    gamePhase: 'menu',

    currentClub: 0,
    currentNight: 0,
    currentSong: 0,

    score: 0,
    combo: 0,
    multiplier: 1,
    energy: CONFIG.ENERGY_START,

    activeBeats: [],
    schedulerHead: 0,
    songStartTime: 0,
    nextBeatId: 0,

    totalNightsPlayed: 0,
    prestigeLevel: 0,

    lastHitResult: null,
    lastHitTime: 0,

    nightSummary: {
      perfectCount: 0,
      goodCount: 0,
      missCount: 0,
      scoreGained: 0,
      maxCombo: 0
    }
  };
}

/**
 * Učitava state iz localStorage.
 * Vraća null ako nema save-a ili je verzija nekompatibilna.
 * @returns {GameState|null}
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(CONFIG.SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== STATE_VERSION) return null;
    // activeBeats se ne čuva (runtime only) — resetuj
    parsed.activeBeats = [];
    parsed.schedulerHead = 0;
    parsed.gamePhase = 'menu';
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Snima state u localStorage (preskače runtime-only polja).
 * @param {GameState} state
 */
export function saveState(state) {
  try {
    const toSave = {
      ...state,
      activeBeats: [],       // runtime — ne čuvamo
      schedulerHead: 0,
      gamePhase: 'menu',
      lastHitResult: null
    };
    localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(toSave));
  } catch {
    // quota exceeded ili private mode — ignoriši
  }
}

/**
 * Briše save iz localStorage.
 */
export function resetState() {
  localStorage.removeItem(CONFIG.SAVE_KEY);
}
