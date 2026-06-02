// state.js — game state shape, save/load highscore
import { CONFIG } from './config.js';

// ─── Highscore helpers ─────────────────────────────────────────────────────

/**
 * Učitava highscore listu iz localStorage.
 * Format: [{ score, level, combo, date }]
 * Reset ako je promenjen datum (igra je daily).
 * @returns {Array}
 */
export function loadHighscore() {
  try {
    const raw = localStorage.getItem(CONFIG.LS_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    // Provjera datuma — highscore se resetuje svakog dana
    const today = new Date().toISOString().slice(0, 10);
    if (data.length > 0 && data[0].date && data[0].date !== today) {
      localStorage.removeItem(CONFIG.LS_KEY);
      return [];
    }
    return data.slice(0, CONFIG.HS_TOP_N);
  } catch {
    return [];
  }
}

/**
 * Snima score u top-3 listu, sortiranu silazno.
 * @param {Object} state — ceo game state
 */
export function saveHighscore(state) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const entry = {
      score: state.score,
      level: state.level,
      combo: state.bestCombo,
      date:  today,
    };
    const current = loadHighscore();
    const merged = [...current, entry]
      .sort((a, b) => b.score - a.score)
      .slice(0, CONFIG.HS_TOP_N);
    localStorage.setItem(CONFIG.LS_KEY, JSON.stringify(merged));
    // Azuriraj i state.highscore u mestu
    state.highscore = merged;
  } catch {
    // quota ili private mode — ignoriši
  }
}

// ─── Inicijalni state ──────────────────────────────────────────────────────

/**
 * Kreira svježi state objekat za novu partiju.
 * @returns {Object}
 */
export function initialState() {
  return {
    screen:           'start',   // 'start' | 'playing' | 'levelclear' | 'gameover'
    level:            1,
    score:            0,
    lives:            3,
    streak:           0,
    bestCombo:        0,
    levelScore:       0,
    bags:             [],        // Bag[] za tekući nivo
    activeBagIndex:   0,
    highscore:        loadHighscore(),
    tutorialSeen:     localStorage.getItem(CONFIG.LS_TUTORIAL) === '1',
    firstRunDone:     localStorage.getItem(CONFIG.LS_FIRSTRUN) === '1',
    factIndex:        Math.floor(Math.random() * 4),
    levelClearTimer:  0,
    gameWon:          false,
    // Flags za vizualne efekte
    shakeTimer:       0,         // ms; >0 znači da se shake izvodi
    lastHitType:      null,      // 'green'|'golden'|'fake'|'miss'
    missCount:        0,         // ukupan broj grešaka (za perfect bonus)
  };
}
