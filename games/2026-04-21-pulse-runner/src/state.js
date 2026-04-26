/**
 * state.js — Game state shape i localStorage persistence.
 *
 * Persist-uje se SAMO highScore (broj) — ostalo se gubi na refresh (roguelike).
 * createState() uvek kreira novi run. loadHighScore() čita PB iz localStorage.
 */

import { CONFIG } from './config.js';

/**
 * @typedef {Object} GridCell
 * @property {'empty'|'wall'|'collectible'|'exit'} type
 */

/**
 * @typedef {Object} Position
 * @property {number} row
 * @property {number} col
 */

/**
 * @typedef {Object} GameState
 * @property {number} version - State schema version (za migration)
 * @property {'menu'|'playing'|'gameover'} screen - Trenutni ekran
 * @property {number} level - Trenutni nivo (1-based)
 * @property {number} depth - Broj pređenih nivoa (za score)
 * @property {number} hp - Trenutni HP igrača (1–HP_MAX)
 * @property {number} missCount - Broj uzastopnih miss-a (0–MISS_LIMIT)
 * @property {number} score - Ukupni score ovog run-a
 * @property {number} totalCollected - Ukupno sakupljenih collectibles u runu
 * @property {number} highScore - Personal best (sinhronizovan sa localStorage)
 * @property {GridCell[][]} grid - 2D niz ćelija grida (rows × cols)
 * @property {number} gridSize - Dimenzija grida (NxN)
 * @property {Position} playerPos - Trenutna pozicija igrača
 * @property {Position} exitPos - Pozicija exit ćelije
 * @property {Position[]|null} queuedInput - Čekaući smer kao {row: -1|0|1, col: -1|0|1} ili null
 * @property {number} pulseTimer - Vreme od poslednjeg pulsa (sekunde)
 * @property {number} pulseInterval - Trajanje jednog puls ciklusa (sekunde, iz CONFIG)
 * @property {boolean} inInputWindow - Da li je trenutno otvoren input window (80% ciklusa)
 * @property {boolean} pulseFlash - Da li se prikazuje puls flash overlay
 * @property {number} pulseFlashTimer - Preostalo trajanje flash-a (sekunde)
 * @property {boolean} levelFlash - Da li se prikazuje level transition flash
 * @property {number} levelFlashTimer - Preostalo trajanje level flash-a (sekunde)
 * @property {number} playerPulsePhase - Faza oscilacije igrača (0–2π, za vizuelni puls)
 */

/**
 * Kreira novi game state za novi run.
 * Grid se ne generiše ovde — maze.js to radi i poziva updateGridInState().
 *
 * @returns {GameState}
 */
export function createState() {
  const highScore = loadHighScore();
  return {
    version: 1,
    screen: 'menu',
    level: 1,
    depth: 0,
    hp: CONFIG.HP_START,
    missCount: 0,
    score: 0,
    totalCollected: 0,
    highScore,
    grid: [],
    gridSize: CONFIG.gridSize(1),
    playerPos: { row: 0, col: 0 },
    exitPos: { row: 0, col: 0 },
    queuedInput: null,
    pulseTimer: 0,
    pulseInterval: CONFIG.pulseInterval(1),
    inInputWindow: false,
    pulseFlash: false,
    pulseFlashTimer: 0,
    levelFlash: false,
    levelFlashTimer: 0,
    playerPulsePhase: 0
  };
}

/**
 * Učitava high score iz localStorage.
 * Vraća 0 ako nema podataka ili je localStorage nedostupan.
 *
 * @returns {number}
 */
export function loadHighScore() {
  try {
    const raw = localStorage.getItem(CONFIG.SAVE_KEY);
    if (!raw) return 0;
    const val = parseInt(raw, 10);
    return isNaN(val) ? 0 : val;
  } catch {
    return 0;
  }
}

/**
 * Čuva high score u localStorage ako je novi score bolji.
 * Poziva se na game over.
 *
 * @param {number} score - Score ovog run-a
 * @returns {boolean} true ako je novi personal best
 */
export function saveHighScore(score) {
  try {
    const current = loadHighScore();
    if (score > current) {
      localStorage.setItem(CONFIG.SAVE_KEY, String(score));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Resetuje high score (debug/dev pomoćna funkcija).
 */
export function resetHighScore() {
  try {
    localStorage.removeItem(CONFIG.SAVE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Izračunava score iz depth i totalCollected.
 * Formula: depth * SCORE_PER_DEPTH + totalCollected * SCORE_PER_COLLECTIBLE
 *
 * @param {number} depth
 * @param {number} totalCollected
 * @returns {number}
 */
export function calcScore(depth, totalCollected) {
  return depth * CONFIG.SCORE_PER_DEPTH + totalCollected * CONFIG.SCORE_PER_COLLECTIBLE;
}
