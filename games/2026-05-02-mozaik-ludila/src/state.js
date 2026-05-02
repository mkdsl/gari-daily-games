// state.js — Game state shape, save/load/reset u localStorage
import { GRID_ROWS, GRID_COLS, SAVE_KEY, HIGHSCORE_KEY } from './config.js';

/**
 * Kreira prazan inicijalni state za novu sesiju.
 * @returns {GameState}
 */
export function createInitialState() {
  return {
    // Grid 8×8: null = prazno, string (hex boja) = popunjeno
    grid: Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(null)),

    score: 0,
    combo: 0,           // broj uzastopnih match poteza (0 = nema aktivnog komboa)
    gamePhase: 'playing', // 'playing' | 'won' | 'lost'

    // Fragment queue: uvek 3 fragmenta (1 aktivan + 2 peek)
    // Svaki fragment: { shapeId: string, rotationIndex: number, color: string }
    fragmentQueue: [],
    activeFragment: null,     // { shapeId, rotationIndex, color } | null — aktivan, selektovan
    selectedFragment: false,  // da li je aktivan fragment selektovan (kliknut)

    hoverCell: null,    // { row, col } | null — ćelija ispod kursora za ghost preview

    inputBlocked: false,   // true tokom match animacije (INPUT_BLOCK_DURATION ms)
    inputBlockTimer: 0,    // ms preostalo do deblokiranja

    particles: [],      // aktivne čestice: [{ x, y, vx, vy, color, life, maxLife }]

    animations: {
      shakeTimer: 0,    // ms preostalo za shake animaciju grida
      matchFlash: [],   // [{ row, col, timer, maxTimer }] — treperanje pre brisanja
      comboText: null,  // { text: string, timer: number } | null — "COMBO ×N!" prikaz
      comboPulse: 0,    // ms preostalo za zlatni pulse overlay
      winReveal: null,  // { timer: number } | null — win animacija
    },

    // Highscore (ne resetuje se sa resetState, čuva se posebno)
    highScore: 0,
    fastestWinTime: null,  // ms | null

    // Sesija statistika
    sessionStartTime: Date.now(),
    stats: {
      totalMatches: 0,
      maxCombo: 0,
      placedFragments: 0,
      totalMoves: 0,
    },
  };
}

/**
 * Čuva state u localStorage. Čuva samo ako je gamePhase === 'playing'.
 * @param {GameState} state
 */
export function saveState(state) {
  if (state.gamePhase !== 'playing') return;
  try {
    // Serialize samo relevantne delove — particles i animations su tranzijentni
    const toSave = {
      version: 1,
      grid: state.grid,
      score: state.score,
      combo: state.combo,
      gamePhase: state.gamePhase,
      fragmentQueue: state.fragmentQueue,
      activeFragment: state.activeFragment,
      selectedFragment: state.selectedFragment,
      stats: state.stats,
      sessionStartTime: state.sessionStartTime,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
  } catch {
    // Quota exceeded ili private mode — tiho ignorisati
  }
}

/**
 * Učitava state iz localStorage. Vraća null ako nema validnog save-a.
 * @returns {GameState|null}
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== 1) return null;
    if (parsed.gamePhase !== 'playing') return null;

    // Merge sa fresh state-om da dobijemo sve tranzijentne fieldove
    const fresh = createInitialState();
    return {
      ...fresh,
      grid: parsed.grid,
      score: parsed.score,
      combo: parsed.combo,
      gamePhase: parsed.gamePhase,
      fragmentQueue: parsed.fragmentQueue ?? [],
      activeFragment: parsed.activeFragment ?? null,
      selectedFragment: parsed.selectedFragment ?? false,
      stats: { ...fresh.stats, ...(parsed.stats ?? {}) },
      sessionStartTime: parsed.sessionStartTime ?? Date.now(),
    };
  } catch {
    return null;
  }
}

/**
 * Briše save iz localStorage i vraća svež initial state.
 * @returns {GameState}
 */
export function resetState() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // ignore
  }
  return createInitialState();
}

/**
 * Čuva highscore u localStorage (odvojeno od game state-a).
 * @param {number} score
 * @param {number|null} winTimeMs — vreme sesije u ms, ili null ako nije win
 */
export function saveHighScore(score, winTimeMs) {
  try {
    const existing = loadHighScore();
    const newHigh = Math.max(existing.score, score);
    let newFastest = existing.fastestWinTime;
    if (winTimeMs !== null) {
      newFastest = newFastest === null ? winTimeMs : Math.min(newFastest, winTimeMs);
    }
    localStorage.setItem(HIGHSCORE_KEY, JSON.stringify({
      score: newHigh,
      fastestWinTime: newFastest,
    }));
  } catch {
    // ignore
  }
}

/**
 * Učitava highscore iz localStorage.
 * @returns {{ score: number, fastestWinTime: number|null }}
 */
export function loadHighScore() {
  try {
    const raw = localStorage.getItem(HIGHSCORE_KEY);
    if (!raw) return { score: 0, fastestWinTime: null };
    const parsed = JSON.parse(raw);
    return {
      score: parsed.score ?? 0,
      fastestWinTime: parsed.fastestWinTime ?? null,
    };
  } catch {
    return { score: 0, fastestWinTime: null };
  }
}

/**
 * @typedef {Object} Fragment
 * @property {string} shapeId — ključ u SHAPES objektu (npr. 'L', 'I3', 'Single')
 * @property {number} rotationIndex — trenutna rotacija (0-indexed)
 * @property {string} color — hex boja (npr. '#e07b54')
 */

/**
 * @typedef {Object} GameState
 * @property {(string|null)[][]} grid
 * @property {number} score
 * @property {number} combo
 * @property {'playing'|'won'|'lost'} gamePhase
 * @property {Fragment[]} fragmentQueue
 * @property {Fragment|null} activeFragment
 * @property {boolean} selectedFragment
 * @property {{row:number,col:number}|null} hoverCell
 * @property {boolean} inputBlocked
 * @property {number} inputBlockTimer
 * @property {Object[]} particles
 * @property {Object} animations
 * @property {number} highScore
 * @property {number|null} fastestWinTime
 * @property {number} sessionStartTime
 * @property {Object} stats
 */
